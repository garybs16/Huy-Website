"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Globe, Instagram, Twitter } from "lucide-react";

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
        className="absolute inset-0 h-full w-full object-cover translate-y-[calc(17%+100px)] transition-opacity duration-500 ease-in-out"
        style={{ opacity: videoOpacity }}
      />

      <div className="z-20 mx-auto w-full max-w-5xl px-6 py-6">
        <nav className="liquid-glass flex items-center justify-between rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-white" />
            <span className="text-lg font-semibold text-white">Asme</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {["Features", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden text-sm font-medium text-white transition-colors hover:text-white/80 sm:block">
              Sign Up
            </button>
            <button className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5">
              Login
            </button>
          </div>
        </nav>
      </div>

      <div className="z-10 flex flex-1 -translate-y-[20%] flex-col items-center justify-center px-6 text-center">
        <h1
          className="mb-8 whitespace-nowrap text-5xl tracking-tight text-white md:text-6xl lg:text-7xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="liquid-glass flex w-full flex-row items-center rounded-full py-2 pl-6 pr-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
            <button className="flex items-center justify-center rounded-full bg-white p-2 transition-colors hover:bg-white/90">
              <ArrowRight className="h-5 w-5 text-black" />
            </button>
          </div>

          <p className="px-4 text-sm leading-relaxed text-white opacity-80">
            Stay updated with the latest news and insights. Subscribe to our
            newsletter today and never miss out on exciting updates.
          </p>

          <button className="liquid-glass mt-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5">
            Manifesto
          </button>
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
