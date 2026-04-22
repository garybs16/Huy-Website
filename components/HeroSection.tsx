"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Globe, Instagram, Twitter } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Market", href: "#market" },
  { label: "Traction", href: "#traction" },
  { label: "Ask", href: "#ask" }
];

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let animationFrameId = 0;

    const checkTime = () => {
      if (video.duration) {
        const timeLeft = video.duration - video.currentTime;

        if (timeLeft <= 0.55) {
          setVideoOpacity(0);
        } else if (video.currentTime > 0.5) {
          setVideoOpacity(1);
        }
      }

      animationFrameId = requestAnimationFrame(checkTime);
    };

    const handleCanPlay = () => {
      setVideoOpacity(1);
      animationFrameId = requestAnimationFrame(checkTime);
    };

    const handleEnded = () => {
      video.currentTime = 0;

      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }

      setVideoOpacity(1);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4"
        muted
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-[center_32%] contrast-110 saturate-110 transition-opacity duration-500 ease-in-out"
        style={{ opacity: videoOpacity }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06),_transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,_rgba(230,215,192,0.18),_transparent_26%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_26%,_rgba(151,176,209,0.16),_transparent_24%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/16 via-black/26 to-black/58" />

      <div className="z-20 mx-auto w-full max-w-5xl px-6 py-6">
        <nav className="liquid-glass deck-frame flex items-center justify-between rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-white" />
            <span className="text-lg font-semibold text-white">Asme</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden text-sm font-medium text-white transition-colors hover:text-white/80 sm:block">
              Sign Up
            </button>
            <button className="rounded-full border border-white/10 bg-white/10 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15">
              Login
            </button>
          </div>
        </nav>
      </div>

      <div className="z-10 flex flex-1 items-center px-6 pb-20 pt-8">
        <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.44fr] lg:items-end">
          <div className="-translate-y-[7%]">
            <h1
              className="mb-6 max-w-4xl text-5xl leading-[0.94] tracking-tight text-white md:text-6xl lg:text-[5.1rem]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Built for the curious
            </h1>

            <div className="mt-8 flex w-full max-w-md flex-col gap-4">
              <div className="liquid-glass deck-frame flex w-full flex-row items-center rounded-full py-2 pl-6 pr-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
                <button className="flex items-center justify-center rounded-full bg-white p-2 transition-colors hover:bg-white/90">
                  <ArrowRight className="h-5 w-5 text-black" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:grid lg:gap-4">
            <div className="liquid-glass deck-frame deck-tint-warm rounded-[1.9rem] p-5">
              <p className="deck-kicker text-[10px]">Deck Format</p>
              <p className="mt-4 text-3xl tracking-tight text-white">8 sections</p>
              <p className="mt-2 text-sm text-white/48">
                Narrative, proof, market, traction, and ask.
              </p>
            </div>

            <div className="liquid-glass deck-frame deck-tint-cool rounded-[1.9rem] p-5">
              <p className="deck-kicker text-[10px]">Positioning</p>
              <p className="mt-4 text-lg leading-tight text-white">
                Premium output
                <br />
                with startup speed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center gap-4">
        {[Instagram, Twitter, Globe].map((Icon, idx) => (
          <a
            key={idx}
            href="#"
            className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </section>
  );
}
