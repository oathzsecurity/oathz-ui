"use client";

import React from "react";

interface DeviceMapProps {
  latitude: number | null;
  longitude: number | null;
  deviceId: string;
}

export default function DeviceMap({ latitude, longitude, deviceId }: DeviceMapProps) {
  const hasFix = latitude !== null && longitude !== null;

  return (
    <div className="w-full h-[400px] bg-zinc-800 text-white rounded-lg p-4 flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">
        Live Map – Device {deviceId}
      </h2>

      {!hasFix ? (
        <p className="text-zinc-300">No GPS fix yet…</p>
      ) : (
        <div className="text-center">
          <p>
            <strong>Latitude:</strong> {latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {longitude}
          </p>

          <div className="mt-4 bg-zinc-700 p-6 rounded-lg">
            <p className="text-zinc-300">
              (Map preview placeholder — Google Maps upgrade coming soon!)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
