"use client";

import { useEffect, useMemo, useState } from "react";
import type { Claim, ClaimStatus, ClaimType, GameState, SlotState } from "@/lib/types";
import { BINGO_CELLS } from "@/lib/bingo-card";
import { getPusherClient, CHANNEL, EVENTS } from "@/lib/pusher-client";
import { Logo } from "@/components/Logo";
import { SCORING } from "@/lib/scoring";

export default function JuezDashboard({
  initialClaims,
  initialSlots,
}: {
  initialClaims: Claim[];
  initialSlots: SlotState;
}) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [slots, setSlots] = useState<SlotState>(initialSlots);
  const [filter, setFilter] = useState<ClaimStatus | "all">("pending");
  const [typeFilter, setTypeFilter] = useState<ClaimType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialClaims.find((c) => c.status === "pending")?.id ?? null
  );
  const [judgeNote, setJudgeNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [endingGame, setEndingGame] = useState(false);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(CHANNEL);

    channel.bind(EVENTS.CLAIMED, (data: Claim) => {
      setClaims((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [data, ...prev];
      });
      // si no hay nada seleccionado, seleccionar este
      setSelectedId((prev) => prev ?? data.id);
    });

    channel.bind(EVENTS.VALIDATED, (data: Claim) => {
      setClaims((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    });

    channel.bind(EVENTS.SLOTS_UPDATED, (data: SlotState) => setSlots(data));

    channel.bind(EVENTS.GAME_ENDED, (data: GameState) => {
      setSlots((s) => ({ ...s, gameStatus: data.status }));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
    };
  }, []);

  const filtered = useMemo(
    () =>
      claims.filter((c) => {
        if (filter !== "all" && c.status !== filter) return false;
        if (typeFilter !== "all" && c.type !== typeFilter) return false;
        return true;
      }),
    [claims, filter, typeFilter]
  );

  const selected = useMemo(
    () => claims.find((c) => c.id === selectedId) ?? null,
    [claims, selectedId]
  );

  useEffect(() => {
    setJudgeNote(selected?.judgeNote ?? "");
  }, [selected]);

  async function validate(status: "approved" | "rejected") {
    if (!selected || updating) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          status,
          judgeNote: judgeNote.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("validate failed");
      const data = await res.json();
      setClaims((prev) =>
        prev.map((c) => (c.id === data.claim.id ? data.claim : c))
      );
      if (data.slots) setSlots(data.slots);
      // pasar al siguiente pendiente automaticamente
      const remaining = claims
        .filter((c) => c.id !== selected.id && c.status === "pending")
        .sort((a, b) => a.claimedAt - b.claimedAt);
      setSelectedId(remaining[0]?.id ?? null);
    } catch (e) {
      alert("No se pudo validar. Probá de nuevo.");
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  async function endGame() {
    if (endingGame) return;
    if (!confirm("¿Terminar el juego? Esto dispara el ranking final y nadie podrá seguir cantando.")) return;
    setEndingGame(true);
    try {
      const res = await fetch("/api/game/end", { method: "POST" });
      if (!res.ok) throw new Error("end game failed");
      window.open("/ranking", "_blank");
    } catch (e) {
      alert("No se pudo terminar. Probá de nuevo.");
      console.error(e);
    } finally {
      setEndingGame(false);
    }
  }

  async function resetGame() {
    if (!confirm("¿Reabrir el juego? Vuelve a estado 'jugando'. Los claims y players siguen ahí.")) return;
    await fetch("/api/game/reset", { method: "POST" });
  }

  const counts = useMemo(
    () => ({
      pending: claims.filter((c) => c.status === "pending").length,
      approved: claims.filter((c) => c.status === "approved").length,
      rejected: claims.filter((c) => c.status === "rejected").length,
    }),
    [claims]
  );

  const gameEnded = slots.gameStatus === "ended";

  return (
    <main className="min-h-screen">
      <div className="h-3 bg-ril-terracotta" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        <header className="mb-5 flex justify-between items-center gap-3 flex-wrap">
          <Logo />
          <div className="flex gap-2 items-center">
            <span className="eyebrow hidden sm:block">Vista del jurado</span>
            <a
              href="/ranking"
              target="_blank"
              className="text-sm text-ril-teal hover:underline font-semibold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Ver ranking →
            </a>
          </div>
        </header>

        <h1 className="headline text-3xl sm:text-4xl mb-5">
          Validación de bingos
        </h1>

        {/* Slot status */}
        <div className="mb-5 grid sm:grid-cols-3 gap-3">
          <SlotBox
            label="Líneas cantadas"
            value={`${slots.lineasTaken} / ${SCORING.maxLineasGlobal}`}
            sub={`${slots.lineasApproved} aprobadas`}
            full={slots.lineasTaken >= SCORING.maxLineasGlobal}
          />
          <SlotBox
            label="Bingo"
            value={slots.bingoTaken ? "Cantado" : "Disponible"}
            sub={slots.bingoApproved ? "✓ Aprobado" : "—"}
            full={slots.bingoTaken}
          />
          <div className="rounded-lg border border-ril-line bg-ril-cream-light p-3 flex flex-col gap-2 justify-center">
            {gameEnded ? (
              <button
                onClick={resetGame}
                className="bg-ril-ink text-white font-bold uppercase tracking-wider rounded text-sm py-2"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                Reabrir juego
              </button>
            ) : (
              <button
                onClick={endGame}
                disabled={endingGame}
                className="bg-ril-terracotta hover:bg-ril-terracotta-dark text-white font-bold uppercase tracking-wider rounded text-sm py-2"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                {endingGame ? "Terminando…" : "Finalizar juego"}
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          {(
            [
              { v: "pending", label: "Pendientes", count: counts.pending },
              { v: "approved", label: "Aprobados", count: counts.approved },
              { v: "rejected", label: "Rechazados", count: counts.rejected },
              {
                v: "all",
                label: "Todos",
                count: counts.pending + counts.approved + counts.rejected,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition uppercase tracking-wider font-semibold ${
                filter === f.v
                  ? "bg-ril-terracotta border-ril-terracotta-dark text-white"
                  : "bg-ril-cream-light border-ril-line text-ril-ink hover:border-ril-teal"
              }`}
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {f.label} <span className="ml-1 opacity-75">({f.count})</span>
            </button>
          ))}

          <span className="mx-2 text-ril-line">|</span>

          {(
            [
              { v: "all", label: "Todos" },
              { v: "linea", label: "Líneas" },
              { v: "bingo", label: "Bingos" },
            ] as const
          ).map((t) => (
            <button
              key={t.v}
              onClick={() => setTypeFilter(t.v)}
              className={`px-3 py-1 rounded-full text-xs border transition uppercase tracking-wider font-semibold ${
                typeFilter === t.v
                  ? "bg-ril-teal border-ril-teal text-white"
                  : "bg-ril-cream-light border-ril-line text-ril-ink hover:border-ril-teal"
              }`}
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <aside className="lg:col-span-1 bg-ril-cream-light border border-ril-line/60 rounded-lg overflow-hidden">
            <div
              className="px-3 py-2 bg-ril-cream border-b border-ril-line/60 text-xs font-semibold text-ril-ink-soft uppercase tracking-wider"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {filtered.length} cantado{filtered.length === 1 ? "" : "s"}
            </div>
            <ul className="max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 && (
                <li className="p-4 text-sm text-ril-ink-soft text-center">
                  Sin cantos por acá.
                </li>
              )}
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left px-3 py-3 border-b border-ril-line/40 transition ${
                      selectedId === c.id ? "bg-ril-teal-soft/40" : "hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-semibold text-ril-ink text-sm truncate flex items-center gap-2">
                        <TypeBadge type={c.type} />
                        {c.nickname}
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-ril-ink-soft mt-0.5 truncate">
                      {c.fichaTitle}
                    </div>
                    <div className="text-[10px] text-ril-ink-soft/70 mt-0.5">
                      {new Date(c.claimedAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="lg:col-span-2 bg-ril-cream-light border border-ril-line/60 rounded-lg">
            {!selected && (
              <div className="p-8 text-center text-ril-ink-soft">
                {counts.pending > 0
                  ? "Elegí un canto pendiente."
                  : "Sin cantos pendientes."}
              </div>
            )}
            {selected && (
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={selected.type} large />
                      <h2 className="headline text-2xl">{selected.nickname}</h2>
                    </div>
                    <p className="text-sm text-ril-ink-soft">
                      {selected.fichaTitle} ·{" "}
                      {new Date(selected.claimedAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mb-6">
                  <p className="eyebrow mb-2">Casillas marcadas por el jugador</p>
                  <div className="grid grid-cols-3 gap-2 max-w-lg">
                    {BINGO_CELLS.map((cell) => {
                      const isMarked = selected.markedCells.includes(cell.id);
                      const isWinning = selected.winningCells.includes(cell.id);
                      return (
                        <div
                          key={cell.id}
                          className={`aspect-square rounded border-2 p-2 text-[10px] flex items-center justify-center text-center font-medium ${
                            isWinning && selected.type === "bingo"
                              ? "bg-ril-terracotta border-ril-terracotta-dark text-white"
                              : isWinning
                                ? "bg-ril-teal border-ril-teal text-white"
                                : isMarked
                                  ? "bg-ril-teal-soft border-ril-teal text-ril-ink"
                                  : "bg-white border-ril-line/50 text-ril-ink-soft"
                          }`}
                        >
                          {cell.text}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-ril-ink-soft mt-2 italic">
                    {selected.type === "linea"
                      ? "El jugador dice tener línea (3 casillas en color RIL). Verificá con él/ella la conversación."
                      : "El jugador dice tener bingo (las 9 casillas). Verificá con él/ella la conversación."}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="eyebrow mb-2 block">
                    Nota (opcional)
                  </label>
                  <textarea
                    value={judgeNote}
                    onChange={(e) => setJudgeNote(e.target.value)}
                    placeholder="Apuntá algo si querés (ej: 'casilla 5 dudosa pero le doy ok')"
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-ril-line rounded text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => validate("rejected")}
                    disabled={updating || selected.status === "rejected"}
                    className="px-4 py-2 bg-ril-ink hover:bg-ril-ink-soft disabled:opacity-50 text-white font-bold rounded text-sm uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    {selected.status === "rejected" ? "Rechazado" : "Rechazar"}
                  </button>
                  <button
                    onClick={() => validate("approved")}
                    disabled={updating || selected.status === "approved"}
                    className="px-4 py-2 bg-ril-sage hover:opacity-90 disabled:opacity-50 text-white font-bold rounded text-sm uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    {selected.status === "approved"
                      ? "Aprobado ✓"
                      : `Aprobar ${selected.type}`}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: ClaimStatus }) {
  const map = {
    pending: {
      label: "Pendiente",
      cls: "bg-ril-terracotta/15 text-ril-terracotta-dark border-ril-terracotta/30",
    },
    approved: { label: "Aprobado", cls: "bg-ril-sage/25 text-ril-ink border-ril-sage" },
    rejected: { label: "Rechazado", cls: "bg-ril-ink/10 text-ril-ink border-ril-ink/20" },
  } as const;
  const m = map[status];
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${m.cls}`}
      style={{ fontFamily: "var(--font-condensed)" }}
    >
      {m.label}
    </span>
  );
}

function TypeBadge({ type, large }: { type: ClaimType; large?: boolean }) {
  const isLinea = type === "linea";
  return (
    <span
      className={`${large ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5"} rounded font-bold uppercase tracking-wider ${
        isLinea
          ? "bg-ril-teal text-white"
          : "bg-ril-terracotta text-white"
      }`}
      style={{ fontFamily: "var(--font-condensed)" }}
    >
      {isLinea ? "Línea" : "Bingo"}
    </span>
  );
}

function SlotBox({
  label,
  value,
  sub,
  full,
}: {
  label: string;
  value: string;
  sub: string;
  full: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        full ? "bg-ril-cream border-ril-line text-ril-ink-soft" : "bg-ril-cream-light border-ril-line"
      }`}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wider text-ril-ink-soft"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-0.5"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        {value}
      </p>
      <p className="text-xs text-ril-ink-soft">{sub}</p>
    </div>
  );
}
