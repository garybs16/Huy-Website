"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import LazyVideo from "@/components/LazyVideo";

const plans = [
  {
    name: "Free",
    price: "$0",
    unit: "/mo",
    credits: "800 credits / month",
    detail: "Free entry."
  },
  {
    name: "Pro",
    price: "$20",
    unit: "/mo",
    credits: "15,000 credits / month",
    detail: "Monthly plan."
  }
];

export default function ServicesSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="services"
      className="deck-section deck-divider bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] px-6 py-20 md:py-24"
      ref={ref}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-10 grid gap-4 md:grid-cols-[1fr_0.36fr] md:items-end"
        >
          <div>
            <p className="deck-kicker mb-5 text-xs">
              05 / PRICING
            </p>
            <h2 className="max-w-3xl text-4xl leading-[0.96] tracking-tight text-white md:text-6xl lg:text-[4.5rem]">
              Low-friction
              <br />
              entry.{" "}
              <span
                className="text-white/82"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                Expansion
                <br />
                revenue by usage.
              </span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/60 md:justify-self-end md:text-right">
            Free entry. Pro plan. On-demand after cap.
          </p>
        </motion.div>

        <div className="grid gap-3">
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="deck-frame deck-media relative overflow-hidden rounded-[1.9rem]"
            >
              <LazyVideo
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="aspect-[16/6.7] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/38 to-black/12" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_50%,_rgba(214,164,98,0.24),_transparent_24%)]" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="deck-panel deck-frame rounded-[1.6rem] bg-black/70 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">
                    Revenue Engine
                  </p>
                  <p className="mt-2 max-w-2xl text-2xl leading-[1.08] tracking-tight text-white/96 md:text-[1.95rem]">
                    Free entry drives habit. Pro expands usage.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-[1.02fr_0.78fr]">
              <motion.div
                initial={{ opacity: 0, y: 34 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
                transition={{ duration: 0.8, delay: 0.14 }}
                className="deck-panel deck-frame rounded-[1.9rem] bg-black/56 p-5"
              >
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">
                  Pricing
                </p>

                <div className="mt-4 space-y-3">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 18 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                      transition={{ duration: 0.6, delay: 0.24 + index * 0.08 }}
                      className="rounded-[1.4rem] border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-2xl tracking-tight text-white">{plan.name}</p>
                          <p className="mt-2 max-w-[10rem] text-sm leading-relaxed text-white/74">
                            {plan.credits}
                          </p>
                        </div>

                        <p className="text-right text-4xl tracking-tight text-white">
                          {plan.price}
                          <span className="ml-1 text-lg text-white/64">{plan.unit}</span>
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-white/68">{plan.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 34 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
                transition={{ duration: 0.8, delay: 0.18 }}
                className="deck-panel deck-frame deck-tint-warm flex rounded-[1.9rem] bg-black/52 p-5"
              >
                <div className="flex h-full flex-col">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">
                    On-demand billing
                  </p>
                  <p className="mt-5 text-6xl leading-none tracking-tight text-white md:text-[4.8rem]">
                    $0.10
                  </p>
                  <p className="mt-2 text-lg text-white/72">per credit</p>

                  <div className="mt-6 space-y-3">
                    {[
                      "Pro only",
                      "After 15,000 credits",
                      "Billed weekly"
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-white/84">
                        <span className="mt-0.5 text-white/90">+</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-auto pt-7 text-sm leading-relaxed text-white/68">
                    Extra credit when monthly usage runs out.
                  </p>
                </div>
              </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
}
