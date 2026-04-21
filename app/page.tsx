"use client";

import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  Instagram,
  Twitter,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const heroVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_050931_6b868bbb-85a4-498d-921e-e815d5a55906.mp4";
const featuredVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";
const philosophyVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";
const strategyVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const craftVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4";
const purpleVideo = heroVideo;
const productVideo = featuredVideo;
const problemVideo = philosophyVideo;
const marketVideo = featuredVideo;
const askVideo = craftVideo;

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Product", href: "#product" },
  { label: "Market", href: "#market" },
  { label: "Traction", href: "#traction" },
  { label: "Ask", href: "#team-ask" }
];

const heroStats = [
  ["25k+", "waitlist"],
  ["42%", "MoM growth"],
  ["88%", "retention"]
];

const problemStats = [
  {
    value: "3-6 weeks",
    title: "Per shot",
    text: "Manual build, light, motion, review."
  },
  {
    value: "$15k+",
    title: "Minimum cost",
    text: "Too expensive for fast iteration."
  }
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

const featureCards = [
  {
    number: "01",
    title: "Project Storyboard.",
    video: strategyVideo,
    points: ["Build scene intent before production starts."]
  },
  {
    number: "02",
    title: "Smart Critiques.",
    video: craftVideo,
    points: ["Surface the next creative fix in seconds."]
  },
  {
    number: "03",
    title: "Immersion Capsule.",
    video: philosophyVideo,
    points: ["Protect focus during active creation windows."]
  }
];

const whyNow = [
  { title: "Foundation models", text: "production-ready" },
  { title: "GPU costs", text: "falling fast" },
  { title: "Creator demand", text: "already here" }
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
    detail: "Built for habit formation."
  },
  {
    title: "Pro",
    price: "$20",
    suffix: "/mo",
    text: "Low-friction paid plan.",
    credits: "15,000 credits / month",
    detail: "Credits are designed to drive refill usage."
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

const askBars = [
  { label: "R&D", value: 50 },
  { label: "Compute", value: 25 },
  { label: "GTM", value: 15 },
  { label: "Ops", value: 10 }
];

const accentSerif = {
  fontFamily: "'Instrument Serif', serif",
  fontStyle: "italic" as const
};

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 30,
  x = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
      <p className="text-[11px] uppercase tracking-[0.34em] text-white/72">{children}</p>
      <span className="section-sheen h-px flex-1 opacity-80" />
    </div>
  );
}

function SectionShell({
  id,
  className = "",
  children,
  backgroundVideoSrc,
  backgroundImageSrc,
  backgroundClassName = ""
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  backgroundVideoSrc?: string;
  backgroundImageSrc?: string;
  backgroundClassName?: string;
}) {
  return (
    <section id={id} className={`relative flex min-h-[100svh] items-center px-5 py-16 md:px-7 md:py-24 ${className}`}>
      {(backgroundVideoSrc || backgroundImageSrc) ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {backgroundVideoSrc ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 h-full w-full scale-[1.05] object-cover opacity-[0.18] saturate-[0.54] ${backgroundClassName}`}
              src={backgroundVideoSrc}
            />
          ) : null}
          {backgroundImageSrc ? (
            <img
              src={backgroundImageSrc}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-[0.12] mix-blend-screen ${backgroundClassName}`}
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(164,136,255,0.14),_transparent_30%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/46 via-black/78 to-black/98" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/8 md:inset-x-7" />
      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-1">
        <div className="section-frame pointer-events-none absolute inset-0 rounded-[2.4rem] opacity-70" />
        <div className="relative rounded-[2.4rem] bg-[linear-gradient(180deg,rgba(4,4,7,0.34),rgba(1,1,2,0.16))] px-3 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-white/72 not-italic" style={accentSerif}>
      {children}
    </span>
  );
}

function GlassButton({
  href,
  children,
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`liquid-glass shadow-panel inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition duration-300 hover:bg-white/[0.04] hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)] ${className}`}
    >
      {children}
    </a>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="liquid-glass shadow-panel min-w-[112px] rounded-full px-5 py-3 text-center">
      <p className="text-base font-medium tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/55">{label}</p>
    </div>
  );
}

