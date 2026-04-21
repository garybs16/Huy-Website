"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { revealEase } from "@/components/landing/shared";

const serviceRows = [
  {
    tag: "STRATEGY",
    title: "Research & Insight",
    description:
      "We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
  },
  {
    tag: "CRAFT",
    title: "Design & Execution",
    description:
      "From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
  }
];

const ctaVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";

export default function ServicesSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" ref={ref} className="bg-black px-6 pb-16 pt-12 md:pb-20 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: revealEase }}
          className="mb-10 flex items-baseline justify-between border-b border-white/10 pb-5"
        >
          <h2 className="text-3xl tracking-tight text-white md:text-[2.35rem]">
            What we do
          </h2>
          <p className="hidden text-[10px] uppercase tracking-[0.26em] text-white/32 md:block">
            Our services
          </p>
        </motion.div>

        <div>
          {serviceRows.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: revealEase
              }}
              className="grid gap-5 border-b border-white/10 py-6 md:grid-cols-[0.18fr_0.34fr_1fr_176px] md:items-center md:gap-6"
            >
              <p className="text-[10px] uppercase tracking-[0.26em] text-white/34">
                {card.tag}
              </p>

              <div className="flex items-center gap-3">
                <h3 className="text-xl leading-none tracking-tight text-white md:text-[1.5rem]">
                  {card.title}
                </h3>
                <span className="liquid-glass hidden rounded-full p-2 text-white/60 transition md:inline-flex">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <p className="max-w-md text-[11px] leading-relaxed text-white/42">
                {card.description}
              </p>

              <div className="relative overflow-hidden rounded-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  src={card.video}
                  className="aspect-[16/10] h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
            </motion.article>
          ))}
        </div>

        <div className="grid gap-8 pb-16 pt-14 md:grid-cols-[0.6fr_1fr] md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.32, ease: revealEase }}
            className="max-w-sm"
          >
            <p className="mb-3 text-xl tracking-tight text-white md:text-[1.65rem]">
              Curiosity as a compass
            </p>
            <p className="text-[11px] leading-relaxed text-white/44">
              Our work is grounded in discovery, always pushing toward the most
              resonant version of an idea with patience, precision, and visual
              discipline.
            </p>
            <a
              href="#contact"
              className="liquid-glass mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-medium text-white"
            >
              Explore more
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.85, delay: 0.42, ease: revealEase }}
            className="relative overflow-hidden rounded-[28px]"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src={ctaVideo}
              className="aspect-[16/8.8] h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </motion.div>
        </div>

        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.5, ease: revealEase }}
          className="border-t border-white/10 pt-10"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-4xl tracking-tight text-white md:text-[3rem]">
                Ready to begin?
              </p>
              <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-white/44">
                Let's shape a quieter, sharper digital presence with careful
                strategy, visual depth, and restrained execution.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-white/34">
                GET IN TOUCH
              </p>
              <a
                href="mailto:hello@asme.co"
                className="liquid-glass inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Email Asme"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-4 text-[10px] text-white/28 md:flex-row md:items-center md:justify-between">
            <p>Asme</p>
            <div className="flex items-center gap-5">
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="mailto:hello@asme.co">Contact</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
