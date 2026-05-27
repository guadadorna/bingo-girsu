"use client";

import PusherClient from "pusher-js";

let cached: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (cached) return cached;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  cached = new PusherClient(key, {
    cluster,
  });

  return cached;
}

export const CHANNEL = "bingo-girsu";
export const EVENTS = {
  CLAIMED: "claim:new",
  VALIDATED: "claim:validated",
} as const;
