"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const marketSignals = [
  {
    value: "$18B",
    label: "Creative tooling market",
    detail: "Brands and studios are shifting budget toward faster, more flexible production systems."
  },
  {
    value: "4x",
    label: "Demand for rapid iteration",
    detail: "Teams expect campaign concepts, visual systems, and motion assets in days instead of weeks."
  },
  {
    value: "68%",
    label: "Spend moving in-house",
    detail: "Operators want premium output without handing strategy and execution entirely to external teams."
  }
];

export default function OpportunitySection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="market"
      ref={ref}
      className="bg-[radial-gradient(ellipse_at_top,_rgba(230,215,192,0.08)_0%,_transparent_68%)] px-6 py-28 md:py-40"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="deck-kicker mb-5 text-xs">
              06 / OPPORTUNITY
            </p>
            <h2 className="max-w-4xl text-4xl leading-[1.02] tracking-tight text-white md:text-6xl lg:text-7xl">
              The window is open for{" "}
              <span
                className="text-white/55"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic"
                }}
              >
                premium
              </span>{" "}
              teams that move with startup speed.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-white/48 md:text-right">
            This section frames the market case: the appetite for sharper
            creative systems is growing faster than traditional agencies and
            slower internal teams can respond.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 42 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 42 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="deck-frame relative overflow-hidden rounded-[2rem]"
          >
            <video
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="aspect-[16/12] h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="liquid-glass deck-frame deck-tint-warm max-w-xl rounded-[1.75rem] p-6">
                <p className="mb-3 text-xs uppercase tracking-[0.32em] text-white/36">
                  Market Thesis
                </p>
                <p className="text-lg leading-relaxed text-white/80 md:text-2xl">
                  One partner. Premium output. Startup speed.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 42 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 42 }}
            transition={{ duration: 0.8, delay: 0.18 }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
              {marketSignals.map((signal, index) => (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={{ duration: 0.7, delay: 0.16 + index * 0.08 }}
                  className={`${index === 1 ? "deck-tint-cool" : "deck-tint-warm"} liquid-glass deck-frame rounded-3xl p-5`}
                >
                  <p className="text-3xl tracking-tight text-white md:text-4xl">
                    {signal.value}
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/35">
                    {signal.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">
                    {signal.detail}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="liquid-glass deck-frame rounded-[2rem] p-7">
              <p className="text-xs uppercase tracking-[0.32em] text-white/36">
                What Changed
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  "Lean teams need investor-grade assets.",
                  "Cycles are shorter and expectations are higher.",
                  "Premium no longer means slow."
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white/58"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
