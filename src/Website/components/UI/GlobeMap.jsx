import React, { useState } from "react";
import { MapContainer, TileLayer, Marker as LeafletMarker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink } from "lucide-react";

// Custom Leaflet Icon mimicking the premium theme
const customIcon = L.divIcon({
  className: "custom-neon-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: `
    <div style="position: relative; width: 16px; height: 16px; cursor: pointer;">
      <div style="position: absolute; top: 0; left: 0; width: 16px; height: 16px; border: 2px solid #FFBF00; box-sizing: border-box; transition: transform 0.3s; border-radius: 50%; box-shadow: 0 0 10px #FFBF00;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>
      <div style="position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; background-color: #FFBF00; border-radius: 50%;"></div>
      <div style="position: absolute; top: -2px; left: 24px; font-family: Outfit, sans-serif; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 700; pointer-events: none; white-space: nowrap; text-shadow: 0px 2px 4px rgba(0,0,0,0.8);">
        Prudentia College of Law
      </div>
    </div>
  `
});

export default function GlobeMap() {
  const position = [17.3195, 78.5367]; // Hyderabad / Gurramguda

  const openGoogleMaps = () => {
    window.open("https://maps.google.com/?q=Prudentia+College+of+Law+Gurramguda+Hyderabad", "_blank");
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-color)] overflow-hidden rounded-[2rem] relative group border border-[var(--card-border)]">
      
      {/* Dark Map Base */}
      <style>
        {`
          .dark-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%);
          }
          .leaflet-control-zoom a {
            background-color: var(--card-bg) !important;
            color: var(--primary-color) !important;
            border: 1px solid var(--card-border) !important;
          }
          .leaflet-control-zoom a:hover {
            background-color: var(--primary-color) !important;
            color: #000 !important;
          }
        `}
      </style>
      
      <div className="absolute inset-0 z-0 [&_.leaflet-container]:bg-[var(--bg-color)]">
        <MapContainer 
          center={position} 
          zoom={14} 
          scrollWheelZoom={'center'} // Only zoom directly into the center
          dragging={false}           // Lock panning completely
          doubleClickZoom={'center'} // Lock double click zooming to center
          style={{ width: "100%", height: "100%", background: "var(--bg-color)" }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Custom positioned zoom control */}
          <ZoomControl position="bottomleft" />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-tiles"
          />
          
          <LeafletMarker 
            position={position} 
            icon={customIcon}
            eventHandlers={{
              click: openGoogleMaps,
            }}
          />
        </MapContainer>
      </div>

      

    </div>
  );
}
