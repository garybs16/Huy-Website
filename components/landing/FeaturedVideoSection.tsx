"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { revealEase } from "@/components/landing/shared";

const featuredVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

export default function FeaturedVideoSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="featured-video" ref={ref} className="bg-black px-6 pb-16 pt-4 md:pb-18 md:pt-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, ease: revealEase }}
          className="relative aspect-[16/7.5] overflow-hidden rounded-[28px]"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={featuredVideo}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
