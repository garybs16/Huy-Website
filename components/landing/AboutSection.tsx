"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { accentSerif, revealEase } from "@/components/landing/shared";

export default function AboutSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="bg-black px-6 pb-8 pt-12 md:pb-10 md:pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[1.25fr_0.55fr] md:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: revealEase }}
              className="text-[10px] uppercase tracking-[0.28em] text-white/35"
            >
              ABOUT US
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.1, ease: revealEase }}
              className="mt-5 max-w-4xl"
            >
              <h2 className="text-4xl leading-[0.98] tracking-tight text-white md:text-6xl lg:text-[4.1rem]">
                Pioneering{" "}
                <span className="not-italic text-white/60" style={accentSerif}>
                  ideas
                </span>{" "}
                for
                <br />
                minds that{" "}
                <span className="not-italic text-white/60" style={accentSerif}>
                  create,
                </span>{" "}
                <span className="not-italic text-white/60" style={accentSerif}>
                  build,
                </span>
                <br />
                and{" "}
                <span className="not-italic text-white/60" style={accentSerif}>
                  inspire.
                </span>
              </h2>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.18, ease: revealEase }}
            className="max-w-xs text-[11px] leading-relaxed text-white/45 md:justify-self-end"
          >
            We build calm, cinematic digital systems around curiosity,
            intention, and visual restraint, shaping experiences that feel both
            thoughtful and quietly immersive.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
