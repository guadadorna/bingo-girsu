"use client";

import { useMemo, useState } from "react";
import type { PlayerState } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { BINGO_CELLS } from "@/lib/bingo-card";

type Props = { players: PlayerState[] };

export function AdminView({ players }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.nickname.toLowerCase().includes(q) ||
        p.fichaTitle.toLowerCase().includes(q) ||
        p.feedback.toLowerCase().includes(q)
    );
  }, [players, filter]);

  function downloadCsv() {
    const header = ["nickname", "ficha", "marcadas", "feedback", "guardado"];
    const rows = players.map((p) => [
      p.nickname,
      p.fichaTitle,
      p.markedCells
        .sort((a, b) => a - b)
        .map((id) => BINGO_CELLS[id]?.text ?? `#${id}`)
        .join(" | "),
      p.feedback,
      new Date(p.lastUpdatedAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bingo-girsu-feedback-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen">
      <div className="h-3 bg-ril-terracotta" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        <header className="mb-6 flex justify-between items-center gap-4 flex-wrap">
          <Logo />
          <span className="eyebrow">Admin · Feedback recibido</span>
        </header>

        <div className="mb-5 flex gap-3 flex-wrap items-center">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por nombre, ficha o texto…"
            className="flex-1 min-w-[200px] px-3 py-2 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal text-sm"
          />
          <span className="text-sm text-ril-ink-soft">
            {filtered.length} de {players.length}
          </span>
          <button
            onClick={downloadCsv}
            disabled={players.length === 0}
            className="px-4 py-2 bg-ril-teal text-white rounded-lg text-sm font-bold uppercase tracking-wider disabled:bg-ril-line disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Descargar CSV
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-ril-cream-light border border-ril-line rounded-lg p-8 text-center text-ril-ink-soft">
            {players.length === 0
              ? "Todavía no llegaron entregas."
              : "No hay resultados para ese filtro."}
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((p) => (
              <li
                key={p.id}
                className="bg-ril-cream-light border border-ril-line rounded-xl p-4 sm:p-5"
              >
                <div className="flex justify-between items-start gap-3 flex-wrap mb-3">
                  <div>
                    <p className="headline text-xl">{p.nickname}</p>
                    <p className="text-xs text-ril-ink-soft">
                      {p.fichaTitle}
                    </p>
                  </div>
                  <div className="text-right text-xs text-ril-ink-soft">
                    <p>
                      {p.markedCells.length}/9 casillas
                    </p>
                    <p>
                      {new Date(p.lastUpdatedAt).toLocaleString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {p.markedCells.length > 0 && (
                  <details className="mb-3">
                    <summary className="text-xs text-ril-teal cursor-pointer hover:underline">
                      Ver casillas marcadas
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-ril-ink-soft">
                      {p.markedCells
                        .sort((a, b) => a - b)
                        .map((id) => (
                          <li key={id}>
                            ✓ {BINGO_CELLS[id]?.text ?? `Casilla ${id}`}
                          </li>
                        ))}
                    </ul>
                  </details>
                )}

                {p.feedback.trim() ? (
                  <div className="bg-white border-l-4 border-ril-teal rounded-r-lg p-3 text-sm text-ril-ink whitespace-pre-wrap">
                    {p.feedback}
                  </div>
                ) : (
                  <p className="text-xs italic text-ril-ink-soft">
                    (Sin feedback escrito)
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
