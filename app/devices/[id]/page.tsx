import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import DeviceMap from "@/components/DeviceMap";

interface DeviceStatus {
  device_id: string;
  latitude: number | null;
  longitude: number | null;
  last_seen: string | null;
}

interface Props {
  params: { id: string };
}

export default async function DeviceDetailPage({ params }: Props) {
  const id = params.id;

  // FETCH DEVICE STATUS (LATEST GPS POINT)
  const status: DeviceStatus = await fetchAPI(`/device/${id}/status`);

  return (
    <main style={{ padding: "24px" }}>
      <Link href="/devices" className="text-blue-600 underline mb-4 block">
        ← Back to Devices
      </Link>

      <h1 className="text-3xl font-bold mb-4">
        Device:{" "}
        <span className="text-red-600 font-bold">
          ● LIVE
        </span>
      </h1>

      {/* NO GPS YET */}
      {!status.latitude || !status.longitude ? (
        <p>Waiting for first GPS coordinates…</p>
      ) : (
        <>
          <div className="mb-6">
            <strong>Last Seen:</strong> {status.last_seen}
          </div>

          {/* MAP */}
          <DeviceMap
            latitude={status.latitude}
            longitude={status.longitude}
            deviceId={id}
            points={[
              { latitude: status.latitude, longitude: status.longitude }
            ]}
          />
        </>
      )}
    </main>
  );
}