function MediaPanel({
  videoSrc,
  imageSrc,
  className = "",
  videoClassName = "",
  imageClassName = "",
  children
}: {
  videoSrc: string;
  imageSrc?: string;
  className?: string;
  videoClassName?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}) {
  return (
      <div className={`shadow-panel group relative overflow-hidden rounded-[2.15rem] border border-white/10 bg-white/[0.03] ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${videoClassName}`}
        src={videoSrc}
      />
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover opacity-28 mix-blend-screen ${imageClassName}`}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/94 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(191,175,255,0.1),_transparent_36%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_34%,rgba(0,0,0,0.42)_100%)]" />
      <div className="absolute inset-x-6 top-0 h-px bg-white/20" />
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}

function FeatureCard({
  number,
  title,
  image,
  video,
  points,
  delay
}: {
  number: string;
  title: string;
  image?: string;
  video?: string;
  points: string[];
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="liquid-glass shadow-panel group overflow-hidden rounded-[1.75rem]">
        <div className="relative aspect-[16/9] overflow-hidden">
          {video ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              src={video}
            />
          ) : (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/52">{number}</p>
              <h3 className="mt-2 text-[1.05rem] tracking-tight text-white">{title}</h3>
            </div>
            <span className="liquid-glass rounded-full p-2 text-white/60 transition duration-300 group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 space-y-2.5">
            {points.map((point) => (
              <div key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/72">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

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

    const ensurePlayback = () => {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
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
      ensurePlayback();
      animateOpacity(1, 500);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        ensurePlayback();
      }
    };

    ensurePlayback();
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [videoRef]);

  return opacity;
}

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoOpacity = useHeroVideoLoop(videoRef);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black px-5 pb-8 pt-5 md:px-7 md:pb-10 md:pt-6">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        preload="auto"
        src={heroVideo}
        style={{ opacity: videoOpacity }}
        className="absolute inset-0 h-full w-full scale-[1.1] object-cover object-[50%_34%] md:object-[50%_36%] lg:object-[50%_38%]"
      />
      <div className="page-grid absolute inset-0 opacity-[0.05]" />
      <div className="page-noise absolute inset-0 opacity-[0.07]" />
      <div className="absolute inset-y-0 left-[8%] hidden w-px bg-white/8 xl:block" />
      <div className="absolute inset-y-0 right-[8%] hidden w-px bg-white/8 xl:block" />
      <div className="hero-spotlight absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.09),_transparent_34%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/42 via-black/56 to-black" />
      <div className="hero-vignette absolute inset-0" />

      <div className="relative z-20 mx-auto w-full max-w-[1120px]">
        <div className="liquid-glass shadow-panel flex items-center justify-between rounded-full px-4 py-2.5 md:px-6 md:py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-white" />
              <span className="text-base font-semibold text-white md:text-lg">Unstable ML</span>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-xs font-medium text-white/80 transition hover:text-white md:text-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a href="#product" className="hidden text-xs font-medium text-white md:inline-flex md:text-sm">
              View the workflow
            </a>
            <GlassButton href="#team-ask" className="px-4 py-2 md:px-5">
              Request intro
            </GlassButton>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 items-center [-webkit-transform:translateY(-3%)] [transform:translateY(-3%)]">
        <div className="grid w-full gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <Reveal className="max-w-[46rem] text-center lg:text-left" y={40}>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/18 px-4 py-2 backdrop-blur-md lg:mx-0">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/60">Seed Narrative 01 / 08</p>
            </div>
            <p className="mt-7 text-xs uppercase tracking-[0.34em] text-white/56">Unstable ML</p>
            <h1 className="mt-4 text-[2.7rem] tracking-tight text-white md:text-[3.95rem] lg:text-[4.95rem] lg:leading-[0.95]">
              Generate cinematic <Accent>3D scenes</Accent> from text in seconds.
            </h1>
            <div className="mt-5 flex items-center justify-center gap-4 lg:justify-start">
              <span className="h-px w-12 bg-white/20" />
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Cinematic text-to-3D infrastructure</p>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <GlassButton href="#product">
                View the workflow
                <ArrowRight className="h-4 w-4" />
              </GlassButton>
              <GlassButton href="#traction">See traction</GlassButton>
            </div>
          </Reveal>

          <Reveal className="lg:justify-self-end" delay={0.16} x={24}>
            <div className="liquid-glass shadow-panel max-w-[21.5rem] rounded-[1.85rem] p-4 md:p-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Investor Snapshot</p>
                <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-white/88 md:text-base">
                  Editable scenes. Faster production loops.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {heroStats.map(([value, label]) => (
                  <StatPill key={label} value={value} label={label} />
                ))}
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.2rem]">
                <MediaPanel
                  videoSrc={featuredVideo}
                  className="aspect-[16/11] min-h-[10.5rem]"
                  videoClassName="object-center brightness-[0.56]"
                >
                  <div className="flex h-full items-end p-4">
                    <div className="liquid-glass max-w-[13rem] rounded-[1.2rem] p-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/58">Output State</p>
                      <p className="mt-2 text-base leading-tight text-white md:text-lg">Shot-ready scenes with director control.</p>
                    </div>
                  </div>
                </MediaPanel>
              </div>
              <p className="mt-4 text-sm text-white/62">[Founder Name], CEO | [Founder Name], CTO</p>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-center gap-3 lg:justify-start lg:pl-[max(0px,calc((100vw-70rem)/2+1.5rem))]">
        {[
          { icon: Instagram, href: "#" },
          { icon: Twitter, href: "#" },
          { icon: Globe, href: "#market" }
        ].map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            whileHover={{ y: -3 }}
            className="liquid-glass rounded-full p-3 text-white/80 transition hover:bg-white/[0.04] hover:text-white md:p-4"
          >
            <item.icon className="h-5 w-5" />
          </motion.a>
        ))}
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <SectionShell
      id="problem"
      className="bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]"
    >
      <Reveal>
        <SectionLabel>Problem</SectionLabel>
      </Reveal>
      <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <Reveal delay={0.05}>
            <h2 className="max-w-[14ch] text-[2.35rem] leading-[1.05] tracking-tight text-white md:text-[3rem] lg:text-[4rem]">
              Video and 3D production is still slow, expensive, and <Accent>gated by expertise.</Accent>
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="mt-8 max-w-xl">
            <p className="text-base leading-relaxed text-white/74">
              Creative teams still spend weeks building, lighting, and reviewing before they reach the shot.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {problemStats.map((item, index) => (
              <Reveal key={item.title} delay={0.18 + index * 0.12}>
                <div className="liquid-glass shadow-panel rounded-[1.7rem] p-6">
                  <p className="text-4xl tracking-tight text-white">{item.value}</p>
                  <p className="mt-4 text-lg text-white">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.16} x={30}>
          <MediaPanel
            videoSrc={problemVideo}
            className="aspect-[4/5] min-h-[21rem]"
            videoClassName="object-[72%_48%] brightness-[0.5]"
          >
            <div className="flex h-full items-end p-6 md:p-8">
              <div className="liquid-glass shadow-panel max-w-md rounded-[1.6rem] p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Production Friction</p>
                <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                  Every shot still depends on a specialist pipeline.
                </p>
              </div>
            </div>
          </MediaPanel>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function SolutionSection() {
  return (
    <SectionShell
      id="solution"
      backgroundVideoSrc={purpleVideo}
      backgroundClassName="object-[50%_26%]"
    >
      <div className="grid gap-6">
        <Reveal>
          <SectionLabel>Solution</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="max-w-[17ch] text-[2.35rem] leading-[1.05] tracking-tight text-white md:max-w-[18ch] md:text-[3rem] lg:max-w-[19ch] lg:text-[4rem]">
            <span className="lg:block">Text-to-3D that turns ideas into</span>{" "}
            <span className="lg:block lg:whitespace-nowrap">
              <Accent>shot-ready scenes</Accent> in minutes.
            </span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.16} className="mt-6">
        <MediaPanel
          videoSrc={productVideo}
          className="aspect-[16/7] rounded-[1.55rem]"
          videoClassName="object-cover brightness-[0.58]"
        >
          <div className="flex h-full flex-col justify-end p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="liquid-glass shadow-panel max-w-md rounded-[1.45rem] p-4 md:p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Workflow Shift</p>
                <p className="mt-2 text-sm leading-relaxed text-white md:text-base">AI-native workflow that stays editable in production.</p>
              </div>
              <motion.a
                href="#product"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="liquid-glass shadow-panel inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium text-white"
              >
                Explore more
              </motion.a>
            </div>
          </div>
        </MediaPanel>
      </Reveal>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Reveal delay={0.24}>
          <div className="liquid-glass shadow-panel rounded-[1.5rem] p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Proof</p>
            <p className="mt-3 text-4xl tracking-tight text-white md:text-5xl">10-100x</p>
            <p className="mt-3 text-sm leading-relaxed text-white/72">Faster, lower cost, still editable.</p>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="liquid-glass shadow-panel rounded-[1.5rem] p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Outcome</p>
            <p className="mt-3 text-lg leading-relaxed text-white md:text-xl">
              Prompt-first. Production-ready. Director-controlled.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function ProductSection() {
  return (
    <SectionShell
      id="product"
      backgroundVideoSrc={philosophyVideo}
      backgroundClassName="object-center"
    >
      <Reveal>
        <SectionLabel>Product</SectionLabel>
      </Reveal>
      <div className="mt-5 grid gap-8 md:grid-cols-2 md:gap-7">
        <div>
          <Reveal delay={0.06}>
            <h2 className="max-w-[14ch] text-[2.35rem] leading-[1.05] tracking-tight text-white md:text-[3rem] lg:text-[4rem]">
              Studio-grade workflow from raw intent to shot-ready 3D. <Accent>Built for speed and control.</Accent>
            </h2>
          </Reveal>
          <Reveal delay={0.16} className="mt-6">
            <MediaPanel videoSrc={productVideo} className="aspect-[4/5] min-h-[18.5rem]">
              <div className="flex h-full items-end p-4 md:p-5">
                <div className="liquid-glass shadow-panel max-w-md rounded-[1.4rem] p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Creative Canvas</p>
                  <p className="mt-2 text-xl leading-tight text-white md:text-2xl">
                    One workflow from prompt to editable scene.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/74">Text, sketch, or motion reference in. Editable scene out.</p>
                </div>
              </div>
            </MediaPanel>
          </Reveal>
        </div>

        <div className="grid content-start gap-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {featureCards.map((card, index) => (
              <FeatureCard key={card.title} {...card} delay={0.18 + index * 0.1} />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {productSteps.map((step, index) => (
              <Reveal key={step.number} delay={0.24 + index * 0.08}>
                <div className="liquid-glass shadow-panel rounded-[1.35rem] p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">{step.number}</p>
                  <p className="mt-2 text-base tracking-tight text-white">{step.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/70">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function MarketSection() {
  return (
    <SectionShell
      id="market"
      backgroundVideoSrc={craftVideo}
      backgroundClassName="object-[50%_45%]"
    >
      <Reveal>
        <SectionLabel>Market</SectionLabel>
      </Reveal>
      <div className="mt-5 grid gap-8 md:grid-cols-[0.92fr_1.08fr] md:items-end">
        <div>
          <Reveal delay={0.08}>
            <h2 className="max-w-[12ch] text-[2.35rem] leading-[1.05] tracking-tight text-white md:text-[3rem] lg:text-[4rem]">
              A $150B+ opportunity <Accent>at the right inflection point.</Accent>
            </h2>
          </Reveal>
          <div className="mt-10 space-y-5">
            {whyNow.map((item, index) => (
              <Reveal key={item.title} delay={0.18 + index * 0.1}>
                <div className="border-t border-white/10 pt-5">
                  <p className="text-xl tracking-tight text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.14} x={30}>
          <MediaPanel
            videoSrc={marketVideo}
            className="aspect-[4/5] min-h-[22.5rem]"
            videoClassName="object-[58%_44%] brightness-[0.48]"
          >
            <div className="flex h-full flex-col justify-between p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["$150B+", "Total Market"],
                  ["$45B", "Serviceable"],
                  ["$5B", "Obtainable"]
                ].map(([value, label], index) => (
                  <Reveal key={label} delay={0.24 + index * 0.08}>
                    <div className="liquid-glass shadow-panel rounded-[1.4rem] p-4">
                      <p className="text-2xl tracking-tight text-white md:text-3xl">{value}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/54">{label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="liquid-glass shadow-panel max-w-sm rounded-[1.5rem] p-5 md:p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Why Now</p>
                <p className="mt-3 text-lg leading-relaxed text-white">AI-first production is becoming standard behavior.</p>
              </div>
            </div>
          </MediaPanel>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function CompetitionSection() {
  return (
    <SectionShell
      id="competition"
      backgroundVideoSrc={philosophyVideo}
      backgroundClassName="object-center"
    >
      <Reveal>
        <SectionLabel>Competition</SectionLabel>
      </Reveal>
      <Reveal delay={0.08} className="mt-6">
        <h2 className="max-w-[14ch] text-[2.05rem] leading-[1.02] tracking-tight text-white md:max-w-none md:text-[2.65rem] lg:text-[3.15rem]">
          <span className="block">The only platform</span>
          <span className="block lg:whitespace-nowrap">combining <Accent>AI speed</Accent> with true 3D control.</span>
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal delay={0.16}>
          <MediaPanel
            videoSrc={philosophyVideo}
            className="aspect-[16/10] min-h-[18rem]"
            videoClassName="object-center brightness-[0.58]"
          >
            <div className="flex h-full items-end p-6 md:p-8">
              <div className="liquid-glass shadow-panel max-w-md rounded-[1.6rem] p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Competitive Edge</p>
                <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                  Fast enough for iteration. Structured enough for production.
                </p>
              </div>
            </div>
          </MediaPanel>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="grid gap-4">
            <div className="liquid-glass shadow-panel rounded-[1.7rem] p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/54">Positioning</p>
              <p className="mt-4 text-xl leading-relaxed text-white">Between legacy 3D suites and flat gen-video tools.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="liquid-glass shadow-panel rounded-[1.6rem] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/54">Speed</p>
                <p className="mt-3 text-3xl tracking-tight text-white">mins</p>
                <p className="mt-2 text-sm text-white/70">Fast for iteration.</p>
              </div>
              <div className="liquid-glass shadow-panel rounded-[1.6rem] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/54">Control</p>
                <p className="mt-3 text-3xl tracking-tight text-white">true 3D</p>
                <p className="mt-2 text-sm text-white/70">Editable and production ready.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.16} className="mt-8">
        <div className="liquid-glass shadow-panel overflow-hidden rounded-[2rem]">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-white/10 px-6 py-5 text-[10px] uppercase tracking-[0.28em] text-white/54 md:grid">
            <p>Category</p>
            <p>Speed</p>
            <p>3D Fidelity</p>
            <p>Editability</p>
          </div>
          {comparisonRows.map((row, rowIndex) => (
            <Reveal key={row.category} delay={0.2 + rowIndex * 0.08}>
              <div
                className={`grid gap-5 border-t border-white/10 px-6 py-6 md:grid-cols-[1.2fr_1fr_1fr_1fr] ${
                  row.category === "UnstableML"
                    ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_35%,rgba(255,255,255,0.02))]"
                    : ""
                }`}
              >
                <div>
                  <p className="text-lg tracking-tight text-white">{row.category}</p>
                  <p className="mt-2 text-sm text-white/62">{row.product}</p>
                </div>
                {[row.speed, row.fidelity, row.editability].map((value, index) => {
                  const good = row.state[index] === "good";
                  return (
                    <div key={value} className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/52 md:hidden">
                        {comparisonLabels[index]}
                      </p>
                      <div className="flex items-start gap-3 text-sm leading-relaxed text-white/74">
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${
                            good ? "bg-white text-black" : "liquid-glass text-white/68"
                          }`}
                        >
                          {good ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                        <span>{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  );
}

