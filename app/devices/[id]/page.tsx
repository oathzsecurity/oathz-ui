"use client";

import { useEffect, useState } from "react";
import DeviceMap from "@/components/DeviceMap";

interface DeviceEvent {
  device_id: string;
  last_seen: string;
  latitude: number | null;
  longitude: number | null;
  gps_fix: boolean;
  state: string;
  event_type: string;
}

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [events, setEvents] = useState<DeviceEvent[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `https://api.oathzsecurity.com/device/${id}/events`,
          { cache: "no-store" }
        );
        const data = await res.json();

        // Reverse order: latest first
        const sorted = data.reverse();

        setEvents(sorted);
      } catch (err) {
        console.error("Failed to fetch device events", err);
        setEvents([]);
      }
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: "24px" }}>
        <h1 className="text-3xl font-bold mb-6">Device: {id}</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (!events || events.length === 0) {
    return (
      <main style={{ padding: "24px" }}>
        <h1 className="text-3xl font-bold mb-6">Device: {id}</h1>
        <p>No data received yet for this device.</p>
      </main>
    );
  }

  const latest = events[0]; // newest event
  const hasGPS = latest.latitude && latest.longitude;

  return (
    <main style={{ padding: "24px" }}>
      <h1 className="text-3xl font-bold mb-6">Device: {id}</h1>

      {/* 🗺️ MAP */}
      {hasGPS && (
        <div style={{ marginBottom: "24px" }}>
          <DeviceMap
            latitude={latest.latitude}
            longitude={latest.longitude}
            deviceId={id}
          />
        </div>
      )}

      {/* 📊 STATUS */}
      <div className="border rounded-lg p-6 bg-black text-green-400 mb-6">
        <p><strong>Last seen:</strong> {latest.last_seen}</p>
        <p><strong>State:</strong> {latest.state}</p>
        <p><strong>GPS Fix:</strong> {latest.gps_fix ? "Yes" : "No"}</p>
        <p>
          <strong>Coordinates:</strong>{" "}
          {latest.latitude}, {latest.longitude}
        </p>
      </div>

      {/* 📝 RAW EVENTS */}
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: "16px",
          borderRadius: "8px",
          overflowX: "auto",
          fontSize: "14px",
        }}
      >
        {JSON.stringify(events, null, 2)}
      </pre>
    </main>
  );
}
