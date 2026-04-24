"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Globe } from "lucide-react";

const navLinks = [
  { label: "Demo", href: "#demo" },
  { label: "Features", href: "#features" },
  { label: "Vision", href: "#vision" },
  { label: "Pricing", href: "#services" },
  { label: "Team", href: "#team" }
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
    <section className="deck-section relative flex min-h-screen flex-col overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_36%,_rgba(255,255,255,0.16),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01)_42%,rgba(0,0,0,1))]" />
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/14 via-black/22 to-black/62" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />

      <div className="z-20 mx-auto w-full max-w-5xl px-6 py-6">
        <nav className="liquid-glass deck-frame flex items-center justify-between rounded-full px-5 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-white" />
            <span className="text-base font-semibold text-white">Unstable ML</span>
          </div>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] font-medium text-white/74 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#services"
              className="hidden text-[13px] font-medium text-white/76 transition-colors hover:text-white sm:block"
            >
              Pricing
            </a>
            <a
              href="#team"
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/15"
            >
              Team
            </a>
          </div>
        </nav>
      </div>

      <div id="intro" className="z-10 flex flex-1 items-center px-6 pb-18 pt-8">
        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.08fr_0.42fr] lg:items-end">
          <div className="-translate-y-[7%]">
            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/48">
              01 / INTRO
            </p>
            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/62">
              Cinematic text-to-3D infrastructure
            </p>
            <h1
              className="mb-5 max-w-4xl text-5xl leading-[0.92] tracking-tight text-white md:text-6xl lg:text-[5.15rem]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Generate cinematic
              <br />
              3D scenes from text.
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-white/58 md:text-[15px]">
              True 3D output in minutes.
            </p>

            <div className="mt-7 flex w-full max-w-md flex-col gap-4">
              <div className="liquid-glass deck-frame flex w-full flex-row items-center rounded-full py-2 pl-5 pr-2">
                <input
                  type="email"
                  placeholder="founders@unstableml.ai"
                  className="flex-1 border-none bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
                />
                <a
                  href="mailto:founders@unstableml.ai"
                  className="flex items-center justify-center rounded-full bg-white p-2 transition-colors hover:bg-white/90"
                >
                  <ArrowRight className="h-5 w-5 text-black" />
                </a>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-white/46">
                <a href="#demo" className="transition-colors hover:text-white/78">
                  Watch product demo
                </a>
                <span className="h-1 w-1 rounded-full bg-white/22" />
                <a href="#services" className="transition-colors hover:text-white/78">
                  View pricing
                </a>
              </div>
            </div>
          </div>

          <div className="hidden lg:grid lg:gap-3">
            <div className="deck-panel deck-frame deck-tint-warm rounded-[1.7rem] p-4">
              <p className="deck-kicker text-[10px]">Intro</p>
              <p className="mt-3 text-[1.7rem] tracking-tight text-white">25k+</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/54">waitlist</p>
            </div>

            <div className="deck-panel-soft deck-frame deck-tint-cool rounded-[1.7rem] p-4">
              <p className="deck-kicker text-[10px]">Signal</p>
              <p className="mt-3 text-[15px] leading-tight text-white/88">
                Editable scenes,
                <br />
                real pipeline fit.
              </p>
            </div>

            <div className="deck-panel deck-frame rounded-[1.7rem] p-4">
              <p className="deck-kicker text-[10px]">Latency</p>
              <p className="mt-3 text-[1.45rem] tracking-tight text-white">2.4 min</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/52">scene time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
