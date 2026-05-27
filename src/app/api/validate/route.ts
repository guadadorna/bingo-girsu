import { NextResponse } from "next/server";
import { updateClaimStatus, kvAvailable } from "@/lib/kv";
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
        { error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    if (!kvAvailable()) {
      return NextResponse.json(
        { error: "Persistencia no configurada" },
        { status: 500 }
      );
    }

    const updated = await updateClaimStatus(
      body.id,
      body.status,
      body.judgeNote?.slice(0, 500)
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Bingo no encontrado" },
        { status: 404 }
      );
    }

    const pusher = getPusherServer();
    if (pusher) {
      await pusher.trigger(CHANNEL, EVENTS.VALIDATED, updated);
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error("validate error", e);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
