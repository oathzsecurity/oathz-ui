"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://api.oathzsecurity.com/status");
        const data = await res.json();
        setDevices(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Devices</h1>

      {loading && <p>Loading devices...</p>}

      {!loading && devices.length === 0 && (
        <p>No devices reporting yet.</p>
      )}

      <ul className="space-y-4">
        {devices.map((dev) => (
          <li
            key={dev.device_id}
            className="border p-4 rounded hover:bg-gray-50 dark:hover:bg-zinc-900"
          >
            <Link
              href={`/devices/${dev.device_id}`}
              className="text-blue-600 font-semibold"
            >
              {dev.device_id}
            </Link>
            <p className="text-sm text-gray-600">
              Last seen: {dev.last_seen}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
