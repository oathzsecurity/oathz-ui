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

  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------- helpers -------------

  function timeAgo(ts: string) {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  }

  // Haversine distance in meters between two lat/lon points
  function distanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in m
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ------------- data fetching -------------

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(
          `https://api.oathzsecurity.com/device/${id}/events`,
          { cache: "no-store" }
        );
        const data = await res.json();

        // sort oldest → newest
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime()
        );

        setEvents(sorted);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    const interval = setInterval(fetchEvents, 5000); // live polling
    return () => clearInterval(interval);
  }, [id]);

  // ------------- loading / empty states -------------

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Device: {id}</h1>
        <p>Loading events…</p>
      </main>
    );
  }

  if (!events || events.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Device: {id}</h1>
        <p>No events received yet.</p>
      </main>
    );
  }

  // ------------- derive latest + mode -------------

  const gpsEvents = events.filter(
    (e) => e.latitude !== null && e.longitude !== null
  );

  // If for some reason no gps events yet, still show last seen text
  const latest = gpsEvents.length > 0 ? gpsEvents[gpsEvents.length - 1] : events[events.length - 1];

  const latestTs = new Date(latest.timestamp).getTime();
  const ageMs = Date.now() - latestTs;

  // offline if no event in last 20 seconds
  const isOnline = ageMs < 20_000;

  // CHASE MODE: total movement >= 10m
  let isChaseMode = false;
  let breadcrumbPoints: { latitude: number; longitude: number }[] = [];

  if (isOnline && gpsEvents.length >= 2) {
    const first = gpsEvents[0];
    const last = gpsEvents[gpsEvents.length - 1];

    const totalMove = distanceMeters(
      first.latitude as number,
      first.longitude as number,
      last.latitude as number,
      last.longitude as number
    );

    if (totalMove >= 10) {
      isChaseMode = true;
      breadcrumbPoints = gpsEvents.map((e) => ({
        latitude: e.latitude as number,
        longitude: e.longitude as number,
      }));
    }
  }

  // If offline → force no breadcrumb trail
  if (!isOnline) {
    isChaseMode = false;
    breadcrumbPoints = [];
  }

  const hasGPS =
    latest.latitude !== null &&
    latest.longitude !== null &&
    !isNaN(latest.latitude as number) &&
    !isNaN(latest.longitude as number);

  // ------------- render -------------

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        Device: {id}
      </h1>

      <p style={{ marginTop: 4, color: "#888" }}>
        Status:{" "}
        <span
          style={{
            fontWeight: "bold",
            color: isOnline ? "#16a34a" : "#dc2626",
          }}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>{" "}
        · Last seen{" "}
        <span style={{ fontWeight: "bold" }}>
          {timeAgo(latest.timestamp)}
        </span>
      </p>

      <p style={{ marginTop: 4, color: "#888" }}>
        Mode:{" "}
        <span style={{ fontWeight: "bold" }}>
          {isChaseMode ? "CHASE" : "HEARTBEAT"}
        </span>
      </p>

      <div style={{ marginTop: 24 }}>
        {hasGPS ? (
          <DeviceMap
            latitude={latest.latitude as number}
            longitude={latest.longitude as number}
            deviceId={id}
            points={breadcrumbPoints}
          />
        ) : (
          <p>No GPS fix yet for this device.</p>
        )}
      </div>

      <h2
        style={{
          marginTop: 32,
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
        Latest Event
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
        {JSON.stringify(latest, null, 2)}
      </pre>

      <h2
        style={{
          marginTop: 32,
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
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
