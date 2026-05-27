"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BINGO_CELLS, getWinningLine } from "@/lib/bingo-card";
import { findFicha } from "@/lib/fichas";
import { getPusherClient, CHANNEL, EVENTS } from "@/lib/pusher-client";
import { Logo } from "@/components/Logo";

type LiveBingo = {
  id: string;
  nickname: string;
  fichaTitle: string;
  at: number;
};

const STORAGE_KEY = "bingo:marked";

export default function PlayPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [fichaId, setFichaId] = useState<string>("");
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [conversation, setConversation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [liveBingos, setLiveBingos] = useState<LiveBingo[]>([]);
  const hasTriggeredBingo = useRef(false);

  useEffect(() => {
    const n = sessionStorage.getItem("bingo:nickname");
    const f = sessionStorage.getItem("bingo:fichaId");
    if (!n || !f) {
      router.replace("/");
      return;
    }
    setNickname(n);
    setFichaId(f);

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}:${f}`);
      if (stored) {
        setMarked(new Set(JSON.parse(stored) as number[]));
      }
    } catch {
      // ignore
    }
  }, [router]);

  useEffect(() => {
    if (!fichaId) return;
    localStorage.setItem(
      `${STORAGE_KEY}:${fichaId}`,
      JSON.stringify(Array.from(marked))
    );
  }, [marked, fichaId]);

  const winningLine = useMemo(
    () => getWinningLine(Array.from(marked)),
    [marked]
  );

  useEffect(() => {
    if (winningLine && !hasTriggeredBingo.current) {
      hasTriggeredBingo.current = true;
      setShowBingoModal(true);
    }
  }, [winningLine]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(CHANNEL);
    channel.bind(EVENTS.CLAIMED, (data: LiveBingo) => {
      setLiveBingos((prev) => [data, ...prev].slice(0, 5));
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
    };
  }, []);

  function toggleCell(id: number) {
    if (submitted) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetCard() {
    if (!confirm("¿Borrar todas las marcas?")) return;
    setMarked(new Set());
    hasTriggeredBingo.current = false;
    setSubmitted(false);
  }

  async function submitBingo() {
    if (!conversation.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          fichaId,
          markedCells: Array.from(marked),
          winningLine,
          conversation: conversation.trim(),
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSubmitted(true);
      setShowBingoModal(false);
    } catch (e) {
      alert("No se pudo enviar el bingo. Probá de nuevo.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  const ficha = findFicha(fichaId);

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
          <p className="eyebrow mb-1">
            Hola, {nickname}
          </p>
          <h1 className="headline text-3xl sm:text-4xl">
            Bingo del agente GIRSU
          </h1>
        </div>

        {ficha && (
          <div className="mb-5 bg-ril-cream-light border-l-4 border-ril-teal rounded-r-lg p-4">
            <p className="eyebrow mb-1 text-ril-teal" style={{ color: "var(--ril-teal)" }}>
              Tu ficha · {ficha.title}
            </p>
            <p className="text-sm text-ril-ink">{ficha.description}</p>
          </div>
        )}

        <p className="text-sm text-ril-ink-soft italic mb-4 text-center">
          Marcá las casillas que el agente cumpla mientras conversás con él
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {BINGO_CELLS.map((cell) => {
            const isMarked = marked.has(cell.id);
            const isWinning = winningLine?.includes(cell.id);
            return (
              <button
                key={cell.id}
                onClick={() => toggleCell(cell.id)}
                disabled={submitted}
                className={`
                  aspect-square rounded-lg border-2 p-2 sm:p-3 text-xs sm:text-sm
                  transition-all flex items-center justify-center text-center font-medium
                  ${
                    isMarked
                      ? isWinning
                        ? "bg-ril-terracotta border-ril-terracotta-dark text-white animate-pop shadow-lg"
                        : "bg-ril-teal-soft border-ril-teal text-ril-ink"
                      : "bg-ril-cream-light border-ril-line text-ril-ink hover:border-ril-teal hover:bg-white"
                  }
                  ${submitted ? "cursor-not-allowed opacity-80" : "cursor-pointer active:scale-95"}
                `}
              >
                {cell.text}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {!submitted && (
            <button
              onClick={resetCard}
              className="text-sm text-ril-ink-soft hover:text-ril-ink underline"
            >
              Reiniciar cartón
            </button>
          )}
        </div>

        {submitted && (
          <div className="mt-6 bg-ril-sage/20 border border-ril-sage rounded-lg p-4 text-center">
            <p className="headline text-xl text-ril-ink">¡Bingo enviado!</p>
            <p className="text-sm text-ril-ink-soft mt-1">
              El jurado está validando tu cartón.
            </p>
          </div>
        )}

        {liveBingos.length > 0 && (
          <div className="mt-8 border-t border-ril-line pt-4">
            <p className="eyebrow mb-2">Bingos cantados en vivo</p>
            <ul className="space-y-1.5">
              {liveBingos.map((b) => (
                <li
                  key={b.id}
                  className="text-sm text-ril-ink bg-ril-cream-light rounded-lg px-3 py-2 border border-ril-line/60 animate-slide-in flex items-center gap-2"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-ril-terracotta animate-pulse" />
                  <span className="font-semibold">{b.nickname}</span>
                  <span className="text-ril-ink-soft">·</span>
                  <span className="text-ril-ink-soft text-xs">
                    {b.fichaTitle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showBingoModal && !submitted && (
        <div className="fixed inset-0 bg-ril-ink/70 z-50 flex items-center justify-center p-4">
          <div className="bg-ril-cream-light rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-pop border-4 border-ril-terracotta">
            <div className="text-center mb-4">
              <p className="eyebrow mb-1">Cantaste</p>
              <h2
                className="headline text-5xl text-ril-terracotta"
                style={{ letterSpacing: "0.05em" }}
              >
                ¡BINGO!
              </h2>
              <p className="text-sm text-ril-ink-soft mt-3">
                Pegá la conversación con el agente para que el jurado valide tu
                cartón.
              </p>
            </div>
            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Copiá y pegá toda la conversación con el agente acá…"
              rows={8}
              className="w-full px-3 py-2 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal text-sm"
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowBingoModal(false)}
                className="px-4 py-2 text-sm text-ril-ink-soft hover:text-ril-ink"
              >
                Después
              </button>
              <button
                onClick={submitBingo}
                disabled={!conversation.trim() || submitting}
                className="px-5 py-2 bg-ril-terracotta hover:bg-ril-terracotta-dark disabled:bg-ril-line disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm uppercase tracking-wider"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                {submitting ? "Enviando…" : "Enviar bingo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
