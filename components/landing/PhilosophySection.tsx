"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { accentSerif, revealEase } from "@/components/landing/shared";

export default function PhilosophySection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="philosophy" ref={ref} className="bg-black px-6 py-16 md:py-18">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: revealEase }}
          className="mb-10 text-5xl tracking-tight text-white md:mb-12 md:text-7xl lg:text-[4.6rem]"
        >
          Innovation{" "}
          <span className="text-white/40" style={accentSerif}>
            x
          </span>{" "}
          Vision
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.8, delay: 0.16, ease: revealEase }}
            className="max-w-md text-[11px] leading-relaxed text-white/46"
          >
            Every meaningful breakthrough begins at the intersection of
            disciplined strategy and remarkable creative vision. The tension of
            that contrast, turning bold thinking into tangible outcomes that
            move people and redefine industries.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.8, delay: 0.26, ease: revealEase }}
            className="max-w-md text-[11px] leading-relaxed text-white/46 md:justify-self-end"
          >
            We believe that the best work emerges when curiosity meets
            intention. Our process is designed to uncover what matters most,
            translating subtle discoveries into experiences that resonate long
            after the first impression.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
