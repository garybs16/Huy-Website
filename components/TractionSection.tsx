"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const tractionStats = [
  { value: "25k+", label: "Qualified waitlist" },
  { value: "42%", label: "Month-over-month growth" },
  { value: "88%", label: "Repeat client rate" },
  { value: "11", label: "Active retained engagements" }
];

const growthSeries = [
  { month: "Jan", value: 28 },
  { month: "Feb", value: 41 },
  { month: "Mar", value: 54 },
  { month: "Apr", value: 67 },
  { month: "May", value: 82 },
  { month: "Jun", value: 96 }
];

export default function TractionSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="traction" ref={ref} className="bg-black px-6 py-18 md:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="deck-kicker mb-5 text-xs">
              07 / TRACTION
            </p>
            <h2 className="max-w-3xl text-3xl tracking-tight text-white md:text-5xl lg:text-[3.8rem]">
              Early proof, tightening demand, and a repeatable growth pattern.
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-white/44 md:text-right">
            Proof, retention, and a clearer growth line.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[0.84fr_1.16fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {tractionStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.7, delay: 0.14 + index * 0.08 }}
                className={`${index % 2 === 0 ? "deck-tint-warm" : "deck-tint-cool"} deck-panel deck-frame rounded-[1.5rem] p-5`}
              >
                <p className="text-3xl tracking-tight text-white md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/34">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="deck-frame relative overflow-hidden rounded-[2rem]"
          >
            <video
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="aspect-[16/10] h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,_rgba(151,176,209,0.18),_transparent_24%)]" />

            <div className="absolute inset-0 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/36">
                    Revenue Signal
                  </p>
                  <p className="mt-2 text-xl tracking-tight text-white md:text-2xl">
                    Momentum that already compounds.
                  </p>
                </div>
                <p className="hidden text-sm text-white/34 md:block">Last 6 months</p>
              </div>

              <div className="mt-6 flex h-40 items-end gap-2 md:gap-3">
                {growthSeries.map((point, index) => (
                  <motion.div
                    key={point.month}
                    initial={{ opacity: 0, y: 18 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    transition={{ duration: 0.65, delay: 0.22 + index * 0.06 }}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="flex h-32 w-full items-end rounded-full bg-white/[0.08] p-1">
                      <div
                        className="w-full rounded-full bg-gradient-to-t from-[rgba(151,176,209,0.28)] via-[rgba(230,215,192,0.76)] to-white"
                        style={{ height: `${point.value}%` }}
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {point.month}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="deck-panel deck-frame deck-tint-cool rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/34">
                    Expansion
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/56">
                    Bigger scopes, longer retention.
                  </p>
                </div>
                <div className="deck-panel deck-frame deck-tint-warm rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/34">
                    Retention
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/56">
                    Repeat work is the strongest signal.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
