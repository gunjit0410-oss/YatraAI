/**
 * YatraAI - Nearby Economic Hotels & Stay Recommendations Module
 */

document.addEventListener("DOMContentLoaded", function () {
    initNearbyHotels();
});

function initNearbyHotels() {
    const wrappers = document.querySelectorAll(".spot-hotels-wrapper");
    if (!wrappers.length) return;

    wrappers.forEach((wrapper, index) => {
        const spotName = wrapper.dataset.spotName || "Attraction Spot";
        const lat = wrapper.dataset.lat || "";
        const lng = wrapper.dataset.lng || "";
        const placeId = wrapper.dataset.placeId || "";

        // Structure interior HTML of wrapper if empty
        if (!wrapper.querySelector(".hotels-toggle-bar")) {
            wrapper.innerHTML = `
                <div class="hotels-toggle-bar d-flex flex-wrap justify-content-between align-items-center py-2 px-3 bg-light rounded-3 border">
                    <button class="btn btn-sm text-dark fw-bold border-0 p-0 d-flex align-items-center gap-2 toggle-hotels-btn" type="button" data-bs-toggle="collapse" data-bs-target="#hotels-collapse-${index}" aria-expanded="false">
                        <span class="badge bg-warning text-dark me-1"><i class="fas fa-hotel"></i></span>
                        <span class="fs-6 fw-bold">🏨 Nearby Economic Stays</span>
                        <span class="badge bg-secondary-subtle text-dark rounded-pill hotels-count-badge">Show Stays</span>
                        <i class="fas fa-chevron-down ms-1 text-muted transition-icon"></i>
                    </button>
                    
                    <div class="hotels-sort-controls d-none align-items-center gap-2 ms-auto mt-2 mt-sm-0">
                        <small class="text-muted fw-semibold">Sort by:</small>
                        <select class="form-select form-select-sm rounded-pill py-1 px-3 small border-warning hotels-sort-select" style="width: auto; font-size: 0.8rem;">
                            <option value="distance" selected>Nearest</option>
                            <option value="price">Lowest Price</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <div class="collapse mt-3 hotels-collapse-body" id="hotels-collapse-${index}">
                    <div class="hotels-grid row g-3">
                        ${renderHotelSkeletons(2)}
                    </div>
                </div>
            `;
        }

        const toggleBtn = wrapper.querySelector(".toggle-hotels-btn");
        const collapseBody = wrapper.querySelector(`.hotels-collapse-body`);
        const sortSelect = wrapper.querySelector(".hotels-sort-select");
        const countBadge = wrapper.querySelector(".hotels-count-badge");
        const sortControls = wrapper.querySelector(".hotels-sort-controls");
        const grid = wrapper.querySelector(".hotels-grid");

        let loadedData = null;

        function loadHotels(sortBy = "distance") {
            grid.innerHTML = renderHotelSkeletons(2);
            
            const params = new URLSearchParams({
                place_name: spotName,
                lat: lat,
                lng: lng,
                place_id: placeId,
                sort: sortBy,
                radius: "5.0"
            });

            fetch(`/api/nearby-hotels/?${params.toString()}`)
                .then(res => {
                    if (!res.ok) throw new Error("Server response error");
                    return res.json();
                })
                .then(data => {
                    if (data.success && data.hotels && data.hotels.length > 0) {
                        loadedData = data.hotels;
                        countBadge.textContent = `${data.total_found} stays nearby`;
                        countBadge.className = "badge bg-success-subtle text-success border border-success rounded-pill";
                        sortControls.classList.remove("d-none");
                        sortControls.classList.add("d-flex");
                        renderHotelsList(grid, data.hotels, spotName);
                    } else {
                        countBadge.textContent = "0 stays found";
                        grid.innerHTML = `
                            <div class="col-12 text-center py-3 text-muted">
                                <i class="fas fa-bed fa-2x mb-2 text-warning"></i>
                                <p class="small mb-0">No budget hotels recorded right at this spot location.</p>
                            </div>
                        `;
                    }
                })
                .catch(err => {
                    console.error("Error fetching nearby hotels:", err);
                    countBadge.textContent = "Error loading";
                    grid.innerHTML = `
                        <div class="col-12 text-center py-3 text-danger">
                            <p class="small mb-0"><i class="fas fa-exclamation-triangle me-1"></i> Could not load hotels. Please try again.</p>
                        </div>
                    `;
                });
        }

        // Lazy load on first expand click
        let hasFetched = false;
        toggleBtn.addEventListener("click", function () {
            const icon = this.querySelector(".transition-icon");
            if (icon) {
                icon.classList.toggle("rotate-180");
            }
            if (!hasFetched) {
                hasFetched = true;
                loadHotels("distance");
            }
        });

        // Re-sort handler
        if (sortSelect) {
            sortSelect.addEventListener("change", function () {
                const sortBy = this.value;
                loadHotels(sortBy);
            });
        }
    });
}

