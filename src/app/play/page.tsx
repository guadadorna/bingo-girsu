"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BINGO_CELLS,
  getWinningLine,
  isFullCard,
} from "@/lib/bingo-card";
import { findFicha } from "@/lib/fichas";
import { Logo } from "@/components/Logo";

const STORAGE = {
  marked: (fid: string) => `bingo:marked:${fid}`,
  feedback: (fid: string) => `bingo:feedback:${fid}`,
};

export default function PlayPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [fichaId, setFichaId] = useState<string>("");
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const n = sessionStorage.getItem("bingo:nickname");
    const f = sessionStorage.getItem("bingo:fichaId");
    if (!n || !f) {
      router.replace("/");
      return;
    }
    setNickname(n);
    setFichaId(f);

    let pid = sessionStorage.getItem("bingo:playerId");
    if (!pid) {
      pid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      sessionStorage.setItem("bingo:playerId", pid);
    }
    setPlayerId(pid);

    try {
      const m = localStorage.getItem(STORAGE.marked(f));
      if (m) setMarked(new Set(JSON.parse(m) as number[]));
      const fb = localStorage.getItem(STORAGE.feedback(f));
      if (fb) setFeedback(fb);
    } catch {
      // ignore
    }
  }, [router]);

  useEffect(() => {
    if (!fichaId) return;
    localStorage.setItem(
      STORAGE.marked(fichaId),
      JSON.stringify(Array.from(marked))
    );
  }, [marked, fichaId]);

  useEffect(() => {
    if (!fichaId) return;
    localStorage.setItem(STORAGE.feedback(fichaId), feedback);
  }, [feedback, fichaId]);

  const syncToServer = useCallback(
    async (m: Set<number>, fb: string) => {
      if (!playerId || !nickname || !fichaId) return;
      setSaving(true);
      try {
        const res = await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: playerId,
            nickname,
            fichaId,
            markedCells: Array.from(m),
            feedback: fb,
          }),
        });
        if (res.ok) setSavedAt(Date.now());
      } catch {
        // ignore - localStorage tiene la copia
      } finally {
        setSaving(false);
      }
    },
    [playerId, nickname, fichaId]
  );

  // Auto-save debounced 2s — alivia carga si escriben mucho.
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playerId) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncToServer(marked, feedback);
    }, 2000);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [marked, feedback, playerId, syncToServer]);

  const markedArr = useMemo(() => Array.from(marked), [marked]);
  const winningLine = useMemo(() => getWinningLine(markedArr), [markedArr]);
  const fullCard = useMemo(() => isFullCard(markedArr), [markedArr]);

  function toggleCell(id: number) {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const ficha = findFicha(fichaId);
  const saveLabel = saving
    ? "Guardando…"
    : savedAt
      ? `Guardado a las ${new Date(savedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
      : "Aún sin guardar";

  return (
    <main className="min-h-screen">
      <div className="h-3 bg-ril-terracotta" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        <header className="mb-5 flex justify-between items-center gap-4">
          <Logo />
          <button
            onClick={() => router.push("/")}
            className="text-xs text-ril-ink-soft hover:text-ril-ink underline"
          >
            Salir
          </button>
        </header>

        <div className="mb-4">
          <p className="eyebrow mb-1">Hola, {nickname}</p>
          <h1 className="headline text-3xl sm:text-4xl">
            Bingo del agente GIRSU
          </h1>
        </div>

        {ficha && (
          <div className="mb-5 bg-ril-cream-light border-l-4 border-ril-teal rounded-r-lg p-4">
            <p
              className="eyebrow mb-1"
              style={{ color: "var(--ril-teal)" }}
            >
              Tu ficha · {ficha.title}
            </p>
            <p className="text-sm text-ril-ink">{ficha.description}</p>
          </div>
        )}

        <p className="text-sm text-ril-ink-soft italic mb-4 text-center">
          Marcá las casillas que el agente cumpla. Cuando completes una línea o
          bingo, <strong>cantalo en voz alta</strong>.
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {BINGO_CELLS.map((cell) => {
            const isMarked = marked.has(cell.id);
            const isWinning = winningLine?.includes(cell.id);
            return (
              <button
                key={cell.id}
                onClick={() => toggleCell(cell.id)}
                className={`
                  aspect-square rounded-lg border-2 p-2 sm:p-3 text-xs sm:text-sm
                  transition-all flex items-center justify-center text-center font-medium
                  ${
                    isMarked
                      ? isWinning && !fullCard
                        ? "bg-ril-teal border-ril-teal text-white"
                        : fullCard
                          ? "bg-ril-terracotta border-ril-terracotta-dark text-white"
                          : "bg-ril-teal-soft border-ril-teal text-ril-ink"
                      : "bg-ril-cream-light border-ril-line text-ril-ink hover:border-ril-teal hover:bg-white"
                  }
                  cursor-pointer active:scale-95
                `}
              >
                {cell.text}
              </button>
            );
          })}
        </div>

        {(winningLine || fullCard) && (
          <div className="mt-5 bg-ril-sage/25 border-2 border-ril-sage rounded-lg p-4 text-center">
            <p
              className="headline text-2xl text-ril-ink"
            >
              {fullCard ? "¡Tenés BINGO!" : "¡Tenés LÍNEA!"}
            </p>
            <p className="text-sm text-ril-ink-soft mt-1">
              Cantalo en voz alta para que Guada valide.
            </p>
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-between items-end mb-2">
            <label className="eyebrow" htmlFor="feedback">
              Tu feedback al agente
            </label>
            <span className="text-xs text-ril-ink-soft">{saveLabel}</span>
          </div>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="¿Qué te pareció el agente? ¿Qué hizo bien? ¿Qué le falta? ¿Qué casos no supo manejar? Tu feedback es lo más valioso que se lleva Guada del taller."
            rows={8}
            maxLength={5000}
            className="w-full px-3 py-2.5 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal text-sm text-ril-ink"
          />
          <p className="text-xs text-ril-ink-soft mt-1">
            Se guarda automáticamente cada par de segundos.
          </p>
        </div>
      </div>
    </main>
  );
}
