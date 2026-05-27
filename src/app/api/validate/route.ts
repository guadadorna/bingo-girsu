import { NextResponse } from "next/server";
import { updateClaimStatus, getSlotState } from "@/lib/kv";
import { getPusherServer, CHANNEL, EVENTS } from "@/lib/pusher-server";
import type { ClaimStatus } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: ClaimStatus;
      judgeNote?: string;
    };

    if (!body.id || (body.status !== "approved" && body.status !== "rejected")) {
      return NextResponse.json(
        { error: "Parametros invalidos" },
        { status: 400 }
      );
    }

    const updated = await updateClaimStatus(
      body.id,
      body.status,
      body.judgeNote?.slice(0, 500)
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Claim no encontrado" },
        { status: 404 }
      );
    }

    const newSlots = await getSlotState();

    const pusher = getPusherServer();
    if (pusher) {
      await Promise.all([
        pusher.trigger(CHANNEL, EVENTS.VALIDATED, updated),
        pusher.trigger(CHANNEL, EVENTS.SLOTS_UPDATED, newSlots),
      ]);
    }

    return NextResponse.json({ claim: updated, slots: newSlots });
  } catch (e) {
    console.error("validate error", e);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
