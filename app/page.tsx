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
const goldenFieldVideo =
  "https://videos.pexels.com/video-files/29894402/12827622_2560_1440_30fps.mp4";
const mountainLakeVideo =
  "https://videos.pexels.com/video-files/30600756/13089083_2560_1440_30fps.mp4";
const sectionMotionVideos = {
  problem: mountainLakeVideo,
  solution: goldenFieldVideo,
  product: productVideo,
  market: goldenFieldVideo,
  competition: productVideo,
  traction: goldenFieldVideo,
  ask: mountainLakeVideo
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
    text: "Input text prompts, sketches, or reference clips to guide the creation process."
  },
  {
    number: "02",
    title: "AI Neural Core",
    text: "Processes data into scene graphs, 3D meshes, lighting, and motion dynamically."
  },
  {
    number: "03",
    title: "Cinematic 3D",
    text: "Fully rendered, editable, engine-ready outputs ready for immediate use."
  }
];

const whyNow = [
  { title: "Foundation models", text: "crossed production viability threshold" },
  { title: "GPU inference costs", text: "dropping rapidly to enable scale" },
  { title: "Creators demand", text: "prompt-first AI-speed tooling" }
];

const featureCards = [
  {
    number: "01",
    title: "Project Storyboard.",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
    points: [
      "Input text prompts, sketches, or reference clips.",
      "Build scene intent before technical production starts.",
      "Keep directors focused on narrative instead of tooling."
    ]
  },
  {
    number: "02",
    title: "Smart Critiques.",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
    points: [
      "AI analysis surfaces visual weaknesses in seconds.",
      "Creative notes stay grounded in cinematic intent.",
      "Tool integrations keep review loops production-ready."
    ]
  },
  {
    number: "03",
    title: "Immersion Capsule.",
    image:
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
    points: [
      "Silence noisy notifications during active creation windows.",
      "Ambient soundscapes keep the workspace focused and calm.",
      "Schedule syncing aligns teams across production milestones."
    ]
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
    text: "Entry plan for fast adoption.",
    credits: "800 credits / month",
    detail: "Best for trial and habit formation.",
    margin: "User growth"
  },
  {
    title: "Pro",
    price: "$20",
    suffix: "/mo",
    text: "Low-cost paid plan built for volume.",
    credits: "15,000 credits / month",
    detail: "25% margin. Included credits are designed to drive refill usage.",
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
  "2 cents per 10 credits",
  "100% margin",
  "Weekly billing"
];

const revenueLoop = [
  { label: "Free to Paid", value: 35 },
  { label: "Cheap Pro Entry", value: 62 },
  { label: "Credit Exhaustion", value: 82 },
  { label: "Weekly Refill Billing", value: 100 }
];

const fundAllocation = ["50% R&D", "25% Compute", "15% GTM", "10% Ops"];
const heroStats = [
  ["25k+", "waitlist"],
  ["42%", "MoM growth"],
  ["88%", "retention"]
];
const growthBars = [
  { label: "Jan", value: 24 },
  { label: "Feb", value: 34 },
  { label: "Mar", value: 52 },
  { label: "Apr", value: 68 },
  { label: "May", value: 82 },
  { label: "Jun", value: 96 }
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
  note: string;
  children: React.ReactNode;
  center?: boolean;
}) {
  if (center) {
    return (
      <div className="mb-10 border-b border-white/5 pb-10 sm:mb-12 sm:pb-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <SectionTag>{label}</SectionTag>
          <p className="mt-4 text-5xl font-light tracking-[-0.06em] text-white/18">{index}</p>
          <div className="mx-auto mt-6 max-w-4xl">{children}</div>
          <p className="mx-auto mt-7 max-w-[36rem] rounded-[1.5rem] border border-white/8 bg-black/45 px-6 py-4 text-center text-[13px] leading-relaxed text-gray-400 backdrop-blur-md sm:text-sm lg:max-w-[40rem]">
            {note}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 grid gap-5 border-b border-white/5 pb-10 sm:mb-12 sm:gap-6 sm:pb-12 lg:grid-cols-[132px_minmax(0,1fr)] lg:gap-10">
      <div>
        <SectionTag>{label}</SectionTag>
        <p className="mt-4 text-5xl font-light tracking-[-0.06em] text-white/18">{index}</p>
      </div>
      <div className="min-w-0">
        {children}
        <p className="mt-7 max-w-[32rem] rounded-[1.5rem] border border-white/8 bg-black/45 px-5 py-4 text-[13px] leading-relaxed text-gray-400 backdrop-blur-md sm:text-sm lg:ml-auto xl:max-w-[35rem]">
          {note}
        </p>
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

function DataBars({
  title,
  bars,
  className = ""
}: {
  title: string;
  bars: { label: string; value: number }[];
  className?: string;
}) {
  return (
    <div className={`rounded-[1.75rem] border border-white/5 bg-[#0b0b0b] p-5 shadow-cinematic ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-primary sm:text-xs">{title}</p>
      <div className="mt-6 flex h-44 items-end gap-3">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-32 w-full items-end rounded-full bg-white/[0.03] p-1">
              <div
                className="w-full rounded-full bg-gradient-to-t from-[#7f7868] via-[#b9b099] to-[#ede4cd]"
                style={{ height: `${bar.value}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{bar.label}</p>
          </div>
        ))}
      </div>
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
      <div className="cream-glow pointer-events-none absolute left-1/2 top-0 h-48 w-[28rem] -translate-x-1/2 opacity-30" />
      <div className="mx-auto w-full max-w-[1500px] 2xl:max-w-[1680px] min-[2200px]:max-w-[1920px] min-[2800px]:max-w-[2280px] min-[3400px]:max-w-[2880px]">
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

function ScrollRevealText({
  text,
  className = ""
}: {
  text: string;
  className?: string;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto max-w-3xl px-4 text-balance text-center text-sm leading-relaxed text-[#DEDBC8] sm:text-[15px] md:text-[1.02rem] ${className}`}
    >
      {text}
    </motion.p>
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
      <div className="flex h-full min-h-[300px] flex-col rounded-[1.75rem] border border-white/5 bg-[#212121] p-5 shadow-cinematic sm:p-6">
        <div className="relative overflow-hidden rounded-[1.3rem] border border-white/5 bg-black/30">
              <div className="cream-glow absolute inset-0 opacity-45" />
          <img
            src={image}
            alt={title}
            className="relative h-[7.5rem] w-full object-cover sm:h-36"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">{number}</p>
            <h3 className="mt-1 text-xl sm:text-[1.35rem]" style={{ color: primaryText }}>
              {title}
            </h3>
          </div>
        </div>
        <div className="mt-6 space-y-3.5">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-[15px] leading-relaxed text-gray-300">{point}</p>
            </div>
          ))}
        </div>
        <a
          href="#team-ask"
          className="mt-auto inline-flex items-center gap-2 pt-8 text-sm text-primary/90 transition hover:gap-3"
        >
          Learn more
          <ArrowRight className="h-4 w-4 -rotate-45" />
        </a>
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
        className={`flex h-full min-h-[220px] flex-col justify-center rounded-[1.6rem] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.42))] p-6 text-center shadow-cinematic backdrop-blur-sm sm:p-7 ${className}`}
      >
        {value ? (
          <p className="text-4xl font-light tracking-[-0.05em] sm:text-[3.4rem]" style={{ color: primaryText }}>
            {value}
          </p>
        ) : null}
        <h3 className={`${value ? "mt-4" : ""} text-[1.45rem] sm:text-[1.8rem]`} style={{ color: primaryText }}>
          {title}
        </h3>
        <p className="mx-auto mt-3 max-w-[30ch] text-center text-[15px] leading-relaxed text-gray-300">
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
        className={`group relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#111111] shadow-cinematic ${className}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/34 to-black/12" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div
            className={`max-w-md rounded-[1.45rem] border border-white/8 bg-black/52 p-4 backdrop-blur-md sm:p-5 ${contentClassName}`}
          >
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary sm:text-xs">{eyebrow}</p>
            <p
              className={`mt-2 max-w-[20ch] text-xl leading-tight sm:text-[1.7rem] ${titleClassName}`}
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
    <main className="relative bg-black">
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
        <div className="relative overflow-hidden rounded-[2rem] bg-[#101010] px-5 py-10 text-center shadow-cinematic sm:px-8 sm:py-14 md:px-12">
          <SectionBackdrop
            src={deckImages.problem}
            videoSrc={sectionMotionVideos.problem}
            showImage={false}
            videoClassName="object-[50%_42%]"
            opacity={0.16}
            videoOpacity={0.48}
          />
          <div className="relative z-10">
          <SectionHeader
            index="02"
            label="Problem"
            note="The opening investor question is simple: why does this market need a new production primitive at all?"
            center
          >
            <div className="mx-auto max-w-4xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl">
              <WordsPullUpMultiStyle
                justify="center"
                segments={[
                  {
                    text: "Video and 3D production is too slow, expensive, and",
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
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl rounded-[1.35rem] border border-white/6 bg-black/20 px-4 py-4 backdrop-blur-sm sm:px-6">
              <ScrollRevealText
                text="Crushing delays kill creative momentum, while high minimum production costs keep ambitious stories locked behind specialist teams and expensive pipelines."
                className="mt-0 max-w-[42rem]"
              />
            </div>
          </div>
          <div className="mt-10 grid gap-5 xl:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <EditorialImageCard
              src={deckImages.problem}
              videoSrc={sectionMotionVideos.problem}
              alt="A creator overwhelmed by traditional 3D production tooling."
              eyebrow="Production Friction"
              title="Great ideas lose force when the workflow becomes the obstacle."
              className="min-h-[320px]"
              imageClassName="object-center"
              contentClassName="mx-auto max-w-[28rem] text-center"
              titleClassName="max-w-none"
            />
            <div className="grid gap-4">
              <InsightCard
                delay={0}
                value="3-6 weeks"
                title="Per shot"
                text="Manual environment building, lighting, motion, and iteration cycles stall the creative process."
              />
              <InsightCard
                delay={0.15}
                value="$15k+"
                title="Minimum cost"
                text="Traditional pipelines price out indie creators and compress experimentation into a narrow, risky window."
              />
            </div>
          </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="solution">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:items-start xl:gap-5">
          <RevealCard delay={0}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6 shadow-cinematic sm:p-8 md:p-10">
              <SectionBackdrop
                src={deckImages.solution}
                videoSrc={sectionMotionVideos.solution}
                imageClassName="object-center"
                videoClassName="object-center"
                opacity={0.14}
              />
              <div className="relative z-10">
              <SectionHeader
                index="03"
                label="Solution"
                note="This section should read like the value unlock: speed, affordability, and creative control in one motion."
              >
                <div className="max-w-4xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl">
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
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
                <div className="rounded-[1.6rem] border border-white/8 bg-black/35 p-5 backdrop-blur-md sm:p-6">
                  <p className="max-w-[34rem] text-sm leading-relaxed text-primary/78 sm:text-base">
                    The product removes weeks of manual production overhead without removing directorial
                    control. Scenes stay editable, exportable, and production-usable from the first prompt.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {["Prompt-first", "Production-ready", "Director-controlled"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary/80"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-white/8 bg-black/40 p-5 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Outcome</p>
                  <p className="mt-4 text-5xl font-light tracking-[-0.06em]" style={{ color: primaryText }}>
                    Minutes
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    Replace multi-week 3D pipelines with an AI-native workflow that still exports cleanly to production.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <EditorialImageCard
                  src={deckImages.solution}
                  videoSrc={sectionMotionVideos.solution}
                  alt="An abstract visual showing disorder transformed into a clean AI-assisted 3D workflow."
                  eyebrow="Workflow Shift"
                  title="Move from production chaos to structured, editable scene generation."
                  delay={0.15}
                  className="min-h-[320px]"
                  imageClassName="object-center"
                />
              </div>
              </div>
            </div>
          </RevealCard>
          <div className="grid gap-4 xl:gap-5">
            <InsightCard
              delay={0.12}
              title="10-100x faster"
              text="Weeks of manual work compressed to minutes, without breaking the creative loop."
            />
            <InsightCard
              delay={0.24}
              title="Fractional cost"
              text="No render farms or specialized teams needed to get from concept to scene."
            />
            <InsightCard
              delay={0.36}
              title="Full editability"
              text="Creative control stays with the director through export, iteration, and downstream production."
            />
          </div>
        </div>
      </SectionShell>

      <SectionShell id="product" className="relative overflow-hidden">
        <div className="bg-noise absolute inset-0 opacity-[0.15]" />
        <SectionBackdrop
          src={deckImages.product}
          videoSrc={sectionMotionVideos.product}
          className="rounded-[2rem]"
          imageClassName="object-center"
          videoClassName="object-center"
          opacity={0.1}
        />
        <div className="relative rounded-[2rem] border border-white/5 bg-black/25 p-5 shadow-cinematic backdrop-blur-[8px] sm:p-6 md:p-8">
          <SectionHeader
            index="04"
            label="Product"
            note="Organize the product like a workflow, not a feature dump. One hero canvas, then the supporting modules."
            center
          >
            <div className="mx-auto max-w-4xl text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              <WordsPullUpMultiStyle
                justify="center"
                segments={[
                  {
                    text: "Studio-grade workflows from raw intent to shot-ready 3D.",
                    className: "font-normal"
                  },
                  {
                    text: "Built for pure vision. Powered by art.",
                    className: "text-gray-500 font-normal"
                  }
                ]}
              />
            </div>
          </SectionHeader>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr] lg:gap-5">
            <RevealCard delay={0}>
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-[1.75rem] bg-[#212121] shadow-cinematic">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover"
                  src={productVideo}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="max-w-[10ch] text-2xl leading-tight" style={{ color: primaryText }}>
                    Your creative canvas.
                  </p>
                </div>
              </div>
            </RevealCard>

            {featureCards.map((card, index) => (
              <ProductFeatureCard key={card.title} {...card} delay={0.15 * (index + 1)} />
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 lg:gap-5">
            {productSteps.map((step, index) => (
              <RevealCard key={step.number} delay={0.12 * index}>
                <div className="rounded-[1.5rem] border border-white/5 bg-black/50 p-5">
                  <p className="text-xs text-primary">{step.number}</p>
                  <h3 className="mt-2 text-lg" style={{ color: primaryText }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{step.text}</p>
                </div>
              </RevealCard>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {["Fully editable scene graph", "Native Unreal & Blender export"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-primary/80"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="market">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-7">
          <RevealCard delay={0}>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#101010] p-6 shadow-cinematic sm:p-8">
              <SectionBackdrop
                src={deckImages.market}
                videoSrc={sectionMotionVideos.market}
                showImage={false}
                videoClassName="object-[50%_52%]"
                opacity={0.12}
                videoOpacity={0.46}
              />
              <div className="relative z-10">
              <SectionHeader
                index="05"
                label="Market"
                note="The market block should quickly establish scale, timing, and why AI-native behavior makes the wedge credible."
              >
                <div className="text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl">
                  <WordsPullUpMultiStyle
                    justify="start"
                    segments={[
                      { text: "A $150B+ opportunity", className: "font-normal" },
                      { text: "at the right inflection point.", className: "font-serif italic" }
                    ]}
                  />
                </div>
              </SectionHeader>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[ 
                  ["$150B+", "Total Market"],
                  ["$45B", "Serviceable"],
                  ["$5B", "Obtainable"]
                ].map(([value, label], index) => (
                  <RevealCard key={label} delay={0.1 * (index + 1)}>
                    <div className="rounded-[1.25rem] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.28))] p-5">
                      <p className="text-3xl" style={{ color: primaryText }}>
                        {value}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
                    </div>
                  </RevealCard>
                ))}
              </div>
              </div>
            </div>
          </RevealCard>
          <RevealCard delay={0.2}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6 sm:p-8">
              <SectionBackdrop
                src={deckImages.market}
                videoSrc={sectionMotionVideos.market}
                showImage={false}
                videoClassName="object-[50%_52%]"
                opacity={0.11}
                videoOpacity={0.4}
              />
              <div className="relative z-10">
              <SectionTag>Why Now</SectionTag>
              <div className="mt-6 space-y-6">
                {whyNow.map((item) => (
                  <div key={item.title} className="border-b border-white/5 pb-5 last:border-b-0 last:pb-0">
                    <p className="text-xl" style={{ color: primaryText }}>
                      {item.title}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <EditorialImageCard
                  src={deckImages.market}
                  videoSrc={sectionMotionVideos.market}
                  alt="A global 3D visual illustrating market expansion and network growth."
                  eyebrow="Global Scale"
                  title="Demand is global, visual, and increasingly native to AI-first production."
                  delay={0.25}
                  className="min-h-[250px]"
                />
              </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell id="competition">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#101010] p-6 shadow-cinematic sm:p-8 md:p-10">
          <SectionBackdrop
            src={deckImages.competition}
            videoSrc={sectionMotionVideos.competition}
            imageClassName="object-center"
            videoClassName="object-center"
            opacity={0.12}
          />
          <div className="relative z-10">
          <SectionHeader
            index="06"
            label="Competition"
            note="Differentiate on structure, not hype. The winner here is the company that keeps both speed and control."
          >
            <div className="max-w-5xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl">
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
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["AI-native speed", "Minutes, not weeks"],
              ["True 3D fidelity", "Scene graph, not flat pixels"],
              ["Director control", "Outputs remain editable in production"]
            ].map(([title, text], index) => (
              <RevealCard delay={0.08 * index} key={title}>
                <div className="rounded-[1.5rem] border border-white/5 bg-black/45 p-5">
                  <p className="text-lg" style={{ color: primaryText }}>
                    {title}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">{text}</p>
                </div>
              </RevealCard>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/5">
            <div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr] bg-black/80 px-6 py-3 text-xs uppercase tracking-[0.2em] text-gray-500 md:grid">
              <p>Category</p>
              <p>Speed</p>
              <p>3D Fidelity</p>
              <p>Editability</p>
            </div>
            {comparisonRows.map((row, index) => (
              <RevealCard delay={0.12 * index} key={row.category}>
                <div
                  className={`grid grid-cols-1 gap-4 border-t border-white/5 px-4 py-5 md:grid-cols-[1.1fr_1fr_1fr_1fr] md:px-6 ${
                    row.category === "UnstableML"
                      ? "bg-[linear-gradient(90deg,rgba(222,219,200,0.12),rgba(12,12,12,0.94)_44%)]"
                      : "bg-[#0c0c0c]"
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
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 md:hidden">
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
        </div>
      </SectionShell>

      <SectionShell id="traction">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-7">
          <RevealCard delay={0}>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#101010] p-6 shadow-cinematic sm:p-8">
              <SectionBackdrop
                src={deckImages.traction}
                videoSrc={sectionMotionVideos.traction}
                imageClassName="object-center"
                videoClassName="object-center"
                opacity={0.14}
              />
              <div className="relative z-10">
              <SectionHeader
                index="07"
                label="Traction"
                note="Simple model: cheap entry, broad adoption, then refill revenue from power users."
              >
                <div className="text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl">
                  <WordsPullUpMultiStyle
                    justify="start"
                    segments={[
                      { text: "Low-friction entry.", className: "font-normal" },
                      { text: "Expansion revenue by usage.", className: "font-serif italic" }
                    ]}
                  />
                </div>
              </SectionHeader>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {tractionHighlights.map(([value, label], index) => (
                  <RevealCard key={label} delay={0.08 * index}>
                    <div className="rounded-[1.5rem] bg-black/60 p-5">
                      <p className="text-4xl" style={{ color: primaryText }}>
                        {value}
                      </p>
                      <p className="mt-2 text-sm text-gray-400">{label}</p>
                    </div>
                  </RevealCard>
                ))}
              </div>
              <div className="mt-6">
                <DataBars title="Revenue Expansion Loop" bars={revenueLoop} />
              </div>
              </div>
            </div>
          </RevealCard>
          <div className="grid gap-6">
            <RevealCard delay={0.1}>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6">
                <SectionBackdrop
                  src={deckImages.traction}
                  videoSrc={sectionMotionVideos.traction}
                  imageClassName="object-right"
                  videoClassName="object-right"
                  opacity={0.1}
                />
                <div className="relative z-10">
                <SectionTag>Model</SectionTag>
                <div className="mt-6 grid gap-4">
                  {pricingTiers.map((tier, index) => (
                    <RevealCard key={tier.title} delay={0.08 * index}>
                      <div className="rounded-[1.5rem] bg-[#151515] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-lg" style={{ color: primaryText }}>
                              {tier.title}
                            </p>
                            <p className="mt-2 text-sm text-primary/80">{tier.credits}</p>
                            <p className="mt-1 text-sm leading-relaxed text-gray-400">{tier.text}</p>
                          </div>
                          <p className="text-right text-2xl" style={{ color: primaryText }}>
                            {tier.price}
                            <span className="ml-1 text-sm text-gray-500">{tier.suffix}</span>
                          </p>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
                          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-primary/85">
                            {tier.margin}
                          </span>
                          <p className="text-sm leading-relaxed text-gray-400">{tier.detail}</p>
                        </div>
                      </div>
                    </RevealCard>
                  ))}
                </div>
                <div className="mt-5 rounded-[1.4rem] border border-white/6 bg-black/35 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary">Yearly Incentive</p>
                  <p className="mt-3 text-3xl" style={{ color: primaryText }}>
                    $192 upfront
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">$240 list price. 20% off. $16/mo effective.</p>
                </div>
                </div>
              </div>
            </RevealCard>
            <RevealCard delay={0.2}>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6">
                <SectionBackdrop
                  src={deckImages.traction}
                  videoSrc={sectionMotionVideos.traction}
                  imageClassName="object-left"
                  videoClassName="object-left"
                  opacity={0.08}
                />
                <div className="relative z-10">
                <SectionTag>On-Demand Billing</SectionTag>
                <div className="mt-6 rounded-[1.5rem] border border-white/6 bg-black/35 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-4xl" style={{ color: primaryText }}>
                        $0.02
                      </p>
                      <p className="mt-2 text-sm text-gray-400">per 10 credits</p>
                    </div>
                    <div>
                      <p className="text-4xl" style={{ color: primaryText }}>
                        100%
                      </p>
                      <p className="mt-2 text-sm text-gray-400">refill margin</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {onDemandBillingPoints.map((point) => (
                    <div key={point} className="flex items-center gap-3 rounded-[1.2rem] border border-white/5 bg-black/25 px-4 py-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-relaxed text-gray-400">{point}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-primary/75">Cheap Pro gets users in. Credit overages drive expansion revenue.</p>
                </div>
              </div>
            </RevealCard>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="team-ask" className="pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#101010] p-6 shadow-cinematic sm:p-8 md:p-10">
          <SectionBackdrop
            src={deckImages.ask}
            videoSrc={sectionMotionVideos.ask}
            showImage={false}
            videoClassName="object-[52%_45%]"
            opacity={0.12}
            videoOpacity={0.46}
          />
          <div className="relative z-10">
          <SectionHeader
            index="08"
            label="Team & Ask"
            note="Close with conviction: the right team, a specific raise, and a clear sense of where the capital goes."
          >
            <div className="max-w-3xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl">
              <WordsPullUpMultiStyle
                justify="start"
                segments={[
                  { text: "The team to build it.", className: "font-normal" },
                  { text: "The capital to scale it.", className: "font-serif italic" }
                ]}
              />
            </div>
          </SectionHeader>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:gap-7">
            <div className="flex h-full flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                    <div className="rounded-[1.5rem] border border-white/5 bg-black/60 p-5">
                      <p className="text-2xl" style={{ color: primaryText }}>
                        {person.name}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary">
                        {person.role}
                      </p>
                      <p className="mt-4 text-[15px] leading-relaxed text-gray-300">{person.text}</p>
                    </div>
                  </RevealCard>
                ))}
              </div>
              <RevealCard delay={0.2}>
                <div className="flex flex-1 flex-col rounded-[1.6rem] border border-white/5 bg-black/38 p-6 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary sm:text-xs">Why This Team</p>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary/90 sm:text-[1.35rem]">
                    A founding team built across creative tooling, 3D systems, and frontier model research,
                    with the technical range to ship infrastructure and the product taste to make it usable.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      "3D vision and tooling depth",
                      "Model and inference expertise",
                      "Production-native product judgment"
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.25rem] border border-white/6 bg-black/45 px-4 py-4 text-sm leading-relaxed text-gray-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </RevealCard>
            </div>
            <RevealCard delay={0.2}>
              <div className="flex h-full flex-col rounded-[1.75rem] border border-white/5 bg-black/45 p-6">
                <div className="mb-6">
                  <EditorialImageCard
                    src={deckImages.ask}
                    videoSrc={sectionMotionVideos.ask}
                    alt="A glowing rocket visual representing growth and competitive acceleration."
                    eyebrow="Scale Up"
                    title="Capital turns product velocity into durable market advantage."
                    className="min-h-[220px]"
                    imageClassName="object-top"
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-primary">The Ask</p>
                <p className="mt-4 text-6xl leading-none" style={{ color: primaryText }}>
                  $3M
                </p>
                <p className="mt-2 text-lg text-gray-400">Seed Round</p>
                <div className="mt-8 rounded-[1.5rem] border border-white/5 bg-[#0c0c0c] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Use of funds</p>
                  <div className="mt-4 space-y-3">
                    {askBars.map((item) => (
                      <div key={item.label} className="grid grid-cols-[74px_1fr_44px] items-center gap-3 text-sm">
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
        </div>
      </SectionShell>
    </main>
  );
}
