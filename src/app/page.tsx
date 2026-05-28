"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FICHAS } from "@/lib/fichas";
import { Logo } from "@/components/Logo";
import { MoleculePattern, LighthouseLine } from "@/components/MoleculePattern";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [fichaId, setFichaId] = useState("");

  function start() {
    if (!nickname.trim() || !fichaId) return;
    sessionStorage.setItem("bingo:nickname", nickname.trim());
    sessionStorage.setItem("bingo:fichaId", fichaId);
    router.push("/play");
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="h-12 bg-ril-terracotta" />

      <MoleculePattern
        className="absolute -right-20 top-20 w-[480px] hidden md:block pointer-events-none"
        opacity={0.45}
      />
      <LighthouseLine
        className="absolute left-4 bottom-4 w-40 hidden md:block pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-6 pb-12">
        <header className="flex justify-between items-center mb-12">
          <Logo showTagline />
          <span className="eyebrow hidden sm:block">
            Viernes de inteligencia colectiva
          </span>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="pt-2 sm:pt-4">
            <p className="eyebrow mb-3">Bingo del agente</p>
            <h1 className="headline text-4xl sm:text-6xl mb-4 leading-tight">
              Probá el
              <br />
              <span className="text-ril-terracotta">agente GIRSU</span>
              <br />
              y cantá bingo.
            </h1>
            <p className="text-ril-ink-soft text-sm sm:text-lg max-w-md">
              Te toca una situación municipal. Conversás con el agente. Marcá
              las cosas que va cumpliendo (y las que se equivoca). Cuando
              completes una línea o un bingo, cantalo en voz alta. Tu feedback
              es lo más valioso que se lleva el taller.
            </p>
            <p className="mt-3 text-xs text-ril-teal max-w-md italic">
              Tip: andá al agente en la compu y el bingo en el celular.
            </p>
          </div>

          <div className="bg-ril-cream-light border border-ril-line/60 rounded-2xl p-6 sm:p-8 shadow-sm">
            <p className="eyebrow mb-4">Empezá a jugar</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ril-ink mb-1.5 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-condensed)" }}>
                  Tu nombre o apodo
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ej: Marta"
                  maxLength={30}
                  className="w-full px-3 py-2.5 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal focus:border-ril-teal text-ril-ink"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ril-ink mb-1.5 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-condensed)" }}>
                  Tu ficha (según tu apellido)
                </label>
                <select
                  value={fichaId}
                  onChange={(e) => setFichaId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-ril-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ril-teal text-ril-ink"
                >
                  <option value="">Elegí según tu apellido…</option>
                  {FICHAS.map((f) => (
                    <option key={f.id} value={f.id}>
                      Apellidos {f.letras} — {f.title}
                    </option>
                  ))}
                </select>
                {fichaId && (() => {
                  const f = FICHAS.find((x) => x.id === fichaId);
                  if (!f) return null;
                  return (
                    <div className="text-sm text-ril-ink-soft mt-2 bg-white border-l-4 border-ril-teal rounded-r p-3">
                      <p className="text-[11px] uppercase tracking-wider text-ril-teal mb-1">
                        {f.category}
                      </p>
                      <p className="font-bold text-ril-ink mb-1">{f.title}</p>
                      <p>{f.question}</p>
                      <p className="text-[11px] text-ril-ink-soft/80 mt-2 italic">
                        El caso completo aparece cuando entrás a jugar.
                      </p>
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={start}
                disabled={!nickname.trim() || !fichaId}
                className="w-full bg-ril-terracotta hover:bg-ril-terracotta-dark disabled:bg-ril-line disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition uppercase tracking-wider"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                Empezar a jugar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
