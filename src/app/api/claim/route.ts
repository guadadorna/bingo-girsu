import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { saveClaim, kvAvailable } from "@/lib/kv";
import { getPusherServer, CHANNEL, EVENTS } from "@/lib/pusher-server";
import { findFicha } from "@/lib/fichas";
import { getWinningLine } from "@/lib/bingo-card";
import type { Claim } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nickname?: string;
      fichaId?: string;
      markedCells?: number[];
      conversation?: string;
    };

    const nickname = body.nickname?.trim();
    const fichaId = body.fichaId;
    const markedCells = Array.isArray(body.markedCells) ? body.markedCells : [];
    const conversation = body.conversation?.trim();

    if (!nickname || !fichaId || !conversation) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    const ficha = findFicha(fichaId);
    if (!ficha) {
      return NextResponse.json(
        { error: "Ficha inválida" },
        { status: 400 }
      );
    }

    const winningLine = getWinningLine(markedCells);
    if (!winningLine) {
      return NextResponse.json(
        { error: "El cartón no tiene bingo" },
        { status: 400 }
      );
    }

    const claim: Claim = {
      id: randomUUID(),
      nickname: nickname.slice(0, 30),
      fichaId,
      fichaTitle: ficha.title,
      markedCells,
      winningLine,
      conversation: conversation.slice(0, 50000),
      claimedAt: Date.now(),
      status: "pending",
    };

    if (kvAvailable()) {
      await saveClaim(claim);
    }

    const pusher = getPusherServer();
    if (pusher) {
      await pusher.trigger(CHANNEL, EVENTS.CLAIMED, claim);
    }

    return NextResponse.json(claim);
  } catch (e) {
    console.error("claim error", e);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
