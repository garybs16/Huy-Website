"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let animationFrameId = 0;
    let isCheckingTime = false;

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

    const handleFirstFrame = () => {
      setVideoOpacity(1);

      if (!isCheckingTime) {
        isCheckingTime = true;
        animationFrameId = requestAnimationFrame(checkTime);
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;

      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }

      setVideoOpacity(1);
    };

    if (video.readyState >= 2) {
      handleFirstFrame();
    }

    video.addEventListener("loadeddata", handleFirstFrame);
    video.addEventListener("canplay", handleFirstFrame);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadeddata", handleFirstFrame);
      video.removeEventListener("canplay", handleFirstFrame);
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

      <div id="intro" className="z-10 flex flex-1 items-center px-6 pb-18 pt-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-center">
          <div className="-translate-y-[7%]">
            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/48">
              01 / INTRO
            </p>
            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/62">
              Cinematic text-to-3D infrastructure
            </p>
            <h1
              className="mb-5 max-w-4xl text-5xl leading-[0.92] tracking-tight text-white md:text-6xl lg:text-[5.15rem]"
            >
              UnstableML
              <br />
              Pitch Deck
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-white/58 md:text-[15px]">
              True 3D output in minutes.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
