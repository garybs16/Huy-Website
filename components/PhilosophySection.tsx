"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function PhilosophySection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="philosophy" className="bg-black px-6 py-28 md:py-40" ref={ref}>
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-5xl tracking-tight text-white md:mb-24 md:text-7xl lg:text-8xl"
        >
          Innovation{" "}
          <span
            className="text-white/40"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            x
          </span>{" "}
          Vision
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="aspect-[4/3] w-full overflow-hidden rounded-3xl"
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
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col justify-center gap-8"
          >
            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">
                CHOOSE YOUR SPACE
              </p>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                Every meaningful breakthrough begins at the intersection of
                disciplined strategy and remarkable creative vision. We operate
                at that crossroads, turning bold thinking into tangible outcomes
                that move people and reshape industries.
              </p>
            </div>

            <div className="my-2 h-px w-full bg-white/10" />

            <div>
              <p className="mb-4 text-xs uppercase tracking-widest text-white/40">
                SHAPE THE FUTURE
              </p>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                We believe that the best work emerges when curiosity meets
                conviction. Our process is designed to uncover hidden
                opportunities and translate them into experiences that resonate
                long after the first impression.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
