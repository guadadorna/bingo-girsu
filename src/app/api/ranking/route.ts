import { NextResponse } from "next/server";
import { getAllPlayers, getAllClaims, getGame } from "@/lib/kv";
import { rankPlayers, SCORING } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET() {
  const [players, claims, game] = await Promise.all([
    getAllPlayers(),
    getAllClaims(),
    getGame(),
  ]);
  const ranking = rankPlayers(players, claims);
  return NextResponse.json({ ranking, game, scoring: SCORING });
}
