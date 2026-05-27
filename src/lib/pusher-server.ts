import Pusher from "pusher";

let cached: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (cached) return cached;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  cached = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return cached;
}

export const CHANNEL = "bingo-girsu";
export const EVENTS = {
  CLAIMED: "claim:new",
  VALIDATED: "claim:validated",
  SLOTS_UPDATED: "slots:updated",
  GAME_ENDED: "game:ended",
} as const;
