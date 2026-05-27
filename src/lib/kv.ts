import { Redis } from "@upstash/redis";
import type { Claim, ClaimStatus } from "./types";

const CLAIMS_KEY = "bingo:claims";

let cached: Redis | null = null;

function client(): Redis | null {
  if (cached) return cached;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cached = new Redis({ url, token });
  return cached;
}

export function kvAvailable(): boolean {
  return client() !== null;
}

export async function saveClaim(claim: Claim): Promise<void> {
  const r = client();
  if (!r) return;
  await r.hset(CLAIMS_KEY, { [claim.id]: JSON.stringify(claim) });
}

export async function getClaim(id: string): Promise<Claim | null> {
  const r = client();
  if (!r) return null;
  const raw = await r.hget<string | Claim>(CLAIMS_KEY, id);
  if (!raw) return null;
  if (typeof raw === "string") return JSON.parse(raw) as Claim;
  return raw as Claim;
}

export async function getAllClaims(): Promise<Claim[]> {
  const r = client();
  if (!r) return [];
  const all = (await r.hgetall<Record<string, string | Claim>>(CLAIMS_KEY)) ?? {};
  return Object.values(all)
    .map((v) => (typeof v === "string" ? (JSON.parse(v) as Claim) : (v as Claim)))
    .sort((a, b) => b.claimedAt - a.claimedAt);
}

export async function updateClaimStatus(
  id: string,
  status: ClaimStatus,
  judgeNote?: string
): Promise<Claim | null> {
  const claim = await getClaim(id);
  if (!claim) return null;
  const updated: Claim = {
    ...claim,
    status,
    validatedAt: Date.now(),
    judgeNote,
  };
  await saveClaim(updated);
  return updated;
}
