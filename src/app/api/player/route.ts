import { NextResponse } from "next/server";
import { savePlayer, getPlayer } from "@/lib/kv";
import { findFicha } from "@/lib/fichas";
import type { PlayerState } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PlayerState>;
    const id = body.id?.trim();
    const nickname = body.nickname?.trim();
    const fichaId = body.fichaId;

    if (!id || !nickname || !fichaId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const ficha = findFicha(fichaId);
    if (!ficha) {
      return NextResponse.json({ error: "Ficha invalida" }, { status: 400 });
    }

    const existing = await getPlayer(id);
    const now = Date.now();
    const next: PlayerState = {
      id,
      nickname: nickname.slice(0, 30),
      fichaId,
      fichaTitle: ficha.title,
      markedCells: Array.isArray(body.markedCells)
        ? body.markedCells.filter(
            (n): n is number => typeof n === "number" && n >= 0 && n < 9
          )
        : (existing?.markedCells ?? []),
      feedback: (body.feedback ?? existing?.feedback ?? "").slice(0, 5000),
      joinedAt: existing?.joinedAt ?? now,
      lastUpdatedAt: now,
    };

    await savePlayer(next);
    return NextResponse.json(next);
  } catch (e) {
    console.error("player save error", e);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
