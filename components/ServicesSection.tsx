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
      id="pricing"
      className="bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] px-6 py-28 md:py-40"
      ref={ref}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex items-baseline justify-between"
        >
          <h2 className="text-3xl tracking-tight text-white md:text-5xl">
            What we do
          </h2>
          <span className="hidden text-sm uppercase tracking-widest text-white/40 md:block">
            Our services
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="group liquid-glass relative flex flex-col overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <video
                  src={service.videoUrl}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-1 flex-col justify-end p-6 md:p-8">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/40">
                    {service.tag}
                  </span>
                  <div className="liquid-glass rounded-full p-2 text-white/60 transition-colors duration-300 group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mb-3 text-xl tracking-tight text-white md:text-2xl">
                  {service.title}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-white/50">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
