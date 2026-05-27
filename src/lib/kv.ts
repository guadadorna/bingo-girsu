import { Redis } from "@upstash/redis";
import type { PlayerState } from "./types";

const PLAYERS_KEY = "bingo:players";

// In-memory fallback para desarrollo local sin Upstash configurado.
// Persiste mientras dura el proceso de Node.
type MemoryHash = Map<string, string>;
const memoryStores = new Map<string, MemoryHash>();
function getMemoryHash(key: string): MemoryHash {
  let h = memoryStores.get(key);
  if (!h) {
    h = new Map();
    memoryStores.set(key, h);
  }
  return h;
}

type Store = {
  isMemory: boolean;
  hset(key: string, field: string, value: string): Promise<void>;
  hget(key: string, field: string): Promise<string | null>;
  hgetall(key: string): Promise<Record<string, string>>;
};

let cachedStore: Store | null = null;

function getStore(): Store {
  if (cachedStore) return cachedStore;
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    cachedStore = {
      isMemory: false,
      hset: async (key, field, value) => {
        await redis.hset(key, { [field]: value });
      },
      hget: async (key, field) => {
        const v = await redis.hget<string>(key, field);
        return typeof v === "string" ? v : v ? JSON.stringify(v) : null;
      },
      hgetall: async (key) => {
        const all =
          (await redis.hgetall<Record<string, string>>(key)) ?? {};
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(all)) {
          out[k] = typeof v === "string" ? v : JSON.stringify(v);
        }
        return out;
      },
    };
    return cachedStore;
  }

  console.warn(
    "[kv] Sin Upstash configurado. Usando store en memoria (solo dura mientras corra el proceso)."
  );
  cachedStore = {
    isMemory: true,
    hset: async (key, field, value) => {
      getMemoryHash(key).set(field, value);
    },
    hget: async (key, field) => getMemoryHash(key).get(field) ?? null,
    hgetall: async (key) => {
      const h = getMemoryHash(key);
      const out: Record<string, string> = {};
      for (const [k, v] of h.entries()) out[k] = v;
      return out;
    },
  };
  return cachedStore;
}

export function isUsingMemoryStore(): boolean {
  return getStore().isMemory;
}

export async function savePlayer(player: PlayerState): Promise<void> {
  await getStore().hset(PLAYERS_KEY, player.id, JSON.stringify(player));
}

export async function getPlayer(id: string): Promise<PlayerState | null> {
  const raw = await getStore().hget(PLAYERS_KEY, id);
  return raw ? (JSON.parse(raw) as PlayerState) : null;
}

export async function getAllPlayers(): Promise<PlayerState[]> {
  const all = await getStore().hgetall(PLAYERS_KEY);
  return Object.values(all).map((v) => JSON.parse(v) as PlayerState);
}