function renderHotelSkeletons(count = 2) {
    let skeletons = "";
    for (let i = 0; i < count; i++) {
        skeletons += `
            <div class="col-12 col-md-6">
                <div class="card border rounded-3 p-3 shadow-sm placeholder-glow bg-white h-100">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="placeholder col-6 rounded"></span>
                        <span class="placeholder col-3 rounded"></span>
                    </div>
                    <p class="placeholder col-9 rounded mb-2"></p>
                    <div class="d-flex gap-2 mb-3">
                        <span class="placeholder col-3 rounded-pill py-2"></span>
                        <span class="placeholder col-3 rounded-pill py-2"></span>
                    </div>
                    <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                        <span class="placeholder col-4 rounded py-2"></span>
                        <span class="placeholder col-4 rounded-pill py-2"></span>
                    </div>
                </div>
            </div>
        `;
    }
    return skeletons;
}

function renderHotelsList(container, hotels, spotName) {
    let html = "";
    hotels.forEach(hotel => {
        const amenitiesBadges = (hotel.amenities || []).slice(0, 3).map(a => 
            `<span class="badge bg-light text-dark border small me-1 mb-1 fw-normal"><i class="fas fa-check text-success me-1"></i>${a}</span>`
        ).join("");

        html += `
            <div class="col-12 col-md-6">
                <div class="card border rounded-3 shadow-sm h-100 hotel-recommendation-card transition-all">
                    <div class="card-body p-3 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="fw-bold text-dark mb-0 text-truncate me-2" title="${hotel.name}">
                                🏨 ${hotel.name}
                            </h6>
                            <span class="badge bg-warning text-dark fw-bold px-2 py-1 flex-shrink-0">
                                ★ ${hotel.rating}
                            </span>
                        </div>

                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="badge bg-${hotel.distance_badge || 'success'}-subtle text-${hotel.distance_badge || 'success'} border border-${hotel.distance_badge || 'success'} rounded-pill extra-small">
                                <i class="fas fa-location-dot me-1"></i> ${hotel.distance_display}
                            </span>
                            <span class="badge bg-secondary-subtle text-dark rounded-pill extra-small">
                                ${hotel.category}
                            </span>
                        </div>

                        <p class="small text-muted mb-2 lh-sm text-truncate-2" style="font-size: 0.82rem;">
                            ${hotel.description}
                        </p>

                        <div class="mb-3">
                            ${amenitiesBadges}
                        </div>

                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fs-6 fw-extrabold text-primary">${hotel.price_display}</span>
                                <span class="small text-muted d-block" style="font-size: 0.72rem;">per night (approx)</span>
                            </div>

                            <a href="${hotel.maps_url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-warning text-dark fw-bold rounded-pill px-3 py-1">
                                <i class="fas fa-map-location-dot me-1"></i> View / Book
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
