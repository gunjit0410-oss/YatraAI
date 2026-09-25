import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapSpot {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
}

interface RouteMapProps {
  spots: MapSpot[];
}

export const RouteMap: React.FC<RouteMapProps> = ({ spots }) => {
  useEffect(() => {
    if (!spots || spots.length === 0) return;

    const firstLat = spots[0].latitude || 26.9124;
    const firstLng = spots[0].longitude || 75.7873;

    // Cleanup previous map instance if initialized
    const container = L.DomUtil.get('leaflet-route-map-container');
    if (container != null) {
      (container as any)._leaflet_id = null;
    }

    const map = L.map('leaflet-route-map-container', {
      center: [firstLat, firstLng],
      zoom: 8,
      zoomControl: true,
    });

    // 100% Free, High-Definition Esri World Street Map Tile Layer (NO API Key Needed)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China, Esri (Thailand), TomTom',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    const points: L.LatLngExpression[] = [];

    spots.forEach((spot, idx) => {
      const lat = spot.latitude;
      const lng = spot.longitude;
      if (lat && lng) {
        points.push([lat, lng]);

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:#d97706; color:#ffffff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:14px; border:2.5px solid #ffffff; box-shadow:0 4px 14px rgba(217,119,6,0.5);">${idx + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #0f172a; font-size: 14px;">Day ${idx + 1}: ${spot.name}</strong>
              <div style="color: #64748b; font-size: 12px; font-weight: 600; margin-top: 2px;">📍 ${spot.city}</div>
            </div>
          `);
      }
    });

    if (points.length > 1) {
      const polyline = L.polyline(points, {
        color: '#d97706',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
    };
  }, [spots]);

  return (
    <div className="w-full h-[420px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative z-0 bg-slate-100">
      <div id="leaflet-route-map-container" className="w-full h-full" />
    </div>
  );
};
