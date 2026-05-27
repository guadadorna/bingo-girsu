import { NextResponse } from "next/server";
import { getSlotState } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const slots = await getSlotState();
  return NextResponse.json(slots);
}
