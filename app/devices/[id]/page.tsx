"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DeviceMap from "@/components/DeviceMap";

interface DeviceEvent {
  id: number;
  device_id: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

export default function DeviceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [events, setEvents] = useState<DeviceEvent[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(
          `https://api.oathzsecurity.com/device/${id}/events`,
          { cache: "no-store" }
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1 className="text-3xl font-bold">Device: {id}</h1>
        <p>Loading events…</p>
      </main>
    );
  }

  if (!events || events.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1 className="text-3xl font-bold">Device: {id}</h1>
        <p>No events found yet for this device.</p>
      </main>
    );
  }

  // Latest event is the LAST one in the array (ASC order)
  const latest = events[events.length - 1];

  return (
    <main style={{ padding: 24 }}>
      <h1 className="text-3xl font-bold mb-4">Device: {id}</h1>

      <div style={{ marginTop: 24 }}>
        <DeviceMap
          latitude={latest.latitude}
          longitude={latest.longitude}
          deviceId={id}
        />
      </div>

      <h2 className="text-xl font-bold mt-10">Latest Event</h2>
      <pre
        style={{
          marginTop: 12,
          padding: 16,
          background: "#111",
          color: "#0f0",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {JSON.stringify(latest, null, 2)}
      </pre>

      <h2 className="text-xl font-bold mt-10">
        All Events ({events.length})
      </h2>
      <pre
        style={{
          marginTop: 12,
          padding: 16,
          background: "#111",
          color: "#0f0",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {JSON.stringify(events, null, 2)}
      </pre>
    </main>
  );
}
