import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  saveClaim,
  getSlotState,
  getAllClaims,
} from "@/lib/kv";
import { getPusherServer, CHANNEL, EVENTS } from "@/lib/pusher-server";
import { findFicha } from "@/lib/fichas";
import { getWinningLine, isFullCard } from "@/lib/bingo-card";
import { SCORING } from "@/lib/scoring";
import type { Claim, ClaimType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      playerId?: string;
      nickname?: string;
      fichaId?: string;
      type?: ClaimType;
      markedCells?: number[];
      conversation?: string;
    };

    const playerId = body.playerId?.trim();
    const nickname = body.nickname?.trim();
    const fichaId = body.fichaId;
    const type = body.type;
    const markedCells = Array.isArray(body.markedCells) ? body.markedCells : [];
    const conversation = body.conversation?.trim() ?? "";

    if (!playerId || !nickname || !fichaId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (type !== "linea" && type !== "bingo") {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    const ficha = findFicha(fichaId);
    if (!ficha) {
      return NextResponse.json({ error: "Ficha invalida" }, { status: 400 });
    }

    // Validar que efectivamente tiene linea / bingo
    let winningCells: number[];
    if (type === "linea") {
      const line = getWinningLine(markedCells);
      if (!line) {
        return NextResponse.json(
          { error: "No tenes una linea completa" },
          { status: 400 }
        );
      }
      winningCells = line;
    } else {
      if (!isFullCard(markedCells)) {
        return NextResponse.json(
          { error: "No tenes el carton completo" },
          { status: 400 }
        );
      }
      winningCells = Array.from({ length: 9 }, (_, i) => i);
    }

    // Validar slot global disponible y que el jugador no haya cantado ya este tipo
    const [slots, allClaims] = await Promise.all([
      getSlotState(),
      getAllClaims(),
    ]);

    if (slots.gameStatus === "ended") {
      return NextResponse.json(
        { error: "El juego ya terminó" },
        { status: 409 }
      );
    }

    if (type === "linea" && slots.lineasTaken >= SCORING.maxLineasGlobal) {
      return NextResponse.json(
        { error: "Ya se cantaron las 3 lineas" },
        { status: 409 }
      );
    }

    if (type === "bingo" && slots.bingoTaken) {
      return NextResponse.json(
        { error: "Ya alguien canto bingo" },
        { status: 409 }
      );
    }

    const alreadyClaimed = allClaims.some(
      (c) =>
        c.playerId === playerId &&
        c.type === type &&
        c.status !== "rejected"
    );
    if (alreadyClaimed) {
      return NextResponse.json(
        { error: `Ya cantaste ${type === "linea" ? "linea" : "bingo"} antes` },
        { status: 409 }
      );
    }

    const claim: Claim = {
      id: randomUUID(),
      playerId,
      nickname: nickname.slice(0, 30),
      fichaId,
      fichaTitle: ficha.title,
      type,
      markedCells,
      winningCells,
      conversation: conversation.slice(0, 50000),
      claimedAt: Date.now(),
      status: "pending",
    };

    await saveClaim(claim);

    const newSlots = await getSlotState();

    const pusher = getPusherServer();
    if (pusher) {
      await Promise.all([
        pusher.trigger(CHANNEL, EVENTS.CLAIMED, claim),
        pusher.trigger(CHANNEL, EVENTS.SLOTS_UPDATED, newSlots),
      ]);
    }

    return NextResponse.json({ claim, slots: newSlots });
  } catch (e) {
    console.error("claim error", e);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
