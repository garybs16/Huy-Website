"use client";

import { WordsPullUpMultiStyle } from "@/components/words-pull-up";
import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { useEffect, useRef } from "react";

const primaryText = "#E1E0CC";
const heroVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const productVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";
const problemVideo = "https://www.pexels.com/download/video/8475056/";
const marketVideo =
  "https://media.istockphoto.com/id/2215175664/video/astronaut-on-moon-in-front-of-planet-earth-wormhole-bending-laws-of-the-universe-augmented.mp4?s=mp4-640x640-is&k=20&c=PT3MofP0Ov4IGwzXNfIvPfRUWNSEssvEO4txyeIumqk=";
const askVideo =
  "https://www.pexels.com/download/video/31129791/";
const sectionMotionVideos = {
  problem: problemVideo,
  solution: productVideo,
  product: productVideo,
  market: marketVideo,
  competition: productVideo,
  traction: heroVideo,
  ask: askVideo
};
const deckImages = {
  problem: "/prisma-media/problem-orbit.svg",
  solution: "/prisma-media/solution-grid.svg",
  market: "/prisma-media/market-globe.svg",
  ask: "/prisma-media/ask-ascent.svg",
  product: "/prisma-media/product-ribbon.svg",
  competition: "/prisma-media/competition-matrix.svg",
  traction: "/prisma-media/traction-signal.svg"
};

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Product", href: "#product" },
  { label: "Market", href: "#market" },
  { label: "Traction", href: "#traction" },
  { label: "Ask", href: "#team-ask" }
];

const productSteps = [
  {
    number: "01",
    title: "Prompt Interface",
    text: "Text, sketch, or motion reference."
  },
  {
    number: "02",
    title: "AI Neural Core",
    text: "Scene graph, lighting, and motion."
  },
  {
    number: "03",
    title: "Cinematic 3D",
    text: "Editable output, ready for production."
  }
];

const whyNow = [
  { title: "Foundation models", text: "production-ready" },
  { title: "GPU costs", text: "falling fast" },
  { title: "Creator demand", text: "already here" }
];

const featureCards = [
  {
    number: "01",
    title: "Project Storyboard.",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
    points: ["Build scene intent before production starts."]
  },
  {
    number: "02",
    title: "Smart Critiques.",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
    points: ["Surface the next creative fix in seconds."]
  },
  {
    number: "03",
    title: "Immersion Capsule.",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
    points: ["Protect focus during active creation windows."]
  }
];

const comparisonRows = [
  {
    category: "Traditional",
    product: "Maya, Blender",
    speed: "Slow",
    fidelity: "High fidelity",
    editability: "Full control",
    state: ["bad", "good", "good"]
  },
  {
    category: "Gen-Video",
    product: "Sora, Runway",
    speed: "Fast (secs)",
    fidelity: "Flat pixels",
    editability: "No control",
    state: ["good", "bad", "bad"]
  },
  {
    category: "UnstableML",
    product: "Text-to-3D",
    speed: "Fast (mins)",
    fidelity: "True 3D",
    editability: "Editable",
    state: ["good", "good", "good"]
  }
];
const comparisonLabels = ["Speed", "3D Fidelity", "Editability"];

const pricingTiers = [
  {
    title: "Free",
    price: "$0",
    suffix: "/mo",
    text: "Fast trial entry.",
    credits: "800 credits / month",
    detail: "Built for habit formation.",
    margin: "User growth"
  },
  {
    title: "Pro",
    price: "$20",
    suffix: "/mo",
    text: "Low-friction paid plan.",
    credits: "15,000 credits / month",
    detail: "Credits are designed to drive refill usage.",
    margin: "25% margin"
  }
];

const tractionHighlights = [
  ["800", "Free credits / month"],
  ["15k", "Pro credits / month"],
  ["$20", "Pro monthly price"],
  ["$192", "Yearly plan upfront"]
];

const onDemandBillingPoints = [
  "2 cents / 10 credits",
  "100% refill margin",
  "Weekly refill billing"
];

