"use client";

import { useEffect, useMemo, useState } from "react";
import type { Claim } from "@/lib/types";
import { getPusherClient, CHANNEL, EVENTS } from "@/lib/pusher-client";
import { Logo } from "@/components/Logo";
import { MoleculePattern, LighthouseLine } from "@/components/MoleculePattern";

export default function PantallaLive({
  initialClaims,
}: {
  initialClaims: Claim[];
}) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [flash, setFlash] = useState<Claim | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(CHANNEL);

    channel.bind(EVENTS.CLAIMED, (data: Claim) => {
      setClaims((prev) => [data, ...prev.filter((c) => c.id !== data.id)]);
      setFlash(data);
      setTimeout(() => setFlash(null), 4000);
    });

    channel.bind(EVENTS.VALIDATED, (data: Claim) => {
      setClaims((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
    };
  }, []);

  const approved = useMemo(
    () => claims.filter((c) => c.status === "approved"),
    [claims]
  );

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="h-6 bg-ril-terracotta" />

      <MoleculePattern
        className="absolute -right-32 -top-10 w-[700px] pointer-events-none"
        opacity={0.35}
      />
      <LighthouseLine
        className="absolute left-8 bottom-8 w-56 pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-8 pt-8 pb-12">
        <header className="flex justify-between items-center mb-10">
          <Logo showTagline />
          <span className="eyebrow text-sm">
            Viernes de inteligencia colectiva
          </span>
        </header>

        <div className="mb-10">
          <p className="eyebrow text-base mb-2">En vivo</p>
          <h1 className="headline text-6xl">
            Bingo del agente
            <br />
            <span className="text-ril-terracotta">GIRSU</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <section>
            <h2
              className="text-base font-bold uppercase tracking-[0.18em] text-ril-ink-soft mb-4"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Bingos cantados
            </h2>
            <ul className="space-y-2">
              {claims.length === 0 && (
                <li className="text-ril-ink-soft text-lg italic">
                  Esperando los primeros bingos…
                </li>
              )}
              {claims.slice(0, 10).map((c) => (
                <li
                  key={c.id}
                  className="bg-ril-cream-light border border-ril-line/60 rounded-lg px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <div
                      className="headline text-xl"
                      style={{ letterSpacing: "0.01em" }}
                    >
                      {c.nickname}
                    </div>
                    <div className="text-sm text-ril-ink-soft">
                      {c.fichaTitle}
                    </div>
                  </div>
                  <StatusPill status={c.status} />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="text-base font-bold uppercase tracking-[0.18em] text-ril-sage mb-4"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Bingos válidos · {approved.length}
            </h2>
            <ul className="space-y-2">
              {approved.length === 0 && (
                <li className="text-ril-ink-soft text-lg italic">
                  Ninguno validado aún.
                </li>
              )}
              {approved.map((c, i) => (
                <li
                  key={c.id}
                  className="bg-ril-sage/15 border-2 border-ril-sage rounded-lg px-4 py-3 flex items-center gap-4"
                >
                  <span
                    className="headline text-3xl text-ril-sage"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="headline text-xl">{c.nickname}</div>
                    <div className="text-sm text-ril-ink-soft">
                      {c.fichaTitle}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {flash && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-ril-terracotta text-white px-16 py-10 rounded-2xl shadow-2xl animate-pop animate-pulse-glow text-center border-4 border-white">
            <p
              className="text-sm uppercase tracking-[0.3em] mb-2 opacity-90"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Cantó bingo
            </p>
            <div
              className="text-7xl font-bold uppercase"
              style={{ fontFamily: "var(--font-condensed)", letterSpacing: "0.05em" }}
            >
              ¡BINGO!
            </div>
            <div
              className="text-3xl mt-3"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {flash.nickname}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusPill({ status }: { status: Claim["status"] }) {
  const map = {
    pending: {
      label: "Pendiente",
      cls: "bg-ril-terracotta/20 text-ril-terracotta-dark",
    },
    approved: { label: "✓ Válido", cls: "bg-ril-sage/30 text-ril-ink" },
    rejected: { label: "✗ Inválido", cls: "bg-ril-ink/15 text-ril-ink-soft" },
  } as const;
  const m = map[status];
  return (
    <span
      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${m.cls}`}
      style={{ fontFamily: "var(--font-condensed)" }}
    >
      {m.label}
    </span>
  );
}
