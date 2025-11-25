"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface DeviceEvent {
  device_id: string;
  last_seen: string;
  latitude: number | null;
  longitude: number | null;
  gps_fix: boolean;
  state: string;
  event_type: string;
}

const DeviceMap = dynamic(() => import("@/components/DeviceMap"), {
  ssr: false,
});

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [events, setEvents] = useState<DeviceEvent[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://api.oathzsecurity.com/device/${id}/events`, {
          cache: "no-store",
        });
        const data = await res.json();
        setEvents(data);
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
        <h1 className="text-3xl font-bold mb-6">{id}</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (!events || events.length === 0) {
    return (
      <main style={{ padding: "24px" }}>
        <h1 className="text-3xl font-bold mb-6">{id}</h1>
        <p>No data received yet for this device.</p>
      </main>
    );
  }

  const latest = events[events.length - 1];

  return (
    <main style={{ padding: "24px" }}>
      <h1 className="text-3xl font-bold mb-6">{id}</h1>

      <div className="border rounded-lg p-6 bg-black text-green-400 space-y-2 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Device Status</h2>
        <p><strong>Last seen:</strong> {latest.last_seen}</p>
        <p><strong>State:</strong> {latest.state}</p>
        <p><strong>GPS Fix:</strong> {latest.gps_fix ? "Yes" : "No"}</p>
        <p><strong>Coordinates:</strong> {latest.latitude}, {latest.longitude}</p>
      </div>

      <div className="w-full h-[400px] mt-6">
        <DeviceMap
          latitude={latest.latitude}
          longitude={latest.longitude}
          deviceId={id}
        />
      </div>

      <div className="p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-900 mt-6">
        <h2 className="text-xl font-semibold mb-4">Event History</h2>

        <div className="flex flex-col gap-2">
          {events.map((evt, index) => (
            <div key={index} className="border-b pb-2 mb-2 text-sm opacity-80">
              <div><strong>Time:</strong> {evt.last_seen}</div>
              <div><strong>State:</strong> {evt.state}</div>
              <div><strong>Event:</strong> {evt.event_type || "n/a"}</div>
              <div>
                <strong>GPS:</strong> {evt.latitude}, {evt.longitude} 
                (fix: {evt.gps_fix ? "yes" : "no"})
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
