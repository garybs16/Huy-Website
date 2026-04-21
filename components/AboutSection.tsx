"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

function AccentWord({ children }: { children: ReactNode }) {
  return (
    <span
      className="not-italic text-white/60"
      style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
    >
      {children}
    </span>
  );
}

export default function AboutSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="relative bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] px-6 pb-12 pt-24 md:pb-16 md:pt-32"
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_0.42fr] md:items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <p className="deck-kicker mb-6 text-xs">
            02 / ABOUT
          </p>

          <h2 className="text-4xl leading-[1.02] tracking-tight text-white md:text-6xl lg:text-[4.4rem]">
            Pioneering <AccentWord>ideas</AccentWord> for
            <br />
            minds that <AccentWord>create, build,</AccentWord>
            <br />
            and <AccentWord>inspire.</AccentWord>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-xs md:justify-self-end"
        >
          <p className="text-sm leading-relaxed text-white/42">
            We combine deck narrative, visual language, and launch-ready
            execution into one compact creative system built for fast-moving
            teams.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