const heroStats = [
  ["25k+", "waitlist"],
  ["42%", "MoM growth"],
  ["88%", "retention"]
];
const askBars = [
  { label: "R&D", value: 50 },
  { label: "Compute", value: 25 },
  { label: "GTM", value: 15 },
  { label: "Ops", value: 10 }
];

function SectionTag({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.32em] text-primary sm:text-xs">{children}</p>;
}

function SectionHeader({
  index,
  label,
  note,
  children,
  center = false
}: {
  index: string;
  label: string;
  note?: string;
  children: React.ReactNode;
  center?: boolean;
}) {
  if (center) {
    return (
      <div className="mb-8 border-b border-white/5 pb-8 sm:mb-10 sm:pb-10">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <SectionTag>{label}</SectionTag>
          <p className="mt-3 text-4xl font-light tracking-[-0.06em] text-white/18 sm:text-5xl">{index}</p>
          <div className="mx-auto mt-5 max-w-4xl">{children}</div>
          {note ? (
            <p className="mx-auto mt-6 max-w-[32rem] rounded-[1.3rem] border border-white/8 bg-black/40 px-5 py-3 text-center text-xs leading-relaxed text-gray-400 backdrop-blur-md sm:text-[13px] lg:max-w-[36rem]">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 grid gap-4 border-b border-white/5 pb-8 sm:mb-10 sm:gap-5 sm:pb-10 lg:grid-cols-[118px_minmax(0,1fr)] lg:gap-8">
      <div>
        <SectionTag>{label}</SectionTag>
        <p className="mt-3 text-4xl font-light tracking-[-0.06em] text-white/18 sm:text-5xl">{index}</p>
      </div>
      <div className="min-w-0">
        {children}
        {note ? (
          <p className="mt-6 max-w-[28rem] rounded-[1.3rem] border border-white/8 bg-black/40 px-4 py-3 text-xs leading-relaxed text-gray-400 backdrop-blur-md sm:text-[13px] lg:ml-auto xl:max-w-[31rem]">
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[96px] rounded-full border border-white/10 bg-black/45 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-base font-semibold tracking-[-0.03em]" style={{ color: primaryText }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
    </div>
  );
}

function OrbitalVisual() {
  return (
    <div className="relative h-[210px] overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/35 backdrop-blur-sm">
      <div className="cream-glow absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 opacity-70" />
      <div className="absolute inset-0 deck-grid opacity-[0.14]" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
      <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10" />
      <div className="absolute left-[22%] top-[56%] h-4 w-4 rounded-full bg-primary shadow-[0_0_24px_rgba(222,219,200,0.9)]" />
      <div className="absolute right-[24%] top-[26%] h-3 w-3 rounded-full bg-primary/80 shadow-[0_0_18px_rgba(222,219,200,0.8)]" />
      <div className="absolute left-[50%] top-[18%] h-2.5 w-2.5 rounded-full bg-primary/70" />
      <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Scene latency</p>
        <p className="mt-1 text-xl" style={{ color: primaryText }}>
          2.4 min
        </p>
      </div>
      <div className="absolute right-5 top-5 rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Output state</p>
        <p className="mt-1 text-xl" style={{ color: primaryText }}>
          editable
        </p>
      </div>
    </div>
  );
}

function SectionShell({
  id,
  children,
  className = ""
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
      <section
        id={id}
        className={`relative isolate px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 min-[2200px]:px-10 min-[2200px]:py-28 min-[3200px]:px-14 min-[3200px]:py-32 ${className}`}
      >
        <div className="cream-glow pointer-events-none absolute left-1/2 top-0 h-40 w-[24rem] -translate-x-1/2 opacity-18" />
        <div className="mx-auto w-full max-w-[1180px] 2xl:max-w-[1260px] min-[2200px]:max-w-[1480px] min-[2800px]:max-w-[1740px] min-[3400px]:max-w-[2080px]">
          {children}
        </div>
      </section>
  );
}

function RevealCard({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProductFeatureCard({
  number,
  title,
  image,
  points,
  delay
}: {
  number: string;
  title: string;
  image: string;
  points: string[];
  delay: number;
}) {
  return (
    <RevealCard delay={delay}>
      <div className="flex h-full min-h-[260px] flex-col rounded-[1.6rem] border border-white/8 bg-white/[0.02] p-4 shadow-cinematic sm:p-5">
        <div className="relative overflow-hidden rounded-[1.1rem] border border-white/6 bg-black/30">
          <div className="cream-glow absolute inset-0 opacity-35" />
          <img
            src={image}
            alt={title}
            className="relative h-[7.5rem] w-full object-cover sm:h-36"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">{number}</p>
            <h3 className="mt-1 text-lg sm:text-[1.2rem]" style={{ color: primaryText }}>
              {title}
            </h3>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-gray-300">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </RevealCard>
  );
}

function InsightCard({
  title,
  text,
  delay = 0,
  value,
  className = ""
}: {
  title: string;
  text: string;
  delay?: number;
  value?: string;
  className?: string;
}) {
  return (
    <RevealCard delay={delay}>
      <div
        className={`flex h-full min-h-[180px] flex-col justify-between rounded-[1.45rem] border border-white/8 bg-white/[0.025] p-5 shadow-cinematic backdrop-blur-sm sm:p-6 ${className}`}
      >
        {value ? (
          <p className="text-4xl font-light tracking-[-0.05em] sm:text-[2.8rem]" style={{ color: primaryText }}>
            {value}
          </p>
        ) : null}
        <h3 className={`${value ? "mt-4" : ""} text-[1.2rem] sm:text-[1.4rem]`} style={{ color: primaryText }}>
          {title}
        </h3>
        <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-gray-300">
          {text}
        </p>
      </div>
    </RevealCard>
  );
}

function EditorialImageCard({
  src,
  videoSrc,
  alt,
  eyebrow,
  title,
  delay = 0,
  className = "",
  imageClassName = "",
  contentClassName = "",
  titleClassName = ""
}: {
  src: string;
  videoSrc?: string;
  alt: string;
  eyebrow: string;
  title: string;
  delay?: number;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
}) {
  return (
    <RevealCard delay={delay}>
      <div
        className={`group relative overflow-hidden rounded-[1.7rem] border border-white/6 bg-[#111111] shadow-cinematic ${className}`}
      >
        {videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            preload="auto"
          className={`absolute inset-0 h-full w-full object-cover opacity-82 transition-transform duration-700 group-hover:scale-[1.03] ${imageClassName}`}
            src={videoSrc}
          />
        ) : null}
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
            videoSrc ? "mix-blend-screen opacity-60" : ""
          } ${imageClassName}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/26 to-black/8" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div
            className={`max-w-md rounded-[1.2rem] border border-white/8 bg-black/45 p-4 backdrop-blur-md sm:p-5 ${contentClassName}`}
          >
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary sm:text-xs">{eyebrow}</p>
            <p
              className={`mt-2 max-w-[20ch] text-lg leading-tight sm:text-[1.5rem] ${titleClassName}`}
              style={{ color: primaryText }}
            >
              {title}
            </p>
          </div>
        </div>
      </div>
    </RevealCard>
  );
}

function SectionBackdrop({
  src,
  videoSrc,
  className = "",
  imageClassName = "",
  videoClassName = "",
  opacity = 0.18,
  showImage = true,
  videoOpacity
}: {
  src: string;
  videoSrc?: string;
  className?: string;
  imageClassName?: string;
  videoClassName?: string;
  opacity?: number;
  showImage?: boolean;
  videoOpacity?: number;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {videoSrc ? (
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 h-full w-full object-cover ${videoClassName}`}
          style={{ opacity: videoOpacity ?? Math.min(opacity + 0.04, 0.22) }}
          initial={false}
          animate={{ scale: [1.05, 1.09, 1.05], x: [0, 8, 0], y: [0, -6, 0] }}
          transition={{ duration: 34, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          src={videoSrc}
        />
      ) : null}
      {showImage ? (
        <motion.img
          src={src}
          alt=""
          aria-hidden="true"
          className={`h-full w-full object-cover ${imageClassName}`}
          style={{ opacity }}
          initial={false}
          animate={{ scale: [1.02, 1.06, 1.02], x: [0, -12, 0], y: [0, 10, 0] }}
          transition={{ duration: 24, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
        />
      ) : null}
      <div className="bg-noise absolute inset-0 opacity-[0.12]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/42 to-black/82" />
      <div className="cream-glow absolute -left-16 top-8 h-56 w-56 opacity-35" />
      <div className="cream-glow absolute bottom-0 right-0 h-64 w-64 opacity-25" />
    </div>
  );
}

export default function HomePage() {
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) {
      return;
    }

    const ensurePlayback = () => {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    };

    ensurePlayback();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        ensurePlayback();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <main className="page-ambient relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="deck-grid absolute inset-0 opacity-[0.035]" />
        <div className="bg-noise absolute inset-0 opacity-[0.08]" />
        <div className="page-orbit absolute -left-24 top-[18%] h-[28rem] w-[28rem] opacity-70" />
        <div className="page-orbit absolute right-[-6rem] top-[34%] h-[24rem] w-[24rem] opacity-50" />
        <div className="page-orbit absolute left-1/2 top-[68%] h-[34rem] w-[34rem] -translate-x-1/2 opacity-45" />
        <div className="page-column absolute left-[7%] top-[24rem] bottom-0 w-px opacity-60" />
        <div className="page-column absolute right-[7%] top-[18rem] bottom-0 w-px opacity-50" />
        <div className="absolute inset-x-[8%] top-[calc(100svh+2rem)] h-px bg-white/[0.04]" />
      </div>
      <section className="h-screen p-4 md:p-6 2xl:p-8 min-[2200px]:p-10 min-[3200px]:p-12">
        <div className="relative mx-auto h-full w-full max-w-[2200px] overflow-hidden rounded-2xl bg-black shadow-cinematic md:rounded-[2rem] min-[2200px]:max-w-[2880px] min-[3200px]:max-w-[3600px]">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-[44%_38%] md:object-[46%_36%] lg:object-[48%_34%] min-[2200px]:object-[49%_38%] min-[3200px]:object-[50%_40%]"
            src={heroVideo}
          />
          <div className="cream-glow absolute left-[12%] top-[14%] h-72 w-72 opacity-60" />
          <div className="cream-glow absolute right-[10%] top-[18%] h-80 w-80 opacity-30" />
          <div className="deck-grid absolute inset-0 opacity-[0.08]" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          <div className="vignette-overlay absolute inset-0" />

          <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 md:p-8 lg:p-10 2xl:p-12 min-[2200px]:p-14 min-[3200px]:p-16">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="rounded-full border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">Deck Format</p>
                <p className="mt-1 text-base sm:text-lg" style={{ color: primaryText }}>
                  Seed narrative 01/08
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 lg:items-end">
                <div className="max-w-full overflow-x-auto rounded-full bg-black px-4 py-2 md:px-8">
                  <nav className="flex min-w-max items-center gap-3 sm:gap-6 md:gap-10">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-[10px] transition-colors sm:text-xs md:text-sm"
                        style={{ color: "rgba(225, 224, 204, 0.8)" }}
                      >
                        <span className="hover:text-[#E1E0CC]">{item.label}</span>
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="hidden gap-3 lg:flex">
                  {heroStats.map(([value, label]) => (
                    <StatChip key={label} value={value} label={label} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid flex-1 gap-8 pt-10 md:pt-14 lg:grid-cols-[minmax(0,1.05fr)_420px] lg:items-end 2xl:grid-cols-[minmax(0,1fr)_460px] min-[2200px]:grid-cols-[minmax(0,1.05fr)_560px] min-[3200px]:grid-cols-[minmax(0,1.08fr)_660px] min-[2200px]:gap-12">
              <div className="flex flex-col justify-end pb-4 lg:pb-10 2xl:pb-12 min-[2200px]:pb-20 min-[3200px]:pb-24">
                <p className="text-[10px] uppercase tracking-[0.35em] text-primary sm:text-xs">
                  Unstable ML
                </p>
                <p className="mt-4 max-w-xl font-serif text-[clamp(1.15rem,1.8vw,2.25rem)] italic text-primary/80 min-[2200px]:max-w-[18ch] min-[2200px]:text-[clamp(1.6rem,1.5vw,2.9rem)] min-[3200px]:text-[clamp(2rem,1.45vw,3.35rem)]">
                  Generate cinematic 3D scenes from text in seconds.
                </p>
                <div
                  className="mt-6 font-medium leading-[0.86] tracking-[-0.08em] text-[clamp(3.2rem,8vw,9rem)] min-[2200px]:mt-8 min-[2200px]:text-[clamp(5rem,7vw,12rem)] min-[3200px]:text-[clamp(6rem,6.7vw,14.5rem)]"
                  style={{ color: primaryText }}
                >
                  <span className="block lg:inline">
                    Unstable
                  </span>
                  <span className="block pl-[0.04em] lg:ml-[0.08em] lg:inline lg:pl-0">
                    ML
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4 min-[2200px]:mt-6 min-[2200px]:gap-5">
                  <span className="h-px w-20 bg-primary/40 min-[2200px]:w-28" />
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/70 sm:text-sm min-[2200px]:text-base min-[3200px]:text-lg">
                    Cinematic text-to-3D infrastructure
                  </p>
                </div>
              </div>

              <div className="self-end rounded-[2rem] border border-white/10 bg-black/42 p-5 shadow-cinematic backdrop-blur-md sm:p-6 min-[2200px]:rounded-[2.25rem] min-[2200px]:p-8 min-[3200px]:p-10">
                <p className="max-w-md text-sm leading-[1.45] text-primary/70 md:text-base min-[2200px]:max-w-[36rem] min-[2200px]:text-lg min-[3200px]:text-[1.35rem]">
                  The page keeps the original pitch-deck sequence, but reframes it as a dark,
                  premium investor narrative with clearer structure and more cinematic visual weight.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3 min-[2200px]:mt-6 min-[2200px]:gap-4">
                  {heroStats.map(([value, label]) => (
                    <StatChip key={label} value={value} label={label} />
                  ))}
                </div>
                <div className="mt-5 min-[2200px]:mt-6">
                  <a
                    href="#product"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black transition-all duration-300 hover:gap-3 sm:text-base min-[2200px]:px-7 min-[2200px]:py-3.5 min-[2200px]:text-lg min-[3200px]:text-xl"
                  >
                    View the workflow
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10 min-[2200px]:h-12 min-[2200px]:w-12 min-[3200px]:h-14 min-[3200px]:w-14">
                      <ArrowRight className="h-4 w-4 text-primary min-[2200px]:h-5 min-[2200px]:w-5 min-[3200px]:h-6 min-[3200px]:w-6" />
                    </span>
                  </a>
                </div>
                <p className="mt-5 text-xs text-gray-500 sm:text-sm min-[2200px]:mt-6 min-[2200px]:text-base min-[3200px]:text-lg">
                  [Founder Name], CEO | [Founder Name], CTO
                </p>
                <div className="mt-5 min-[2200px]:mt-7">
                  <OrbitalVisual />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionShell id="problem">
        <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <div>
            <SectionHeader index="02" label="Problem">
              <div className="max-w-[18ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
                <WordsPullUpMultiStyle
                  justify="start"
                  segments={[
                    {
                      text: "Video and 3D production is still slow, expensive, and",
                      className: "font-normal"
                    },
                    {
                      text: "gated by expertise.",
                      className: "font-serif italic"
                    }
                  ]}
                />
              </div>
            </SectionHeader>
            <p className="max-w-[30rem] text-sm leading-relaxed text-primary/78 sm:text-[15px]">
              Great ideas lose force when the workflow becomes the blocker. Creative teams still spend weeks on
              manual build, lighting, motion, and review before they reach the shot.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InsightCard
                delay={0}
                value="3-6 weeks"
                title="Per shot"
                text="Manual build, light, motion, review."
              />
              <InsightCard
                delay={0.12}
                value="$15k+"
                title="Minimum cost"
                text="Too expensive for fast iteration."
              />
            </div>
          </div>

          <EditorialImageCard
            src={deckImages.problem}
            videoSrc={sectionMotionVideos.problem}
            alt="A creator overwhelmed by traditional 3D production tooling."
            eyebrow="Production Friction"
            title="Creative momentum dies when every shot still needs a specialist pipeline."
            className="min-h-[460px] lg:min-h-[560px]"
            imageClassName="object-[72%_50%]"
            contentClassName="max-w-[22rem]"
          />
        </div>
      </SectionShell>

      <SectionShell id="solution">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <EditorialImageCard
            src={deckImages.solution}
            videoSrc={sectionMotionVideos.solution}
            alt="An abstract visual showing disorder transformed into a clean AI-assisted 3D workflow."
            eyebrow="Workflow Shift"
            title="Move from chaos to structured, editable scene generation."
            className="min-h-[480px] lg:min-h-[600px]"
            imageClassName="object-center"
          />

          <div>
            <SectionHeader index="03" label="Solution">
              <div className="max-w-[16ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
                <WordsPullUpMultiStyle
                  justify="start"
                  segments={[
                    { text: "Text-to-3D that turns ideas into", className: "font-normal" },
                    { text: "shot-ready scenes", className: "font-serif italic" },
                    { text: "in minutes.", className: "font-normal" }
                  ]}
                />
              </div>
            </SectionHeader>
            <p className="max-w-[28rem] text-sm leading-relaxed text-primary/78 sm:text-[15px]">
              Replace weeks of production overhead with an AI-native workflow that stays editable and usable in
              production.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.025] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Proof</p>
                <p className="mt-3 text-5xl font-light tracking-[-0.06em]" style={{ color: primaryText }}>
                  10-100x
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">Faster, lower cost, still editable.</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.025] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Outcome</p>
                <p className="mt-3 text-lg leading-relaxed text-primary/85">Prompt-first. Production-ready. Director-controlled.</p>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="product" className="relative overflow-hidden">
        <div className="bg-noise absolute inset-0 opacity-[0.08]" />
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <SectionHeader index="04" label="Product">
              <div className="max-w-[18ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
                <WordsPullUpMultiStyle
                  justify="start"
                  segments={[
                    {
                      text: "Studio-grade workflow from raw intent to shot-ready 3D.",
                      className: "font-normal"
                    },
                    {
                      text: "Built for speed and control.",
                      className: "font-serif italic"
                    }
                  ]}
                />
              </div>
            </SectionHeader>

            <RevealCard delay={0}>
              <div className="relative min-h-[420px] overflow-hidden rounded-[1.9rem] border border-white/6 bg-[#121212] shadow-cinematic lg:min-h-[540px]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  src={productVideo}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/16 to-black/6" />
                <div className="absolute left-0 right-0 top-0 p-5 sm:p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Creative Canvas</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="max-w-[24rem] rounded-[1.2rem] border border-white/8 bg-black/42 p-4 backdrop-blur-md sm:p-5">
                    <p className="text-2xl leading-tight sm:text-[2rem]" style={{ color: primaryText }}>
                      One workflow from prompt to editable scene.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">
                      Text, sketch, or motion reference in. Scene graph, lighting, motion, and engine-ready output out.
                    </p>
                  </div>
                </div>
              </div>
            </RevealCard>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              {featureCards.map((card, index) => (
                <ProductFeatureCard key={card.title} {...card} delay={0.12 * (index + 1)} />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {productSteps.map((step) => (
                <div key={step.number} className="rounded-[1.3rem] border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{step.number}</p>
                  <p className="mt-2 text-sm" style={{ color: primaryText }}>
                    {step.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="market">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeader index="05" label="Market">
              <div className="max-w-[16ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
                <WordsPullUpMultiStyle
                  justify="start"
                  segments={[
                    { text: "A $150B+ opportunity", className: "font-normal" },
                    { text: "at the right inflection point.", className: "font-serif italic" }
                  ]}
                />
              </div>
            </SectionHeader>
            <div className="grid gap-4">
              {whyNow.map((item) => (
                <div key={item.title} className="border-t border-white/6 pt-4">
                  <p className="text-lg" style={{ color: primaryText }}>
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.9rem] border border-white/6 bg-[#101010] shadow-cinematic">
            <SectionBackdrop
              src={deckImages.market}
              videoSrc={sectionMotionVideos.market}
              imageClassName="object-[58%_48%]"
              videoClassName="object-[58%_44%] brightness-[0.58] saturate-[0.7]"
              opacity={0.12}
            />
            <div className="relative z-10 flex min-h-[520px] flex-col justify-between p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["$150B+", "Total Market"],
                  ["$45B", "Serviceable"],
                  ["$5B", "Obtainable"]
                ].map(([value, label], index) => (
                  <RevealCard key={label} delay={0.1 * (index + 1)}>
                    <div className="rounded-[1.25rem] border border-white/8 bg-black/36 p-4 backdrop-blur-md">
                      <p className="text-3xl" style={{ color: primaryText }}>
                        {value}
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
                    </div>
                  </RevealCard>
                ))}
              </div>
              <div className="max-w-[22rem] rounded-[1.2rem] border border-white/8 bg-black/40 p-4 backdrop-blur-md sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Why Now</p>
                <p className="mt-3 text-lg leading-relaxed text-primary/88">
                  Demand is global, visual, and increasingly native to AI-first production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="competition">
        <div>
          <SectionHeader index="06" label="Competition">
            <div className="max-w-[18ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
              <WordsPullUpMultiStyle
                justify="start"
                segments={[
                  { text: "The only platform combining", className: "font-normal" },
                  { text: "AI speed", className: "font-serif italic" },
                  { text: "with true 3D control.", className: "font-normal" }
                ]}
              />
            </div>
          </SectionHeader>
          <div className="overflow-hidden rounded-[1.65rem] border border-white/6 bg-black/26 backdrop-blur-sm">
            <div className="hidden grid-cols-[1.15fr_1fr_1fr_1fr] border-b border-white/6 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-gray-500 md:grid">
              <p>Category</p>
              <p>Speed</p>
              <p>3D Fidelity</p>
              <p>Editability</p>
            </div>
            {comparisonRows.map((row, index) => (
              <RevealCard delay={0.1 * index} key={row.category}>
                <div
                  className={`grid grid-cols-1 gap-4 border-t border-white/6 px-5 py-5 md:grid-cols-[1.15fr_1fr_1fr_1fr] md:px-6 ${
                    row.category === "UnstableML"
                      ? "bg-[linear-gradient(90deg,rgba(222,219,200,0.1),rgba(0,0,0,0.0)_36%,rgba(255,255,255,0.01))]"
                      : ""
                  }`}
                >
                  <div>
                    <p className="text-lg" style={{ color: primaryText }}>
                      {row.category}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{row.product}</p>
                  </div>
                  {[row.speed, row.fidelity, row.editability].map((value, itemIndex) => {
                    const good = row.state[itemIndex] === "good";
                    return (
                      <div key={value} className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 md:hidden">
                          {comparisonLabels[itemIndex]}
                        </p>
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${
                              good ? "bg-primary text-black" : "border border-white/10 text-gray-500"
                            }`}
                          >
                            {good ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </span>
                          <p className="text-sm leading-relaxed text-gray-400">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="traction">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeader index="07" label="Traction">
              <div className="max-w-[16ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
                <WordsPullUpMultiStyle
                  justify="start"
                  segments={[
                    { text: "Low-friction entry.", className: "font-normal" },
                    { text: "Expansion revenue by usage.", className: "font-serif italic" }
                  ]}
                />
              </div>
            </SectionHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              {tractionHighlights.map(([value, label], index) => (
                <RevealCard key={label} delay={0.08 * index}>
                  <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.025] p-5">
                    <p className="text-4xl" style={{ color: primaryText }}>
                      {value}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">{label}</p>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.86fr]">
            <div className="rounded-[1.7rem] border border-white/6 bg-black/26 p-5 backdrop-blur-sm sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Pricing</p>
              <div className="mt-5 grid gap-4">
                {pricingTiers.map((tier, index) => (
                  <RevealCard key={tier.title} delay={0.08 * index}>
                    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.025] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg" style={{ color: primaryText }}>
                            {tier.title}
                          </p>
                          <p className="mt-2 text-sm text-primary/80">{tier.credits}</p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-400">{tier.text}</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-500">{tier.detail}</p>
                        </div>
                        <p className="text-right text-2xl" style={{ color: primaryText }}>
                          {tier.price}
                          <span className="ml-1 text-sm text-gray-500">{tier.suffix}</span>
                        </p>
                      </div>
                    </div>
                  </RevealCard>
                ))}
              </div>
            </div>
            <div className="rounded-[1.7rem] border border-white/6 bg-black/26 p-5 backdrop-blur-sm sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Expansion</p>
              <p className="mt-4 text-5xl font-light tracking-[-0.06em]" style={{ color: primaryText }}>
                $192
              </p>
              <p className="mt-2 text-sm text-gray-400">Yearly upfront</p>
              <div className="mt-6 space-y-3">
                {onDemandBillingPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-relaxed text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-gray-400">
                Low entry price, then refill revenue from usage.
              </p>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="team-ask" className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <SectionHeader index="08" label="Team & Ask">
              <div className="max-w-[16ch] text-3xl leading-[0.97] sm:text-4xl sm:leading-[0.94] md:text-5xl lg:text-[4rem]">
                <WordsPullUpMultiStyle
                  justify="start"
                  segments={[
                    { text: "The team to build it.", className: "font-normal" },
                    { text: "The capital to scale it.", className: "font-serif italic" }
                  ]}
                />
              </div>
            </SectionHeader>
            <div className="grid gap-4">
              {[
                {
                  name: "[Founder Name]",
                  role: "CEO",
                  text: "Ex-Pixar tools lead. PhD in 3D Vision."
                },
                {
                  name: "[Founder Name]",
                  role: "CTO",
                  text: "Ex-OpenAI researcher. Gen-video models."
                }
              ].map((person, index) => (
                <RevealCard key={person.role} delay={0.1 * index}>
                  <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.025] p-5">
                    <p className="text-2xl" style={{ color: primaryText }}>
                      {person.name}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary">
                      {person.role}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-gray-300">{person.text}</p>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.88fr]">
            <EditorialImageCard
              src={deckImages.ask}
              videoSrc={sectionMotionVideos.ask}
              alt="A glowing rocket visual representing growth and competitive acceleration."
              eyebrow="Scale Up"
              title="Capital scales product velocity."
              className="min-h-[420px] lg:min-h-[520px]"
              imageClassName="object-top"
            />
            <RevealCard delay={0.2}>
              <div className="flex h-full flex-col rounded-[1.7rem] border border-white/6 bg-black/26 p-5 backdrop-blur-sm sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary">The Ask</p>
                <p className="mt-4 text-6xl leading-none" style={{ color: primaryText }}>
                  $3M
                </p>
                <p className="mt-2 text-lg text-gray-400">Seed Round</p>
                <div className="mt-8 space-y-3">
                  {askBars.map((item) => (
                    <div key={item.label} className="grid grid-cols-[70px_1fr_38px] items-center gap-3 text-sm">
                      <span className="text-gray-400">{item.label}</span>
                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#7f7868] via-[#b9b099] to-[#ede4cd]"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-right text-primary/75">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-10">
                  <p className="text-sm text-gray-500">founders@unstableml.ai</p>
                  <p className="mt-2 text-sm text-primary/80">Data room and live demo available</p>
                  <a
                    href="mailto:founders@unstableml.ai"
                    className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black transition-all hover:gap-3"
                  >
                    Request intro
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-110">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </span>
                  </a>
                </div>
              </div>
            </RevealCard>
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
