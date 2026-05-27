import { Redis } from "@upstash/redis";
import type {
  Claim,
  ClaimStatus,
  GameState,
  PlayerState,
  SlotState,
} from "./types";
import { SCORING } from "./scoring";

const CLAIMS_KEY = "bingo:claims";
const PLAYERS_KEY = "bingo:players";
const GAME_KEY = "bingo:game";

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
  hdel(key: string, field: string): Promise<void>;
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
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
      hdel: async (key, field) => {
        await redis.hdel(key, field);
      },
      set: async (key, value) => {
        await redis.set(key, value);
      },
      get: async (key) => {
        const v = await redis.get<string>(key);
        return typeof v === "string" ? v : v ? JSON.stringify(v) : null;
      },
    };
    return cachedStore;
  }

  // Fallback en memoria
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
    hdel: async (key, field) => {
      getMemoryHash(key).delete(field);
    },
    set: async (key, value) => {
      getMemoryHash("__singletons__").set(key, value);
    },
    get: async (key) => getMemoryHash("__singletons__").get(key) ?? null,
  };
  return cachedStore;
}

export function isUsingMemoryStore(): boolean {
  return getStore().isMemory;
}

// --- Claims ---

export async function saveClaim(claim: Claim): Promise<void> {
  await getStore().hset(CLAIMS_KEY, claim.id, JSON.stringify(claim));
}

export async function getClaim(id: string): Promise<Claim | null> {
  const raw = await getStore().hget(CLAIMS_KEY, id);
  return raw ? (JSON.parse(raw) as Claim) : null;
}

export async function getAllClaims(): Promise<Claim[]> {
  const all = await getStore().hgetall(CLAIMS_KEY);
  return Object.values(all)
    .map((v) => JSON.parse(v) as Claim)
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

// --- Players ---

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

// --- Game state ---

export async function getGame(): Promise<GameState> {
  const raw = await getStore().get(GAME_KEY);
  if (!raw) return { status: "playing" };
  return JSON.parse(raw) as GameState;
}

export async function setGame(state: GameState): Promise<void> {
  await getStore().set(GAME_KEY, JSON.stringify(state));
}

// --- Helpers ---

export async function getSlotState(): Promise<SlotState> {
  const [claims, game] = await Promise.all([getAllClaims(), getGame()]);
  const lineas = claims.filter((c) => c.type === "linea");
  const bingos = claims.filter((c) => c.type === "bingo");
  const lineasTaken = lineas.filter(
    (c) => c.status === "pending" || c.status === "approved"
  ).length;
  const lineasApproved = lineas.filter((c) => c.status === "approved").length;
  const bingoTaken = bingos.some(
    (c) => c.status === "pending" || c.status === "approved"
  );
  const bingoApproved = bingos.some((c) => c.status === "approved");
  return {
    lineasTaken,
    lineasApproved,
    bingoTaken,
    bingoApproved,
    gameStatus: game.status,
  };
}

export async function canClaimLinea(): Promise<boolean> {
  const s = await getSlotState();
  return s.gameStatus === "playing" && s.lineasTaken < SCORING.maxLineasGlobal;
}

export async function canClaimBingo(): Promise<boolean> {
  const s = await getSlotState();
  return s.gameStatus === "playing" && !s.bingoTaken;
}

// Compat con codigo viejo
export function kvAvailable(): boolean {
  return true;
}
