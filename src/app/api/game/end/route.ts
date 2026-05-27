import { NextResponse } from "next/server";
import { setGame, getGame, getSlotState } from "@/lib/kv";
import { getPusherServer, CHANNEL, EVENTS } from "@/lib/pusher-server";

export async function POST() {
  const current = await getGame();
  if (current.status === "ended") {
    return NextResponse.json(current);
  }
  const next = { status: "ended" as const, endedAt: Date.now() };
  await setGame(next);
  const slots = await getSlotState();

  const pusher = getPusherServer();
  if (pusher) {
    await Promise.all([
      pusher.trigger(CHANNEL, EVENTS.GAME_ENDED, next),
      pusher.trigger(CHANNEL, EVENTS.SLOTS_UPDATED, slots),
    ]);
  }

  return NextResponse.json(next);
}
