import { NextResponse } from "next/server";
import { getAllPlayers } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const expected = process.env.ADMIN_KEY;
  if (expected && key !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const players = await getAllPlayers();
  players.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  return NextResponse.json({ players });
}
