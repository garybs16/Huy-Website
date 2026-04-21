"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AboutSection from "@/components/landing/AboutSection";
import FeaturedVideoSection from "@/components/landing/FeaturedVideoSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import ServicesSection from "@/components/landing/ServicesSection";

const heroVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4";

const navLinks = [
  { label: "Features", href: "#featured-video" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" }
];

function useHeroVideoLoop(videoRef: React.RefObject<HTMLVideoElement>) {
  const [opacity, setOpacity] = useState(0);
  const opacityRef = useRef(0);
  const animationRef = useRef<number>();
  const fadingOutRef = useRef(false);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const animateOpacity = (target: number, duration: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const start = performance.now();
      const initial = opacityRef.current;

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const next = initial + (target - initial) * progress;

        opacityRef.current = next;
        setOpacity(next);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        }
      };

      animationRef.current = requestAnimationFrame(tick);
    };

    const playVideo = () => {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    };

    const handleCanPlay = () => {
      animateOpacity(1, 500);
    };

    const handleTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;

      if (Number.isFinite(remaining) && remaining <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        animateOpacity(0, 500);
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      opacityRef.current = 0;
      setOpacity(0);
      fadingOutRef.current = false;
      playVideo();
    };

    playVideo();
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoRef]);

  return opacity;
}

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoOpacity = useHeroVideoLoop(videoRef);

  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden bg-black px-6 pb-16 pt-6">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        preload="auto"
        src={heroVideo}
        style={{ opacity: videoOpacity }}
        className="absolute inset-0 h-full w-full translate-y-[calc(17%+100px)] object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_42%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-black/52 to-black" />

      <div className="relative z-20 mx-auto w-full max-w-5xl">
        <div className="liquid-glass flex items-center justify-between rounded-full px-5 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Asme</span>
            </div>
            <nav className="hidden items-center gap-5 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-medium text-white/80 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <a href="#contact" className="text-[11px] font-medium text-white">
              Sign Up
            </a>
            <a
              href="#contact"
              className="liquid-glass rounded-full px-5 py-2 text-[11px] font-medium text-white"
            >
              Login
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 -translate-y-[16%] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl"
        >
          <h1
            className="mb-8 whitespace-nowrap text-5xl tracking-tight text-white md:text-6xl lg:text-[4.25rem]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Built for the curious
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="liquid-glass flex items-center rounded-full py-2 pl-6 pr-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-9 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/40"
            />
            <button
              type="button"
              aria-label="Submit email"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 px-4 text-[10px] leading-relaxed text-white/72">
            Stay updated with the latest news and insights. Subscribe to our
            newsletter today and never miss out on exciting updates.
          </p>

          <div className="mt-5">
            <a
              href="#philosophy"
              className="inline-flex text-[10px] font-medium text-white/70 transition hover:text-white"
            >
              Manifesto
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <HeroSection />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
    </main>
  );
}
