"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons on Vercel
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  latitude: number | null;
  longitude: number | null;
  deviceId: string;
  points?: { latitude: number; longitude: number }[]; // <-- NEW
}

export default function DeviceMap({
  latitude,
  longitude,
  deviceId,
  points = [],
}: Props) {
  useEffect(() => {
    if (!latitude || !longitude) return;

    const map = L.map("device-map").setView([latitude, longitude], 17);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Latest location marker
    const marker = L.marker([latitude, longitude]).addTo(map);

    // Breadcrumb polyline
    if (points.length > 1) {
      const polylinePoints = points.map((p) => [p.latitude, p.longitude]) as [
        number,
        number
      ][];

      L.polyline(polylinePoints, {
        color: "red",
        weight: 3,
        opacity: 0.8,
      }).addTo(map);
    }

    return () => {
      map.remove();
    };
  }, [latitude, longitude, points]);

  return (
    <div
      id="device-map"
      className="w-full"
      style={{
        height: "420px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #333",
      }}
    />
  );
}
