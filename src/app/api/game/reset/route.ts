import { NextResponse } from "next/server";
import { setGame, getSlotState } from "@/lib/kv";
import { getPusherServer, CHANNEL, EVENTS } from "@/lib/pusher-server";

// Reset solo del estado del juego (vuelve a "playing").
// No borra claims ni jugadores — para eso hay que limpiar la DB a mano.
export async function POST() {
  const next = { status: "playing" as const };
  await setGame(next);
  const slots = await getSlotState();

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger(CHANNEL, EVENTS.SLOTS_UPDATED, slots);
  }
  return NextResponse.json(next);
}
