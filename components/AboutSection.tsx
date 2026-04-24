"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import LazyVideo from "@/components/LazyVideo";

const features = [
  {
    title: "Text to scene",
    detail: "Prompt to environment."
  },
  {
    title: "True 3D output",
    detail: "Editable after generation."
  },
  {
    title: "Team-ready workflow",
    detail: "Built for real pipelines."
  }
];

export default function AboutSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={ref}
      className="deck-section deck-divider relative bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] px-6 pb-18 pt-20 md:pb-22 md:pt-24"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-10 grid gap-4 md:grid-cols-[1fr_0.34fr] md:items-end"
        >
          <div>
            <p className="deck-kicker mb-6 text-xs">
              03 / FEATURES
            </p>

            <h2 className="max-w-3xl text-4xl leading-[1.02] tracking-tight text-white md:text-6xl lg:text-[4.25rem]">
              Core capabilities built for
              <br />
              <span
                className="text-white/72"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                cinematic speed
              </span>{" "}
              and control.
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-white/58 md:justify-self-end md:text-right">
            Fast enough to explore. Structured enough to ship.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="deck-frame deck-media relative overflow-hidden rounded-[2rem]"
          >
            <LazyVideo
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="aspect-[16/13] h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/28 to-black/8" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,_rgba(151,176,209,0.16),_transparent_24%)]" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
              <div className="deck-panel deck-frame max-w-md rounded-[1.8rem] bg-black/64 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/52">
                  Feature Stack
                </p>
                <p className="mt-3 text-2xl leading-[1.02] tracking-tight text-white md:text-[2.2rem]">
                  Scene generation in minutes.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                transition={{ duration: 0.7, delay: 0.18 }}
                className="deck-panel deck-frame deck-tint-warm rounded-[1.7rem] p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/48">
                  Speed
                </p>
                <p className="mt-4 text-4xl tracking-tight text-white">Minutes</p>
                <p className="mt-2 text-sm leading-relaxed text-white/68">Not 3 to 6 weeks.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                transition={{ duration: 0.7, delay: 0.24 }}
                className="deck-panel deck-frame deck-tint-cool rounded-[1.7rem] p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/48">
                  Output
                </p>
                <p className="mt-4 text-4xl tracking-tight text-white">True 3D</p>
                <p className="mt-2 text-sm leading-relaxed text-white/68">Not flattened output.</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="deck-frame deck-media relative overflow-hidden rounded-[1.9rem]"
            >
              <LazyVideo
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="aspect-[16/8.6] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-black/22 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="max-w-sm text-lg leading-tight tracking-tight text-white/96 md:text-xl">
                  Built for creators, studios, and teams.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.34 + index * 0.06 }}
                  className="deck-panel-matte deck-frame rounded-[1.55rem] p-5"
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/44">
                    0{index + 1}
                  </p>
                  <p className="mt-3 text-xl leading-tight tracking-tight text-white">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/66">
                    {feature.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
