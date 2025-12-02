console.log("🔥 DEVICE PAGE LOADED ON SERVER");


import { fetchAPI } from "@/lib/api";
import DeviceMap from "@/components/DeviceMap";
import Link from "next/link";

interface DeviceEvent {
  id: number;
  device_id: string;
  latitude: number | null;
  longitude: number | null;
  mac_addresses: string[];
  timestamp: string;
}

interface DeviceStatus {
  device_id: string;
  last_seen: string;
}

export default async function DeviceDetail({ params }: { params: { id: string } }) {
  const id = params.id;

  // -------- Fetch Device Status --------
  let device: DeviceStatus | null = null;
  try {
    device = await fetchAPI(`/device/${id}/status`);
  } catch (err) {
    console.error("Status error:", err);
  }

  // -------- Fetch Events --------
  let events: DeviceEvent[] = [];
  try {
    const res = await fetchAPI(`/device/${id}/events`);
    if (Array.isArray(res)) events = res;
  } catch (err) {
    console.error("Event error:", err);
  }

  const latest = events.length > 0 ? events[0] : null;

  return (
    <main style={{ padding: "24px" }}>
      <Link href="/devices" className="text-blue-600 underline">
        ← Back to Devices
      </Link>

      <h1 className="text-3xl font-bold mt-6 mb-4">
        Device: {id}{" "}
        <span className="text-red-600 text-xl font-semibold">● LIVE</span>
      </h1>

      {!latest && <p>Waiting for first GPS coordinates…</p>}

      {latest && (
        <>
          <h2 className="mt-4 text-xl font-semibold">Latest Event</h2>
          <p className="mt-1 opacity-80">
            {latest.timestamp}
          </p>
          <p className="mt-1">
            Lat: {latest.latitude} <br />
            Lon: {latest.longitude}
          </p>

          <div className="mt-6">
            <DeviceMap
              latitude={latest.latitude}
              longitude={latest.longitude}
              deviceId={id}
              points={events.map(e => ({
                latitude: e.latitude!,
                longitude: e.longitude!,
              }))}
            />
          </div>
        </>
      )}
    </main>
  );
}
