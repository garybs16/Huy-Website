"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    tag: "STRATEGY",
    title: "Research & Insight",
    desc: "We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.",
    videoUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
  },
  {
    tag: "CRAFT",
    title: "Design & Execution",
    desc: "From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.",
    videoUrl:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
  }
];

export default function ServicesSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="services"
      className="bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] px-6 py-24 md:py-32"
      ref={ref}
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex items-baseline justify-between"
        >
          <div>
            <p className="deck-kicker mb-5 text-xs">
              05 / SERVICES
            </p>
            <h2 className="text-3xl tracking-tight text-white md:text-5xl">
              What we do
            </h2>
          </div>
          <span className="hidden text-sm uppercase tracking-widest text-white/40 md:block">
            Compact, premium, fast
          </span>
        </motion.div>

        <div className="space-y-5">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 34 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="grid gap-4 border-b border-white/8 pb-5 md:grid-cols-[0.16fr_0.34fr_1fr_180px] md:items-center"
            >
              <span className="text-[11px] uppercase tracking-[0.28em] text-white/32">
                {service.tag}
              </span>

              <div className="flex items-center gap-3">
                <h3 className="text-xl tracking-tight text-white md:text-[1.6rem]">
                  {service.title}
                </h3>
                <div className="rounded-full border border-white/8 p-2 text-white/50">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-white/38">
                {service.desc}
              </p>

              <div className="deck-frame relative aspect-[16/10] overflow-hidden rounded-2xl">
                <video
                  src={service.videoUrl}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
            transition={{ duration: 0.85, delay: 0.35 }}
            className="grid gap-5 pt-8 md:grid-cols-[0.42fr_1fr]"
          >
            <div className="flex flex-col justify-end">
              <p className="mb-2 text-2xl tracking-tight text-white md:text-[1.8rem]">
                Curiosity as a compass
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-white/38">
                Discovery stays close to execution, so ideas keep their energy
                from first concept through final launch.
              </p>
            </div>

            <div className="deck-frame relative overflow-hidden rounded-[1.9rem]">
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="aspect-[16/9] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
