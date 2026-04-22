"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const teamMembers = [
  {
    name: "Founder / Strategy",
    role: "Narrative, positioning, client architecture",
    description: "Narrative, positioning, and client architecture."
  },
  {
    name: "Founder / Creative",
    role: "Design direction, motion, systems execution",
    description: "Visual language, motion, and launch-ready execution."
  }
];

const fundAllocation = [
  { label: "Creative systems", value: 40 },
  { label: "Production capacity", value: 30 },
  { label: "Growth and pipeline", value: 20 },
  { label: "Operations", value: 10 }
];

export default function TeamAskSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="ask"
      ref={ref}
      className="bg-[radial-gradient(ellipse_at_bottom,_rgba(151,176,209,0.08)_0%,_transparent_62%)] px-6 pb-18 pt-18 md:pb-22 md:pt-20"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="deck-kicker mb-5 text-xs">
              08 / TEAM & ASK
            </p>
            <h2 className="max-w-4xl text-3xl tracking-tight text-white md:text-5xl">
              Ready to begin?
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-white/44 md:text-right">
            Compact close. Clear team. Clear ask.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="grid gap-3"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.7, delay: 0.14 + index * 0.08 }}
                className={`${index === 0 ? "deck-tint-warm" : "deck-tint-cool"} deck-panel deck-frame rounded-[1.5rem] p-5`}
              >
                <p className="text-lg tracking-tight text-white">{member.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/34">
                  {member.role}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
                  {member.description}
                </p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="deck-panel deck-frame deck-tint-warm rounded-[1.5rem] p-5"
            >
              <p className="text-xs uppercase tracking-[0.32em] text-white/36">
                Operator Fit
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/68 md:text-base">
                Small team. High taste. Clear execution ownership.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="deck-panel deck-frame overflow-hidden rounded-[2rem] p-0"
          >
            <div className="relative">
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="aspect-[16/8.2] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,_rgba(230,215,192,0.18),_transparent_28%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.32em] text-white/36">
                  The Ask
                </p>
                <p className="mt-3 text-5xl leading-none tracking-tight text-white md:text-6xl">
                  $3M
                </p>
                <p className="mt-2 text-base text-white/52">
                  Seed round to scale capacity and compound demand.
                </p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="space-y-4">
                {fundAllocation.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ duration: 0.6, delay: 0.24 + index * 0.06 }}
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-white/50">{item.label}</span>
                      <span className="text-white/72">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05]">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-white/30 via-white/60 to-white"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="deck-panel-soft deck-frame rounded-[1.5rem] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/34">
                    Next Step
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
                    Looking for aligned partners with taste and long-term conviction.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <a
                    href="mailto:hello@asme.co"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                  >
                    Request intro
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#about"
                    className="liquid-glass inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white"
                  >
                    Revisit
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-4 text-[10px] text-white/28 md:flex-row md:items-center md:justify-between"
        >
          <p>Asme</p>
          <div className="flex items-center gap-5">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#ask">Ask</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