function TractionSection() {
  return (
    <SectionShell
      id="traction"
      className="bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]"
      backgroundVideoSrc={strategyVideo}
      backgroundClassName="object-center"
    >
      <Reveal>
        <SectionLabel>Traction</SectionLabel>
      </Reveal>
      <div className="mt-5 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <Reveal delay={0.08}>
            <h2 className="max-w-[13ch] text-[2.35rem] leading-[1.05] tracking-tight text-white md:text-[3rem] lg:text-[4rem]">
              Low-friction entry. <Accent>Expansion revenue by usage.</Accent>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tractionHighlights.map(([value, label], index) => (
              <Reveal key={label} delay={0.18 + index * 0.08}>
                <div className="liquid-glass shadow-panel rounded-[1.7rem] p-6">
                  <p className="text-4xl tracking-tight text-white md:text-5xl">{value}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/72">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <Reveal delay={0.16} className="md:col-span-2">
            <MediaPanel
              videoSrc={featuredVideo}
              className="aspect-[16/8] min-h-[14rem]"
              videoClassName="object-center brightness-[0.56]"
            >
              <div className="flex h-full items-end p-6 md:p-8">
                <div className="liquid-glass shadow-panel max-w-lg rounded-[1.6rem] p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Revenue Engine</p>
                  <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                    Free entry drives habit. Paid plans and refills expand revenue.
                  </p>
                </div>
              </div>
            </MediaPanel>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="liquid-glass shadow-panel rounded-[1.9rem] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/54">Pricing</p>
              <div className="mt-6 space-y-4">
                {pricingTiers.map((tier) => (
                  <div key={tier.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xl tracking-tight text-white">{tier.title}</p>
                        <p className="mt-2 text-sm text-white/70">{tier.credits}</p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">{tier.text}</p>
                      </div>
                      <p className="text-right text-3xl tracking-tight text-white">
                        {tier.price}
                        <span className="ml-1 text-sm text-white/55">{tier.suffix}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="liquid-glass shadow-panel flex h-full flex-col rounded-[1.9rem] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/54">Expansion</p>
              <p className="mt-5 text-6xl tracking-tight text-white">$192</p>
              <p className="mt-2 text-sm text-white/70">Yearly upfront</p>
              <div className="mt-8 space-y-4">
                {onDemandBillingPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-relaxed text-white/74">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <p className="text-sm leading-relaxed text-white/70">
                  Low entry price, then refill revenue from usage.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

function TeamAskSection() {
  return (
    <SectionShell
      id="team-ask"
      className="pb-20"
      backgroundVideoSrc={askVideo}
      backgroundClassName="object-[50%_45%]"
    >
      <Reveal>
        <SectionLabel>Team & Ask</SectionLabel>
      </Reveal>
      <div className="mt-5 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <Reveal delay={0.08}>
            <h2 className="max-w-[14ch] text-[2.35rem] leading-[1.05] tracking-tight text-white md:text-[3rem] lg:text-[4rem]">
              The team to build it. <Accent>The capital to scale it.</Accent>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4">
            {[
              {
                name: "[Founder Name]",
                role: "CEO",
                text: "Ex-Pixar tools lead."
              },
              {
                name: "[Founder Name]",
                role: "CTO",
                text: "Ex-OpenAI researcher."
              }
            ].map((person, index) => (
              <Reveal key={person.role} delay={0.18 + index * 0.12}>
                <div className="liquid-glass shadow-panel rounded-[1.7rem] p-6">
                  <p className="text-2xl tracking-tight text-white">{person.name}</p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/54">{person.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/72">{person.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <Reveal delay={0.18}>
            <MediaPanel
              videoSrc={askVideo}
              className="aspect-[4/5] min-h-[22rem]"
              videoClassName="object-[50%_45%] brightness-[0.52] saturate-[0.78]"
            >
              <div className="flex h-full items-end p-6 md:p-8">
                <div className="liquid-glass shadow-panel max-w-sm rounded-[1.6rem] p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">Scale Up</p>
                  <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                    Capital scales product velocity.
                  </p>
                </div>
              </div>
            </MediaPanel>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="liquid-glass shadow-panel flex h-full flex-col rounded-[1.9rem] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/54">The Ask</p>
              <p className="mt-5 text-6xl tracking-tight text-white">$3M</p>
              <p className="mt-2 text-lg text-white/70">Seed Round</p>
              <div className="mt-8 space-y-4">
                {askBars.map((item) => (
                  <div key={item.label} className="grid grid-cols-[70px_1fr_38px] items-center gap-3 text-sm">
                    <span className="text-white/62">{item.label}</span>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-white" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-right text-white/70">{item.value}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-10">
                <p className="text-sm text-white/60">founders@unstableml.ai</p>
                <p className="mt-2 text-sm text-white/70">Data room and live demo available</p>
                <GlassButton href="mailto:founders@unstableml.ai" className="mt-6">
                  Request intro
                  <ArrowRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="page-grid absolute inset-0 opacity-[0.035]" />
        <div className="page-noise absolute inset-0 opacity-[0.035]" />
        <div className="absolute left-[10%] top-0 h-full w-px bg-white/[0.05]" />
        <div className="absolute right-[10%] top-0 h-full w-px bg-white/[0.05]" />
        <div className="absolute left-1/2 top-[7%] h-[22rem] w-[40rem] -translate-x-1/2 rounded-full bg-[rgba(122,90,255,0.12)] blur-[150px]" />
        <div className="absolute left-[30%] top-[14%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[rgba(255,124,202,0.05)] blur-[130px]" />
      </div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ProductSection />
      <MarketSection />
      <CompetitionSection />
      <TractionSection />
      <TeamAskSection />
    </main>
  );
}
