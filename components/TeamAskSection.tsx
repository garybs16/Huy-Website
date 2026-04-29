"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LazyVideo from "@/components/LazyVideo";

const teamMembers = [
  {
    slotLabel: "Founder portrait",
    portraitInitials: "CEO",
    name: "CEO / 3D Vision",
    role: "Product, research translation, company direction",
    description: "Ex-Pixar tools lead. 3D vision."
  },
  {
    slotLabel: "Co-founder portrait",
    portraitInitials: "CTO",
    name: "CTO / Generative Models",
    role: "Model architecture, infrastructure, core rendering stack",
    description: "Ex-OpenAI researcher. Generative video systems."
  }
];

export default function TeamAskSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="team"
      ref={ref}
      className="deck-section bg-[radial-gradient(ellipse_at_bottom,_rgba(151,176,209,0.08)_0%,_transparent_62%)] px-6 pb-28 pt-18 md:pb-32 md:pt-20"
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
              06 / TEAM
            </p>
            <h2 className="max-w-4xl text-3xl tracking-tight text-white md:text-5xl">
              Built by operators who know the stack.
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-white/56 md:text-right">
            Product depth. Model depth. Clear taste.
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
                className={`${index === 0 ? "deck-tint-warm" : "deck-tint-cool"} deck-panel-matte deck-frame rounded-[1.5rem] p-5`}
              >
                <div className="grid gap-4 sm:grid-cols-[0.42fr_1fr] sm:items-end">
                  <div className="deck-media relative overflow-hidden rounded-[1.25rem] bg-black/58">
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-[radial-gradient(circle_at_50%_28%,_rgba(255,255,255,0.14),_transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.01)),radial-gradient(circle_at_50%_118%,_rgba(255,255,255,0.08),_transparent_28%)]">
                      <span className="text-2xl text-white/34 md:text-3xl">
                        {member.portraitInitials}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="deck-panel-soft rounded-full px-3 py-1.5 text-[11px] text-white/76">
                        {member.slotLabel}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-lg tracking-tight text-white">{member.name}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/46">
                      {member.role}
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/66">
                      {member.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="deck-panel-soft deck-frame rounded-[1.5rem] p-5"
            >
              <p className="text-xs uppercase tracking-[0.32em] text-white/50">
                Operator Fit
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/78 md:text-base">
                Small team. Senior depth.
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
              <LazyVideo
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="aspect-[16/8.2] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/28 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,_rgba(230,215,192,0.18),_transparent_28%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.32em] text-white/52">
                  Company Build
                </p>
                <p className="mt-3 max-w-xl text-3xl leading-[1.02] tracking-tight text-white/96 md:text-[2.8rem]">
                  Research, infrastructure, product.
                </p>
                <p className="mt-3 max-w-md text-base text-white/68">
                  One compact team across the stack.
                </p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                <div className="deck-panel-matte deck-frame flex flex-col justify-between rounded-[1.6rem] p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/48">
                      Reach
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/72">
                      Product walkthroughs and technical deep dives.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Research", "Infrastructure", "Product"].map((item) => (
                      <div
                        key={item}
                        className="deck-panel-soft deck-frame rounded-full px-4 py-2 text-[12px] text-white/82"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                  <a
                    href="mailto:founders@unstableml.ai"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                  >
                    Contact team
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#demo"
                    className="liquid-glass inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white"
                  >
                    Watch demo
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
