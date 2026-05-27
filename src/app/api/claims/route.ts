import { NextResponse } from "next/server";
import { getAllClaims, kvAvailable } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!kvAvailable()) {
    return NextResponse.json([]);
  }
  const claims = await getAllClaims();
  return NextResponse.json(claims);
}
