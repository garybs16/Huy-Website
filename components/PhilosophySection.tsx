"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function PhilosophySection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="philosophy" className="bg-black px-6 py-24 md:py-32" ref={ref}>
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-5xl tracking-tight text-white md:mb-12 md:text-7xl lg:text-[4.8rem]"
        >
          <span className="deck-kicker mb-5 block text-xs">
            04 / PHILOSOPHY
          </span>
          Innovation{" "}
          <span
            className="text-white/40"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            x
          </span>{" "}
          Vision
        </motion.h2>

        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="deck-frame aspect-[16/9] w-full overflow-hidden rounded-[1.9rem]"
          >
            <video
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, delay: 0.28 }}
            className="grid gap-8 md:grid-cols-2 md:gap-10"
          >
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">
                CHOOSE YOUR SPACE
              </p>
              <p className="text-sm leading-relaxed text-white/50 md:text-base">
                Every meaningful breakthrough begins at the intersection of
                disciplined strategy and remarkable creative vision.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">
                SHAPE THE FUTURE
              </p>
              <p className="text-sm leading-relaxed text-white/50 md:text-base">
                The best work emerges when curiosity meets conviction and stays
                close enough to execution to matter.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
