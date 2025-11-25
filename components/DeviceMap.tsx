"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX LEAFLET ICONS IN NEXT.JS/Vercel ---
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --------------------------------------------------

interface Props {
  latitude: number | null;
  longitude: number | null;
  deviceId: string;
}

export default function DeviceMap({ latitude, longitude, deviceId }: Props) {
  useEffect(() => {
    if (!latitude || !longitude) return;

    const map = L.map("device-map").setView([latitude, longitude], 17);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <div
      id="device-map"
      className="w-full"
      style={{
        height: "400px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #333",
      }}
    />
  );
}
