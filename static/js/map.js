/**
 * YatraAI Leaflet Map Integration Utility
 * Handles interactive route maps, marker focusing, custom numbered pins, and single location view maps.
 */

// Global leaflet default icon fallback fix for CDN loading
if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

/**
 * Creates a high-definition, 100% free tile layer with NO API key requirements.
 * Uses Esri World Street Map tiles which support full zoom levels 0-19 across India.
 */
function createYatraTileLayer() {
    const esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    return L.tileLayer(esriUrl, {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
        maxZoom: 19,
        minZoom: 3
    });
}

/**
 * Initializes full multi-stop journey map for itinerary view.
 * @param {string} elementId - ID of map container div (e.g., 'map')
 * @param {Array} placesData - Array of place objects [{id, name, city, lat, lng, category, image, cost}]
 */
function initYatraMap(elementId, placesData) {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) {
        console.warn(`[YatraMap] Map element #${elementId} not found in DOM.`);
        return null;
    }

    if (!placesData || !Array.isArray(placesData) || placesData.length === 0) {
        console.warn("[YatraMap] No places data available for map initialization.");
        mapElement.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted bg-white rounded-4 border p-4 text-center">
                <i class="fas fa-map-location-dot text-warning fa-2x mb-2"></i>
                <h6 class="fw-bold mb-1">Map Preview Unavailable</h6>
                <p class="small mb-0 text-secondary">No valid coordinate markers are available for this journey selection.</p>
            </div>`;
        return null;
    }

    // Filter valid coordinate entries
    const validPlaces = placesData.filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng));

    if (validPlaces.length === 0) {
        console.warn("[YatraMap] No valid numeric coordinates found in places data.");
        return null;
    }

    // Safely cleanup existing Leaflet map instance on container if present
    if (mapElement._leaflet_id) {
        mapElement._leaflet_id = null;
        mapElement.innerHTML = '';
    }

    const firstPlace = validPlaces[0];
    const map = L.map(elementId, {
        scrollWheelZoom: true,   // Full mouse scroll zoom enabled
        doubleClickZoom: true,   // Double click zoom enabled
        touchZoom: true,         // Touch pinch zoom enabled
        zoomControl: true        // Show + and - zoom controls
    }).setView([firstPlace.lat, firstPlace.lng], 8);

    // Add high-definition, keyless tile layer
    createYatraTileLayer().addTo(map);

    const bounds = L.latLngBounds();
    const routeCoords = [];
    const markersMap = {};

    validPlaces.forEach((place, idx) => {
        const latLng = [place.lat, place.lng];
        routeCoords.push(latLng);
        bounds.extend(latLng);

        // Custom Numbered Leaflet Marker Pin (Incredible India Theme)
        const customIcon = L.divIcon({
            className: 'custom-yatra-icon',
            html: `<div class="yatra-marker-pin" id="marker-pin-${place.id || idx}"><span>${idx + 1}</span></div>`,
            iconSize: [34, 42],
            iconAnchor: [17, 42],
            popupAnchor: [0, -36]
        });

        // Popup Content
        const popupHtml = `
            <div class="popup-card-content" style="max-width: 220px;">
                ${place.image ? `<img src="${place.image}" style="width:100%; height:110px; object-fit:cover; border-radius:0.5rem; margin-bottom:0.5rem;" alt="${place.name}">` : ''}
                <div style="font-weight:700; color:#0f172a; font-size:0.92rem; margin-bottom:0.25rem;">
                    #${idx + 1} ${place.name}
                </div>
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:0.35rem;">
                    <i class="fas fa-location-dot text-danger me-1"></i> ${place.city || ''}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
                    <span class="badge bg-primary" style="font-size:0.7rem;">${place.category || 'Tourist Spot'}</span>
                    <strong style="color:#059669;">₹${place.cost || 0}</strong>
                </div>
            </div>
        `;

        const marker = L.marker(latLng, { icon: customIcon })
            .addTo(map)
            .bindPopup(popupHtml);

        if (place.id !== undefined && place.id !== null) {
            markersMap[String(place.id)] = { marker: marker, latLng: latLng, name: place.name };
        }
    });

    // Draw route polyline connecting sequence of itinerary places
    if (routeCoords.length > 1) {
        L.polyline(routeCoords, {
            color: '#ff6f00',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8',
            lineCap: 'round'
        }).addTo(map);
    }

    // Fit map bounds smoothly
    if (validPlaces.length === 1) {
        map.setView(routeCoords[0], 12);
    } else {
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }

    // Force Leaflet tile recalculation after layout positioning finishes
    setTimeout(() => {
        map.invalidateSize();
    }, 250);

    // Handle responsive window resizes
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    // Global focus helper called by "View Journey on Map" buttons
    window.focusPlaceMarker = function(placeId) {
        const key = String(placeId);
        if (markersMap[key]) {
            const target = markersMap[key];
            map.flyTo(target.latLng, 14, { duration: 1.2 });
            setTimeout(() => {
                target.marker.openPopup();
            }, 600);

            // If on mobile screen, scroll map container smoothly into view
            if (window.innerWidth < 992) {
                mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            console.warn(`[YatraMap] Place ID ${placeId} not found on current map.`);
        }
    };

    return map;
}

/**
 * Initializes a single place map for place detail view.
 * @param {string} elementId - Map element ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} name - Place Name
 * @param {string} city - Place City
 */
function initSinglePlaceMap(elementId, lat, lng, name, city) {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) return null;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        console.warn("[YatraMap] Invalid lat/lng for single place map.");
        mapElement.innerHTML = `
            <div class="d-flex align-items-center justify-content-center h-100 text-muted p-4 text-center small bg-white border rounded-4">
                Location coordinates unavailable.
            </div>`;
        return null;
    }

    // Remove existing instance if present
    if (mapElement._leaflet_id) {
        mapElement._leaflet_id = null;
        mapElement.innerHTML = '';
    }

    const map = L.map(elementId, {
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomControl: true
    }).setView([latitude, longitude], 12);

    createYatraTileLayer().addTo(map);

    const customIcon = L.divIcon({
        className: 'custom-yatra-icon',
        html: `<div class="yatra-marker-pin"><span><i class="fas fa-star" style="font-size:0.75rem;"></i></span></div>`,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -36]
    });

    L.marker([latitude, longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <div style="padding:0.25rem;">
                <strong style="color:#0f172a; font-size:0.95rem; display:block; margin-bottom:0.25rem;">${name}</strong>
                <span style="color:#64748b; font-size:0.8rem;"><i class="fas fa-location-dot text-danger me-1"></i> ${city}</span>
            </div>
        `)
        .openPopup();

    setTimeout(() => {
        map.invalidateSize();
    }, 250);

    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    return map;
}
