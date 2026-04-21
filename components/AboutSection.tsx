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
      className="relative bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] px-6 pb-10 pt-32 md:pb-14 md:pt-44"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-sm uppercase tracking-widest text-white/40"
        >
          ABOUT US
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Pioneering <AccentWord>ideas</AccentWord> for{" "}
          <br className="hidden md:block" />
          minds that <AccentWord>create,</AccentWord> <AccentWord>build,</AccentWord>{" "}
          and <AccentWord>inspire.</AccentWord>
        </motion.h2>
      </div>
    </section>
  );
}
