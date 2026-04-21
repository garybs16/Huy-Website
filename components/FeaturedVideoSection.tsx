"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FeaturedVideoSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="bg-black px-6 pb-20 pt-6 md:pb-32 md:pt-10">
      <div className="mx-auto max-w-6xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          className="group relative aspect-video w-full overflow-hidden rounded-3xl"
        >
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 inset-x-0 flex flex-col justify-between gap-6 p-6 md:flex-row md:items-end md:p-10">
            <div className="liquid-glass max-w-md rounded-2xl p-6 md:p-8">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/50">
                OUR APPROACH
              </p>
              <p className="text-sm leading-relaxed text-white md:text-base">
                We believe in the power of curiosity-driven exploration. Every
                project starts with a question, and every answer opens a new
                door to innovation.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass self-start rounded-full px-8 py-3 text-sm font-medium text-white md:self-auto"
            >
              Explore more
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
