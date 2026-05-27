"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BINGO_CELLS,
  getWinningLine,
  isFullCard,
  TOTAL_CELLS,
} from "@/lib/bingo-card";
import { findFicha } from "@/lib/fichas";
import { getPusherClient, CHANNEL, EVENTS } from "@/lib/pusher-client";
import { Logo } from "@/components/Logo";
import { SCORING, countWords } from "@/lib/scoring";
import type {
  Claim,
  ClaimType,
  GameState,
  SlotState,
} from "@/lib/types";

const STORAGE = {
  marked: (fid: string) => `bingo:marked:${fid}`,
  feedback: (fid: string) => `bingo:feedback:${fid}`,
  myClaims: "bingo:myClaims",
};

type ClaimModal = { type: ClaimType; cells: number[] } | null;

export default function PlayPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [fichaId, setFichaId] = useState<string>("");
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [slots, setSlots] = useState<SlotState>({
    lineasTaken: 0,
    lineasApproved: 0,
    bingoTaken: false,
    bingoApproved: false,
    gameStatus: "playing",
  });
  const [myClaims, setMyClaims] = useState<{
    linea?: { id: string; status: Claim["status"] };
    bingo?: { id: string; status: Claim["status"] };
  }>({});
  const [showModal, setShowModal] = useState<ClaimModal>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveBingos, setLiveBingos] = useState<
    { id: string; nickname: string; type: ClaimType; at: number }[]
  >([]);

  // --- Init ---
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
      const mc = localStorage.getItem(STORAGE.myClaims);
      if (mc) setMyClaims(JSON.parse(mc));
    } catch {
      // ignore
    }
  }, [router]);

  // Initial slot fetch
  useEffect(() => {
    if (!playerId) return;
    fetch("/api/state")
      .then((r) => r.json())
      .then((s: SlotState) => setSlots(s))
      .catch(() => {});
  }, [playerId]);

  // Persist marked + feedback locally
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
    localStorage.setItem(STORAGE.myClaims, JSON.stringify(myClaims));
  }, [myClaims]);

  // Debounced sync to server
  const syncToServer = useCallback(
    (m: Set<number>, fb: string) => {
      if (!playerId || !nickname || !fichaId) return;
      fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playerId,
          nickname,
          fichaId,
          markedCells: Array.from(m),
          feedback: fb,
        }),
      }).catch(() => {});
    },
    [playerId, nickname, fichaId]
  );

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playerId) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncToServer(marked, feedback);
    }, 800);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [marked, feedback, playerId, syncToServer]);

  // Pusher subscription
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(CHANNEL);

    channel.bind(EVENTS.CLAIMED, (data: Claim) => {
      setLiveBingos((prev) =>
        [
          { id: data.id, nickname: data.nickname, type: data.type, at: data.claimedAt },
          ...prev,
        ].slice(0, 5)
      );
    });

    channel.bind(EVENTS.SLOTS_UPDATED, (data: SlotState) => setSlots(data));

    channel.bind(EVENTS.VALIDATED, (data: Claim) => {
      // si era mia, actualizar status
      setMyClaims((prev) => {
        if (prev.linea?.id === data.id)
          return { ...prev, linea: { id: data.id, status: data.status } };
        if (prev.bingo?.id === data.id)
          return { ...prev, bingo: { id: data.id, status: data.status } };
        return prev;
      });
    });

    channel.bind(EVENTS.GAME_ENDED, (data: GameState) => {
      setSlots((s) => ({ ...s, gameStatus: data.status }));
      // Redirigir al ranking
      setTimeout(() => router.push("/ranking"), 1500);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
    };
  }, [router]);

  // Redirect a ranking si entras y el juego ya termino
  useEffect(() => {
    if (slots.gameStatus === "ended") {
      const t = setTimeout(() => router.push("/ranking"), 2000);
      return () => clearTimeout(t);
    }
  }, [slots.gameStatus, router]);

  // --- Derived ---
  const markedArr = useMemo(() => Array.from(marked), [marked]);
  const winningLine = useMemo(() => getWinningLine(markedArr), [markedArr]);
  const fullCard = useMemo(() => isFullCard(markedArr), [markedArr]);

  const gameOver = slots.gameStatus === "ended";

  const lineaAvailable =
    !gameOver &&
    slots.lineasTaken < SCORING.maxLineasGlobal &&
    (!myClaims.linea || myClaims.linea.status === "rejected");
  const bingoAvailable =
    !gameOver &&
    !slots.bingoTaken &&
    (!myClaims.bingo || myClaims.bingo.status === "rejected");

  const canCantarLinea = lineaAvailable && winningLine !== null;
  const canCantarBingo = bingoAvailable && fullCard;

  // --- Actions ---
  function toggleCell(id: number) {
    if (gameOver) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openClaim(type: ClaimType) {
    if (type === "linea" && winningLine) {
      setShowModal({ type, cells: winningLine });
    } else if (type === "bingo" && fullCard) {
      setShowModal({ type, cells: Array.from({ length: 9 }, (_, i) => i) });
    }
    setError(null);
  }

  async function submitClaim() {
    if (!showModal || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          nickname,
          fichaId,
          type: showModal.type,
          markedCells: markedArr,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar");
        setSubmitting(false);
        return;
      }
      const claim = data.claim as Claim;
      if (data.slots) setSlots(data.slots as SlotState);
      setMyClaims((prev) => ({
        ...prev,
        [claim.type]: { id: claim.id, status: claim.status },
      }));
      setShowModal(null);
    } catch (e) {
      console.error(e);
      setError("Error de red, intentá de nuevo");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Render helpers ---
  const ficha = findFicha(fichaId);
  const feedbackWords = countWords(feedback);
  const cappedWords = Math.min(feedbackWords, SCORING.maxFeedbackWords);
  const estimatedPoints =
    markedArr.length * SCORING.pointsPerCell +
    (myClaims.linea?.status === "approved" ? SCORING.pointsPerLineaApproved : 0) +
    (myClaims.bingo?.status === "approved" ? SCORING.pointsPerBingoApproved : 0) +
    cappedWords * SCORING.pointsPerFeedbackWord;

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

        {/* Slot status banner */}
        <div className="mb-4 flex gap-2 flex-wrap text-xs">
          <SlotChip
            label="Líneas"
            taken={slots.lineasTaken}
            max={SCORING.maxLineasGlobal}
          />
          <SlotChip
            label="Bingo"
            taken={slots.bingoTaken ? 1 : 0}
            max={SCORING.maxBingoGlobal}
          />
          <span className="ml-auto self-center text-ril-ink-soft">
            Puntos: <strong className="text-ril-ink">{estimatedPoints}</strong>
          </span>
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
          Marcá las casillas que el agente cumpla. Cantá línea o bingo cuando
          quieras (no se marca solo).
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {BINGO_CELLS.map((cell) => {
            const isMarked = marked.has(cell.id);
            const isWinning = winningLine?.includes(cell.id);
            return (
              <button
                key={cell.id}
                onClick={() => toggleCell(cell.id)}
                disabled={gameOver}
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
                  ${gameOver ? "cursor-not-allowed opacity-60" : "cursor-pointer active:scale-95"}
                `}
              >
                {cell.text}
              </button>
            );
          })}
        </div>

        {/* Botones cantar */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <CantarButton
            type="linea"
            available={lineaAvailable}
            ready={canCantarLinea}
            myStatus={myClaims.linea?.status}
            onClick={() => openClaim("linea")}
          />
          <CantarButton
            type="bingo"
            available={bingoAvailable}
            ready={canCantarBingo}
            myStatus={myClaims.bingo?.status}
            onClick={() => openClaim("bingo")}
          />
        </div>

        {/* Feedback textarea */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-2">
            <label
              className="eyebrow"
              htmlFor="feedback"
            >
              Tu feedback al agente
            </label>
            <span className="text-xs text-ril-ink-soft">
              {feedbackWords} palabra{feedbackWords === 1 ? "" : "s"}{" "}
              {feedbackWords > SCORING.maxFeedbackWords && (
                <span className="text-ril-terracotta">
                  (suma hasta {SCORING.maxFeedbackWords})
                </span>
              )}
            </span>
          </div>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={gameOver}
            placeholder="¿Qué te pareció el agente? ¿Qué hizo bien? ¿Qué le falta? ¿Qué casos no supo manejar? Acá es donde más sumás puntos para ganar — cuanto más escribas, mejor."
            rows={7}
            maxLength={5000}
            className="w-full px-3 py-2.5 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal text-sm text-ril-ink disabled:bg-ril-cream"
          />
          <p className="text-xs text-ril-ink-soft mt-1">
            Se guarda automáticamente mientras escribís.
          </p>
        </div>

        {/* Live bingos */}
        {liveBingos.length > 0 && (
          <div className="mt-8 border-t border-ril-line pt-4">
            <p className="eyebrow mb-2">Cantados en vivo</p>
            <ul className="space-y-1.5">
              {liveBingos.map((b) => (
                <li
                  key={b.id}
                  className="text-sm text-ril-ink bg-ril-cream-light rounded-lg px-3 py-2 border border-ril-line/60 animate-slide-in flex items-center gap-2"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${b.type === "bingo" ? "bg-ril-terracotta" : "bg-ril-teal"} animate-pulse`}
                  />
                  <span className="font-semibold">{b.nickname}</span>
                  <span className="text-ril-ink-soft">·</span>
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    {b.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {gameOver && (
          <div className="mt-6 bg-ril-sage/20 border border-ril-sage rounded-lg p-4 text-center">
            <p className="headline text-xl">¡El juego terminó!</p>
            <p className="text-sm text-ril-ink-soft mt-1">
              Redirigiéndote al ranking…
            </p>
          </div>
        )}
      </div>

      {/* Claim modal — confirmacion sin pegar conversacion */}
      {showModal && (
        <div className="fixed inset-0 bg-ril-ink/70 z-50 flex items-center justify-center p-4">
          <div className="bg-ril-cream-light rounded-2xl max-w-md w-full p-6 shadow-2xl animate-pop border-4 border-ril-terracotta">
            <div className="text-center mb-4">
              <p className="eyebrow mb-1">Vas a cantar</p>
              <h2
                className="headline text-5xl text-ril-terracotta"
                style={{ letterSpacing: "0.05em" }}
              >
                {showModal.type === "linea" ? "¡LÍNEA!" : "¡BINGO!"}
              </h2>
              <p className="text-sm text-ril-ink mt-3 leading-relaxed">
                Cuando confirmes, el jurado va a validar en vivo. Tené tu
                conversación con el agente a mano para mostrarla (compartir
                pantalla).
              </p>
            </div>
            {error && (
              <p className="text-sm text-ril-terracotta-dark mb-3 font-semibold text-center">
                {error}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowModal(null)}
                disabled={submitting}
                className="px-4 py-2 text-sm text-ril-ink-soft hover:text-ril-ink"
              >
                Cancelar
              </button>
              <button
                onClick={submitClaim}
                disabled={submitting}
                className="px-6 py-3 bg-ril-terracotta hover:bg-ril-terracotta-dark disabled:bg-ril-line disabled:cursor-not-allowed text-white font-bold rounded-lg text-base uppercase tracking-wider"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                {submitting
                  ? "Cantando…"
                  : `Cantar ${showModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SlotChip({
  label,
  taken,
  max,
}: {
  label: string;
  taken: number;
  max: number;
}) {
  const full = taken >= max;
  return (
    <span
      className={`px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${
        full
          ? "bg-ril-ink/10 border-ril-ink/20 text-ril-ink-soft"
          : "bg-ril-cream-light border-ril-line text-ril-ink"
      }`}
      style={{ fontFamily: "var(--font-condensed)" }}
    >
      {label}: {taken}/{max} {full && "· cerrado"}
    </span>
  );
}

function CantarButton({
  type,
  available,
  ready,
  myStatus,
  onClick,
}: {
  type: ClaimType;
  available: boolean;
  ready: boolean;
  myStatus?: Claim["status"];
  onClick: () => void;
}) {
  const isLinea = type === "linea";
  const label = isLinea ? "Cantar línea" : "Cantar bingo";

  if (myStatus === "pending") {
    return (
      <div className="rounded-lg border-2 border-dashed border-ril-line p-3 text-center text-sm">
        <p
          className="font-bold uppercase tracking-wider"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          {label} enviado
        </p>
        <p className="text-xs text-ril-ink-soft">Esperando al jurado…</p>
      </div>
    );
  }

  if (myStatus === "approved") {
    return (
      <div className="rounded-lg bg-ril-sage/25 border-2 border-ril-sage p-3 text-center text-sm">
        <p
          className="font-bold uppercase tracking-wider text-ril-ink"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          ✓ {label} válida
        </p>
      </div>
    );
  }

  const disabled = !available || !ready;
  let helpText: string;
  if (!available) helpText = isLinea ? "Slots agotados" : "Ya cantaron bingo";
  else if (!ready)
    helpText = isLinea
      ? "Completá una fila/columna/diagonal"
      : "Completá las 9 casillas";
  else helpText = "Listo para cantar";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-3 text-center transition border-2 ${
        disabled
          ? "bg-ril-cream-light border-ril-line text-ril-ink-soft cursor-not-allowed"
          : isLinea
            ? "bg-ril-teal border-ril-teal text-white hover:opacity-90 active:scale-95"
            : "bg-ril-terracotta border-ril-terracotta-dark text-white hover:opacity-90 active:scale-95 animate-pulse-glow"
      }`}
    >
      <p
        className="font-bold uppercase tracking-wider text-base"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        {label}
      </p>
      <p
        className={`text-[10px] mt-0.5 ${disabled ? "" : "opacity-90"}`}
      >
        {helpText}
      </p>
    </button>
  );
}
