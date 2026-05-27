"use client";

import { useEffect, useMemo, useState } from "react";
import type { Claim, ClaimStatus } from "@/lib/types";
import { BINGO_CELLS } from "@/lib/bingo-card";
import { getPusherClient, CHANNEL, EVENTS } from "@/lib/pusher-client";
import { Logo } from "@/components/Logo";

export default function JuezDashboard({
  initialClaims,
}: {
  initialClaims: Claim[];
}) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [filter, setFilter] = useState<ClaimStatus | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialClaims.find((c) => c.status === "pending")?.id ?? null
  );
  const [judgeNote, setJudgeNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(CHANNEL);

    channel.bind(EVENTS.CLAIMED, (data: Claim) => {
      setClaims((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    channel.bind(EVENTS.VALIDATED, (data: Claim) => {
      setClaims((prev) =>
        prev.map((c) => (c.id === data.id ? data : c))
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
    };
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? claims
        : claims.filter((c) => c.status === filter),
    [claims, filter]
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
      const updated = (await res.json()) as Claim;
      setClaims((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (e) {
      alert("No se pudo validar. Probá de nuevo.");
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  const counts = useMemo(
    () => ({
      pending: claims.filter((c) => c.status === "pending").length,
      approved: claims.filter((c) => c.status === "approved").length,
      rejected: claims.filter((c) => c.status === "rejected").length,
    }),
    [claims]
  );

  return (
    <main className="min-h-screen">
      <div className="h-3 bg-ril-terracotta" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        <header className="mb-5 flex justify-between items-center">
          <Logo />
          <span className="eyebrow hidden sm:block">Vista del jurado</span>
        </header>

        <h1 className="headline text-3xl sm:text-4xl mb-6">
          Validación de bingos
        </h1>

        <div className="flex gap-2 mb-5 flex-wrap">
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
              {f.label}{" "}
              <span className="ml-1 opacity-75">({f.count})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <aside className="lg:col-span-1 bg-ril-cream-light border border-ril-line/60 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-ril-cream border-b border-ril-line/60 text-xs font-semibold text-ril-ink-soft uppercase tracking-wider"
              style={{ fontFamily: "var(--font-condensed)" }}>
              {filtered.length} bingo{filtered.length === 1 ? "" : "s"}
            </div>
            <ul className="max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 && (
                <li className="p-4 text-sm text-ril-ink-soft text-center">
                  Sin bingos por acá todavía.
                </li>
              )}
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left px-3 py-3 border-b border-ril-line/40 transition ${
                      selectedId === c.id
                        ? "bg-ril-teal-soft/40"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-semibold text-ril-ink text-sm truncate">
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
                Elegí un bingo de la lista para verlo.
              </div>
            )}
            {selected && (
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 gap-3 flex-wrap">
                  <div>
                    <h2 className="headline text-2xl">{selected.nickname}</h2>
                    <p className="text-sm text-ril-ink-soft">
                      {selected.fichaTitle} ·{" "}
                      {new Date(selected.claimedAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mb-4">
                  <p className="eyebrow mb-2">Casillas marcadas</p>
                  <div className="grid grid-cols-3 gap-1 max-w-md">
                    {BINGO_CELLS.map((cell) => {
                      const isMarked = selected.markedCells.includes(cell.id);
                      const isWinning = selected.winningLine.includes(cell.id);
                      return (
                        <div
                          key={cell.id}
                          className={`aspect-square rounded border p-1 text-[9px] flex items-center justify-center text-center ${
                            isWinning
                              ? "bg-ril-terracotta border-ril-terracotta-dark text-white"
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
                </div>

                <div className="mb-4">
                  <p className="eyebrow mb-2">Conversación con el agente</p>
                  <div className="bg-white border border-ril-line/60 rounded p-3 max-h-[40vh] overflow-y-auto whitespace-pre-wrap text-sm text-ril-ink font-mono">
                    {selected.conversation}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="eyebrow mb-2 block">
                    Nota del jurado (opcional)
                  </label>
                  <textarea
                    value={judgeNote}
                    onChange={(e) => setJudgeNote(e.target.value)}
                    placeholder="Por ejemplo: 'La casilla 5 no se cumplió, el agente inventó.'"
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-ril-line rounded text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => validate("rejected")}
                    disabled={updating}
                    className="px-4 py-2 bg-ril-ink hover:bg-ril-ink-soft disabled:opacity-50 text-white font-bold rounded text-sm uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => validate("approved")}
                    disabled={updating}
                    className="px-4 py-2 bg-ril-sage hover:opacity-90 disabled:opacity-50 text-white font-bold rounded text-sm uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    Aprobar bingo
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
    approved: {
      label: "Aprobado",
      cls: "bg-ril-sage/25 text-ril-ink border-ril-sage",
    },
    rejected: {
      label: "Rechazado",
      cls: "bg-ril-ink/10 text-ril-ink border-ril-ink/20",
    },
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
