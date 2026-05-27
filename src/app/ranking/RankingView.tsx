"use client";

import { useEffect, useState } from "react";
import type { GameState, PlayerScore } from "@/lib/types";
import { getPusherClient, CHANNEL, EVENTS } from "@/lib/pusher-client";
import { Logo } from "@/components/Logo";
import { SCORING } from "@/lib/scoring";
import {
  MoleculePattern,
  LighthouseLine,
} from "@/components/MoleculePattern";

export default function RankingView({
  initialRanking,
  initialGame,
}: {
  initialRanking: PlayerScore[];
  initialGame: GameState;
}) {
  const [ranking, setRanking] = useState<PlayerScore[]>(initialRanking);
  const [game, setGame] = useState<GameState>(initialGame);

  // Refetch en eventos
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(CHANNEL);

    const refetch = () => {
      fetch("/api/ranking")
        .then((r) => r.json())
        .then((d) => {
          setRanking(d.ranking ?? []);
          setGame(d.game ?? game);
        })
        .catch(() => {});
    };

    channel.bind(EVENTS.GAME_ENDED, refetch);
    channel.bind(EVENTS.VALIDATED, refetch);
    channel.bind(EVENTS.CLAIMED, refetch);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
    };
  }, [game]);

  // Si abriste el ranking durante el juego, refrescar peridoicamente igual
  useEffect(() => {
    if (game.status === "ended") return;
    const t = setInterval(() => {
      fetch("/api/ranking")
        .then((r) => r.json())
        .then((d) => {
          setRanking(d.ranking ?? []);
          setGame(d.game ?? game);
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [game]);

  const winner = ranking[0];
  const ended = game.status === "ended";

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="h-3 bg-ril-terracotta" />

      <MoleculePattern
        className="absolute -right-32 -top-10 w-[600px] pointer-events-none hidden md:block"
        opacity={0.3}
      />
      <LighthouseLine
        className="absolute left-4 bottom-4 w-32 pointer-events-none hidden md:block"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        <header className="mb-6 flex justify-between items-center">
          <Logo showTagline />
          <span className="eyebrow hidden sm:block">
            {ended ? "Resultado final" : "Ranking en vivo"}
          </span>
        </header>

        {ended && winner && (
          <div className="bg-ril-terracotta text-white rounded-2xl p-6 sm:p-8 mb-6 text-center shadow-xl">
            <p className="eyebrow text-white/80 mb-1">Ganador/a</p>
            <h1
              className="headline text-5xl sm:text-6xl mb-2"
              style={{ letterSpacing: "0.03em" }}
            >
              {winner.player.nickname}
            </h1>
            <p className="text-white/90 text-sm">
              {winner.player.fichaTitle} ·{" "}
              <strong>{winner.total} puntos</strong>
            </p>
          </div>
        )}

        {!ended && (
          <div className="bg-ril-cream-light border border-ril-line rounded-lg p-4 mb-6 text-center">
            <p
              className="eyebrow mb-1"
              style={{ color: "var(--ril-teal)" }}
            >
              El juego sigue
            </p>
            <p className="text-sm text-ril-ink-soft">
              Cuando el jurado termine, acá aparece el ganador.
            </p>
          </div>
        )}

        <h2 className="headline text-2xl mb-3">
          Ranking ({ranking.length} jugador{ranking.length === 1 ? "" : "es"})
        </h2>

        {ranking.length === 0 && (
          <p className="text-ril-ink-soft italic">
            Todavía no hay jugadores cargados.
          </p>
        )}

        <ol className="space-y-2">
          {ranking.map((r, i) => (
            <li
              key={r.player.id}
              className={`rounded-lg border-2 p-3 sm:p-4 ${
                i === 0 && ended
                  ? "bg-ril-sage/15 border-ril-sage"
                  : "bg-ril-cream-light border-ril-line/60"
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`headline text-3xl w-12 text-center ${
                    i === 0 ? "text-ril-terracotta" : "text-ril-ink-soft"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <p className="headline text-xl">{r.player.nickname}</p>
                  <p className="text-xs text-ril-ink-soft">
                    {r.player.fichaTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="headline text-3xl text-ril-ink"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {r.total}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-ril-ink-soft">
                    puntos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                <Breakdown
                  label="Casillas"
                  value={r.cellPoints}
                  detail={`${r.player.markedCells.length} x ${SCORING.pointsPerCell}`}
                />
                <Breakdown
                  label="Línea"
                  value={r.lineaPoints}
                  detail={r.hasLineaApproved ? "✓" : "—"}
                  highlight={r.hasLineaApproved}
                />
                <Breakdown
                  label="Bingo"
                  value={r.bingoPoints}
                  detail={r.hasBingoApproved ? "✓" : "—"}
                  highlight={r.hasBingoApproved}
                />
                <Breakdown
                  label="Feedback"
                  value={r.feedbackPoints}
                  detail={`${r.feedbackWords} pal.`}
                  highlight={r.feedbackPoints > 0}
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 text-xs text-ril-ink-soft border-t border-ril-line pt-4">
          <p className="font-semibold mb-1">Cómo se puntúa:</p>
          <ul className="space-y-0.5">
            <li>· Cada casilla marcada: {SCORING.pointsPerCell} pts</li>
            <li>
              · Línea aprobada: {SCORING.pointsPerLineaApproved} pts (bonus)
            </li>
            <li>
              · Bingo aprobado: {SCORING.pointsPerBingoApproved} pts (bonus)
            </li>
            <li>
              · Feedback: {SCORING.pointsPerFeedbackWord} pts por palabra (hasta{" "}
              {SCORING.maxFeedbackWords} palabras)
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function Breakdown({
  label,
  value,
  detail,
  highlight,
}: {
  label: string;
  value: number;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded p-2 text-center ${
        highlight ? "bg-ril-teal-soft/40" : "bg-white border border-ril-line/40"
      }`}
    >
      <p
        className="text-[9px] uppercase tracking-wider text-ril-ink-soft"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        {label}
      </p>
      <p className="font-bold text-base text-ril-ink">{value}</p>
      <p className="text-[9px] text-ril-ink-soft">{detail}</p>
    </div>
  );
}
