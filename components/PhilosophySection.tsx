"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import LazyVideo from "@/components/LazyVideo";

export default function PhilosophySection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="vision" className="deck-section deck-divider bg-black px-6 py-24 md:py-28" ref={ref}>
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-10 grid gap-4 md:mb-12 md:grid-cols-[1fr_0.32fr] md:items-end"
        >
          <div className="max-w-5xl text-3xl leading-tight tracking-tight text-white md:text-5xl">
            <span className="deck-kicker mb-5 block text-xs">
              04 / VISION
            </span>
            The midpoint where{" "}
            <span
              className="text-white/54"
              style={{ fontStyle: "italic" }}
            >
              AI
            </span>{" "}
            and 3D tools work together.
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-white/58 md:justify-self-end md:text-right">
            A product space where creators can use AI capabilities and professional tools in the same workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="deck-frame deck-media relative aspect-[16/11] w-full overflow-hidden rounded-[1.9rem]"
          >
            <LazyVideo
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-black/16 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <div className="deck-panel deck-frame deck-tint-cool max-w-md rounded-[1.7rem] bg-black/64 p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/48">
                  Product vision
                </p>
                <p className="mt-2 text-xl leading-tight tracking-tight text-white/96 md:text-[1.7rem]">
                  Give artists the power of AI and the control of the tools they already trust.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, delay: 0.28 }}
            className="grid gap-4"
          >
            <div className="deck-panel-matte deck-frame deck-tint-warm rounded-[1.75rem] p-6">
              <p className="mb-4 text-xs uppercase tracking-widest text-white/52">
                THE GAP
              </p>
              <p className="text-sm leading-relaxed text-white/66 md:text-base">
                AI is powerful, and tools like Blender and Adobe are precise. Creators need a place where both strengths are available at once.
              </p>
            </div>

            <div className="deck-panel-matte deck-frame deck-tint-cool rounded-[1.75rem] p-6">
              <p className="mb-4 text-xs uppercase tracking-widest text-white/52">
                OUR ROLE
              </p>
              <p className="text-sm leading-relaxed text-white/66 md:text-base">
                Build the midpoint product where generative speed and production control can live in the same creative process.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="deck-panel-soft deck-frame rounded-[1.55rem] p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/46">
                  Today
                </p>
                <p className="mt-3 text-lg leading-tight tracking-tight text-white/94">
                  AI-assisted 3D creation.
                </p>
              </div>
              <div className="deck-panel-soft deck-frame rounded-[1.55rem] p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/46">
                  Next
                </p>
                <p className="mt-3 text-lg leading-tight tracking-tight text-white/94">
                  One creative midpoint.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
