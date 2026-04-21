"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { accentSerif, revealEase } from "@/components/landing/shared";

export default function AboutSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] bg-black px-6 pb-10 pt-32 md:pb-14 md:pt-44"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: revealEase }}
          className="text-sm uppercase tracking-widest text-white/40"
        >
          ABOUT US
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1, ease: revealEase }}
          className="mb-16 mt-8 max-w-6xl"
        >
          <h2 className="text-4xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
            Pioneering <span className="not-italic text-white/60" style={accentSerif}>ideas</span> for
            <br className="hidden md:block" /> minds that <span className="not-italic text-white/60" style={accentSerif}>create,</span>{" "}
            <span className="not-italic text-white/60" style={accentSerif}>build,</span> and{" "}
            <span className="not-italic text-white/60" style={accentSerif}>inspire.</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
