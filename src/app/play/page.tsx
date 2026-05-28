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
  tab: "bingo:tab",
};

type Tab = "caso" | "bingo";

export default function PlayPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [fichaId, setFichaId] = useState<string>("");
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("caso");

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
      const t = localStorage.getItem(STORAGE.tab);
      if (t === "bingo" || t === "caso") setTab(t);
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

  useEffect(() => {
    localStorage.setItem(STORAGE.tab, tab);
  }, [tab]);

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
      <div className="h-2 bg-ril-terracotta" />

      <div className="max-w-2xl mx-auto px-3 sm:px-6 pt-4 pb-12">
        <header className="mb-4 flex justify-between items-center gap-3">
          <Logo />
          <button
            onClick={() => router.push("/")}
            className="text-xs text-ril-ink-soft hover:text-ril-ink underline"
          >
            Salir
          </button>
        </header>

        <div className="mb-3">
          <p className="eyebrow mb-1">Hola, {nickname}</p>
          <h1 className="headline text-xl sm:text-3xl leading-tight">
            {ficha ? ficha.title : "Bingo del agente GIRSU"}
          </h1>
          {ficha && (
            <p className="text-[11px] uppercase tracking-wider text-ril-teal mt-1">
              Ficha · Apellidos {ficha.letras} · {ficha.category}
            </p>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Vistas del juego"
          className="grid grid-cols-2 gap-1 p-1 bg-ril-cream-light border border-ril-line rounded-lg mb-4"
        >
          <button
            role="tab"
            aria-selected={tab === "caso"}
            onClick={() => setTab("caso")}
            className={`py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition ${
              tab === "caso"
                ? "bg-ril-terracotta text-white shadow-sm"
                : "text-ril-ink-soft hover:text-ril-ink"
            }`}
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Tu caso
          </button>
          <button
            role="tab"
            aria-selected={tab === "bingo"}
            onClick={() => setTab("bingo")}
            className={`py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition ${
              tab === "bingo"
                ? "bg-ril-terracotta text-white shadow-sm"
                : "text-ril-ink-soft hover:text-ril-ink"
            }`}
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Bingo {marked.size > 0 && (
              <span className="ml-1 text-[11px] opacity-80">({marked.size}/9)</span>
            )}
          </button>
        </div>

        {tab === "caso" && ficha && (
          <section className="space-y-3">
            <div className="bg-ril-cream-light border border-ril-line rounded-lg p-4">
              <p className="eyebrow text-[11px] mb-1.5" style={{ color: "var(--ril-teal)" }}>
                Situación
              </p>
              <p className="text-sm text-ril-ink leading-relaxed whitespace-pre-line">
                {ficha.situation}
              </p>
            </div>

            <div className="bg-white border-l-4 border-ril-terracotta rounded-r-lg p-4 shadow-sm">
              <p className="eyebrow text-[11px] mb-1.5 text-ril-terracotta">
                Pregunta principal al agente
              </p>
              <p className="text-sm sm:text-base text-ril-ink font-semibold leading-snug">
                {ficha.question}
              </p>
            </div>

            <details className="bg-ril-cream-light border border-ril-line rounded-lg p-3 group">
              <summary className="cursor-pointer text-sm font-semibold text-ril-ink flex items-center justify-between">
                <span>💡 Preguntas de seguimiento</span>
                <span className="text-xs text-ril-ink-soft group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-ril-ink-soft list-disc pl-5">
                {ficha.followUps.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </details>

            <button
              onClick={() => setTab("bingo")}
              className="w-full mt-2 py-3 bg-ril-teal hover:bg-ril-teal/90 text-white font-bold rounded-lg uppercase tracking-wider text-sm transition"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Ir al bingo →
            </button>
          </section>
        )}

        {tab === "bingo" && (
          <section>
            <div className="mb-3 text-xs text-ril-ink-soft text-center leading-snug">
              <p>
                <span className="text-ril-teal font-semibold">Filas de arriba:</span>
                {" "}lo bueno · Marcá si el agente lo hace.
              </p>
              <p>
                <span className="text-ril-terracotta font-semibold">Fila de abajo:</span>
                {" "}lo malo · Marcá si el agente se equivoca.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {BINGO_CELLS.map((cell) => {
                const isMarked = marked.has(cell.id);
                const isWinning = winningLine?.includes(cell.id);
                const isBad = cell.type === "bad";

                const classes = isMarked
                  ? isBad
                    ? "bg-ril-terracotta border-ril-terracotta-dark text-white"
                    : isWinning && !fullCard
                      ? "bg-ril-teal border-ril-teal text-white"
                      : "bg-ril-teal-soft border-ril-teal text-ril-ink"
                  : isBad
                    ? "bg-ril-cream-light border-ril-terracotta/40 text-ril-ink hover:bg-white"
                    : "bg-ril-cream-light border-ril-line text-ril-ink hover:bg-white";

                return (
                  <button
                    key={cell.id}
                    onClick={() => toggleCell(cell.id)}
                    className={`
                      aspect-square rounded-lg border-2 p-1.5 sm:p-3
                      text-[11px] leading-tight sm:text-sm
                      transition-all flex items-center justify-center text-center font-medium
                      ${classes}
                      cursor-pointer active:scale-95
                    `}
                  >
                    {cell.text}
                  </button>
                );
              })}
            </div>

            {(winningLine || fullCard) && (
              <div className="mt-4 bg-ril-sage/25 border-2 border-ril-sage rounded-lg p-3 text-center">
                <p className="headline text-xl sm:text-2xl text-ril-ink">
                  {fullCard ? "¡Tenés BINGO!" : "¡Tenés LÍNEA!"}
                </p>
                <p className="text-xs sm:text-sm text-ril-ink-soft mt-0.5">
                  Cantalo fuerte así lo validamos.
                </p>
              </div>
            )}

            <div className="mt-6">
              <div className="flex justify-between items-end mb-1.5">
                <label className="eyebrow text-[11px]" htmlFor="feedback">
                  Tu feedback al agente
                </label>
                <span className="text-[11px] text-ril-ink-soft">{saveLabel}</span>
              </div>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="¿Qué te pareció? ¿Qué hizo bien? ¿Qué le falta? ¿Qué no supo manejar? Esto es lo más valioso que se lleva el taller."
                rows={6}
                maxLength={5000}
                className="w-full px-3 py-2 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal text-sm text-ril-ink"
              />
              <p className="text-[11px] text-ril-ink-soft mt-1">
                Se guarda automáticamente cada par de segundos.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
