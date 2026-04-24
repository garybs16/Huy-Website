"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import LazyVideo from "@/components/LazyVideo";

export default function FeaturedVideoSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="demo" className="deck-section deck-divider bg-black px-6 pb-20 pt-4 md:pb-24 md:pt-6">
      <div className="mx-auto max-w-5xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          className="deck-frame deck-media group relative aspect-video w-full overflow-hidden rounded-3xl"
        >
          <LazyVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/76 via-black/16 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,_rgba(230,215,192,0.18),_transparent_24%)]" />

          <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-sm md:left-8 md:top-8">
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">
              02 / PRODUCT DEMO
            </p>
          </div>

          <div className="absolute bottom-0 inset-x-0 flex flex-col justify-between gap-5 p-6 md:flex-row md:items-end md:p-8">
            <div className="deck-panel deck-frame max-w-md rounded-2xl bg-black/64 p-5 md:p-6">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/60">
                LIVE FLOW
              </p>
              <p className="text-sm leading-relaxed text-white/94 md:text-[15px]">
                Prompt in. Scene out. Still editable.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start md:self-auto">
              {[
                { title: "Realtime feel", value: "Prompt to scene" },
                { title: "Production-ready", value: "Editable output" }
              ].map((item) => (
                <div
                  key={item.title}
                  className="deck-panel-soft deck-frame min-w-[9.5rem] rounded-[1.2rem] px-4 py-3 text-left"
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/48">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/94">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
