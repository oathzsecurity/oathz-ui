"use client";

import { useEffect, useState, useRef } from "react";
import DeviceMap from "@/components/DeviceMap";
import { fetchAPI } from "@/lib/api";

interface DeviceEvent {
  device_id: string;
  latitude: number | null;
  longitude: number | null;
  gps_fix: boolean;
  movement_confirmed: boolean;
  timestamp: string;
  event_type: string;
  state?: string;
}

export default function DeviceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // breadcrumb history = array of { lat, lng }
  const [points, setPoints] = useState<{ latitude: number; longitude: number }[]>(
    []
  );

  // LIVE flashing indicator
  const [isLive, setIsLive] = useState(false);

  // ⚡ polling interval reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------
  // AUTO-FETCH FUNCTION
  // ----------------------------------------
  const loadEvents = async () => {
    try {
      const json = await fetchAPI(`/device/${id}/events`);

      if (json && Array.isArray(json) && json.length > 0) {
        setEvents(json);

        // Update breadcrumb trail
        const valid = json.filter(
          (e) => e.latitude !== null && e.longitude !== null
        );

        setPoints(
          valid.map((e) => ({
            latitude: e.latitude as number,
            longitude: e.longitude as number,
          }))
        );

        // Trigger LIVE flashing
        setIsLive(true);
        setTimeout(() => setIsLive(false), 1200);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // AUTO-REFRESH EVERY 5 SECONDS
  // ----------------------------------------
  useEffect(() => {
    loadEvents(); // initial fetch

    intervalRef.current = setInterval(() => {
      loadEvents();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  // ----------------------------------------
  // Extract latest event
  // ----------------------------------------
  const latest = events.length > 0 ? events[0] : null;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* TITLE + LIVE INDICATOR */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Device: {id}</h1>

        {isLive && (
          <span className="animate-ping h-3 w-3 rounded-full bg-red-500 opacity-75"></span>
        )}

        {!isLive && (
          <span className="h-3 w-3 rounded-full bg-red-600"></span>
        )}

        <span className="text-sm text-red-500 font-semibold">LIVE</span>
      </div>

      {/* MAP */}
      {latest && latest.latitude && latest.longitude ? (
        <DeviceMap
          deviceId={id}
          latitude={latest.latitude}
          longitude={latest.longitude}
          points={points} // breadcrumb trail
        />
      ) : (
        <p className="text-zinc-500 mb-4">Waiting for first GPS coordinates…</p>
      )}

      {/* RAW EVENT STREAM */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Latest Event</h2>

        {loading && <p className="text-zinc-500">Loading…</p>}

        {!loading && !latest && (
          <p className="text-zinc-500">No events found yet for this device.</p>
        )}

        {latest && (
          <pre className="overflow-x-auto bg-black text-green-300 p-4 rounded-lg text-sm">
            {JSON.stringify(latest, null, 2)}
          </pre>
        )}
      </section>

      {/* FULL EVENT LIST */}
      {events.length > 1 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Event History</h2>

          <pre className="overflow-x-auto bg-zinc-900 text-emerald-300 p-4 rounded-lg text-sm">
            {JSON.stringify(events, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
