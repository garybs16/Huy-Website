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
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const productVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";
const problemVideo = "https://www.pexels.com/download/video/8475056/";
const marketVideo =
  "https://media.istockphoto.com/id/2215175664/video/astronaut-on-moon-in-front-of-planet-earth-wormhole-bending-laws-of-the-universe-augmented.mp4?s=mp4-640x640-is&k=20&c=PT3MofP0Ov4IGwzXNfIvPfRUWNSEssvEO4txyeIumqk=";
const askVideo = "https://www.pexels.com/download/video/31129791/";
const featuredVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";
const philosophyVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";
const strategyVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const craftVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4";

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
  return <p className="text-xs uppercase tracking-[0.32em] text-white/40">{children}</p>;
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
    <section id={id} className={`relative px-6 py-28 md:py-36 ${className}`}>
      {(backgroundVideoSrc || backgroundImageSrc) ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {backgroundVideoSrc ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 h-full w-full scale-[1.05] object-cover opacity-[0.14] saturate-0 ${backgroundClassName}`}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/72 to-black" />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-white/60 not-italic" style={accentSerif}>
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
      className={`liquid-glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition duration-300 hover:bg-white/[0.04] ${className}`}
    >
      {children}
    </a>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="liquid-glass rounded-full px-5 py-3 text-center">
      <p className="text-base font-medium tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/40">{label}</p>
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
    <div className={`group relative overflow-hidden rounded-[1.9rem] bg-white/[0.02] ${className}`}>
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
          className={`absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen ${imageClassName}`}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.09),_transparent_42%)]" />
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
      <div className="liquid-glass group overflow-hidden rounded-[1.7rem]">
        <div className="relative aspect-[16/10] overflow-hidden">
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
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">{number}</p>
              <h3 className="mt-3 text-xl tracking-tight text-white">{title}</h3>
            </div>
            <span className="liquid-glass rounded-full p-2 text-white/60 transition duration-300 group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {points.map((point) => (
              <div key={point} className="flex items-start gap-3 text-sm leading-relaxed text-white/55">
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
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black px-6 pb-8 pt-6">
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        preload="auto"
        src={heroVideo}
        style={{ opacity: videoOpacity }}
        className="absolute inset-0 h-full w-full object-cover [transform:translateY(calc(17%+100px))]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />

      <div className="relative z-20 mx-auto w-full max-w-5xl">
        <div className="liquid-glass flex items-center justify-between rounded-full px-5 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-white" />
              <span className="text-lg font-semibold text-white">Unstable ML</span>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a href="#product" className="hidden text-sm font-medium text-white md:inline-flex">
              View the workflow
            </a>
            <GlassButton href="#team-ask" className="px-5 py-2">
              Request intro
            </GlassButton>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center [-webkit-transform:translateY(-20%)] [transform:translateY(-20%)]">
        <Reveal className="max-w-5xl" y={40}>
          <p className="text-xs uppercase tracking-[0.34em] text-white/40">Unstable ML</p>
          <h1 className="mt-6 text-5xl tracking-tight text-white md:text-6xl lg:text-7xl">
            Generate cinematic <Accent>3D scenes</Accent> from text in seconds.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl px-4 text-sm leading-relaxed text-white/70">
            Cinematic text-to-3D infrastructure
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GlassButton href="#product">
              View the workflow
              <ArrowRight className="h-4 w-4" />
            </GlassButton>
            <GlassButton href="#traction">See traction</GlassButton>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {heroStats.map(([value, label]) => (
              <StatPill key={label} value={value} label={label} />
            ))}
          </div>
          <p className="mt-6 text-sm text-white/50">[Founder Name], CEO | [Founder Name], CTO</p>
        </Reveal>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-center gap-3">
        {[
          { icon: Instagram, href: "#" },
          { icon: Twitter, href: "#" },
          { icon: Globe, href: "#market" }
        ].map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            whileHover={{ y: -3 }}
            className="liquid-glass rounded-full p-4 text-white/80 transition hover:bg-white/[0.04] hover:text-white"
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
      <div className="mt-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <Reveal delay={0.05}>
            <h2 className="max-w-[14ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Video and 3D production is still slow, expensive, and <Accent>gated by expertise.</Accent>
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="mt-8 max-w-xl">
            <p className="text-base leading-relaxed text-white/60">
              Great ideas lose force when the workflow becomes the blocker. Creative teams still spend weeks on
              manual build, lighting, motion, and review before they reach the shot.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {problemStats.map((item, index) => (
              <Reveal key={item.title} delay={0.18 + index * 0.12}>
                <div className="liquid-glass rounded-[1.7rem] p-6">
                  <p className="text-4xl tracking-tight text-white">{item.value}</p>
                  <p className="mt-4 text-lg text-white">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.16} x={30}>
          <MediaPanel
            videoSrc={problemVideo}
            imageSrc={deckImages.problem}
            className="aspect-[4/5] min-h-[29rem]"
            videoClassName="object-[72%_48%] brightness-[0.5]"
            imageClassName="object-[70%_50%]"
          >
            <div className="flex h-full items-end p-6 md:p-8">
              <div className="liquid-glass max-w-md rounded-[1.6rem] p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Production Friction</p>
                <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                  Creative momentum dies when every shot still needs a specialist pipeline.
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
      backgroundVideoSrc={featuredVideo}
      backgroundImageSrc={deckImages.solution}
      backgroundClassName="object-center"
    >
      <div className="grid gap-8">
        <Reveal>
          <SectionLabel>Solution</SectionLabel>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="max-w-[14ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            Text-to-3D that turns ideas into <Accent>shot-ready scenes</Accent> in minutes.
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.16} className="mt-12">
        <MediaPanel
          videoSrc={productVideo}
          imageSrc={deckImages.solution}
          className="aspect-video rounded-[2rem]"
          videoClassName="object-cover brightness-[0.58]"
          imageClassName="object-center"
        >
          <div className="flex h-full flex-col justify-end p-6 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="liquid-glass max-w-md rounded-[1.6rem] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Workflow Shift</p>
                <p className="mt-3 text-base leading-relaxed text-white md:text-lg">
                  Replace weeks of production overhead with an AI-native workflow that stays editable and usable in
                  production.
                </p>
              </div>
              <motion.a
                href="#product"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="liquid-glass inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium text-white"
              >
                Explore more
              </motion.a>
            </div>
          </div>
        </MediaPanel>
      </Reveal>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Reveal delay={0.24}>
          <div className="liquid-glass rounded-[1.7rem] p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Proof</p>
            <p className="mt-5 text-5xl tracking-tight text-white md:text-6xl">10-100x</p>
            <p className="mt-4 text-sm leading-relaxed text-white/55">Faster, lower cost, still editable.</p>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="liquid-glass rounded-[1.7rem] p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Outcome</p>
            <p className="mt-5 text-xl leading-relaxed text-white md:text-2xl">
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
      backgroundImageSrc={deckImages.product}
      backgroundClassName="object-center"
    >
      <Reveal>
        <SectionLabel>Product</SectionLabel>
      </Reveal>
      <div className="mt-6 grid gap-12 md:grid-cols-2 md:gap-10">
        <div>
          <Reveal delay={0.06}>
            <h2 className="max-w-[14ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Studio-grade workflow from raw intent to shot-ready 3D. <Accent>Built for speed and control.</Accent>
            </h2>
          </Reveal>
          <Reveal delay={0.16} className="mt-10">
            <MediaPanel videoSrc={productVideo} imageSrc={deckImages.product} className="aspect-[4/5] min-h-[30rem]">
              <div className="flex h-full items-end p-6 md:p-8">
                <div className="liquid-glass max-w-md rounded-[1.6rem] p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Creative Canvas</p>
                  <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                    One workflow from prompt to editable scene.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">
                    Text, sketch, or motion reference in. Scene graph, lighting, motion, and engine-ready output out.
                  </p>
                </div>
              </div>
            </MediaPanel>
          </Reveal>
        </div>

        <div className="space-y-6 pt-1">
          {featureCards.map((card, index) => (
            <FeatureCard key={card.title} {...card} delay={0.18 + index * 0.12} />
          ))}
          <div className="grid gap-4 sm:grid-cols-3">
            {productSteps.map((step, index) => (
              <Reveal key={step.number} delay={0.22 + index * 0.1}>
                <div className="liquid-glass rounded-[1.5rem] p-5">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">{step.number}</p>
                  <p className="mt-3 text-lg tracking-tight text-white">{step.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{step.text}</p>
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
      backgroundImageSrc={deckImages.market}
      backgroundClassName="object-[50%_45%]"
    >
      <Reveal>
        <SectionLabel>Market</SectionLabel>
      </Reveal>
      <div className="mt-6 grid gap-12 md:grid-cols-[0.92fr_1.08fr] md:items-end">
        <div>
          <Reveal delay={0.08}>
            <h2 className="max-w-[12ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              A $150B+ opportunity <Accent>at the right inflection point.</Accent>
            </h2>
          </Reveal>
          <div className="mt-10 space-y-5">
            {whyNow.map((item, index) => (
              <Reveal key={item.title} delay={0.18 + index * 0.1}>
                <div className="border-t border-white/10 pt-5">
                  <p className="text-xl tracking-tight text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/55">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.14} x={30}>
          <MediaPanel
            videoSrc={marketVideo}
            imageSrc={deckImages.market}
            className="aspect-[4/5] min-h-[31rem]"
            videoClassName="object-[58%_44%] brightness-[0.48]"
            imageClassName="object-[56%_50%]"
          >
            <div className="flex h-full flex-col justify-between p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["$150B+", "Total Market"],
                  ["$45B", "Serviceable"],
                  ["$5B", "Obtainable"]
                ].map(([value, label], index) => (
                  <Reveal key={label} delay={0.24 + index * 0.08}>
                    <div className="liquid-glass rounded-[1.4rem] p-4">
                      <p className="text-2xl tracking-tight text-white md:text-3xl">{value}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="liquid-glass max-w-sm rounded-[1.5rem] p-5 md:p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Why Now</p>
                <p className="mt-3 text-lg leading-relaxed text-white">
                  Demand is global, visual, and increasingly native to AI-first production.
                </p>
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
      backgroundImageSrc={deckImages.competition}
      backgroundClassName="object-center"
    >
      <Reveal>
        <SectionLabel>Competition</SectionLabel>
      </Reveal>
      <Reveal delay={0.08} className="mt-6">
        <h2 className="max-w-[14ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
          The only platform combining <Accent>AI speed</Accent> with true 3D control.
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal delay={0.16}>
          <MediaPanel
            videoSrc={philosophyVideo}
            imageSrc={deckImages.competition}
            className="aspect-[16/10] min-h-[24rem]"
            videoClassName="object-center brightness-[0.42]"
            imageClassName="object-center opacity-24"
          >
            <div className="flex h-full items-end p-6 md:p-8">
              <div className="liquid-glass max-w-md rounded-[1.6rem] p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Competitive Edge</p>
                <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                  Fast enough for iteration. Structured enough for production.
                </p>
              </div>
            </div>
          </MediaPanel>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="grid gap-4">
            <div className="liquid-glass rounded-[1.7rem] p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Positioning</p>
              <p className="mt-4 text-xl leading-relaxed text-white">
                UnstableML sits between legacy 3D software and flat gen-video tools.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="liquid-glass rounded-[1.6rem] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Speed</p>
                <p className="mt-3 text-3xl tracking-tight text-white">mins</p>
                <p className="mt-2 text-sm text-white/55">Fast enough for creative iteration.</p>
              </div>
              <div className="liquid-glass rounded-[1.6rem] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Control</p>
                <p className="mt-3 text-3xl tracking-tight text-white">true 3D</p>
                <p className="mt-2 text-sm text-white/55">Editable, scene-aware, production ready.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.16} className="mt-8">
        <div className="liquid-glass overflow-hidden rounded-[2rem]">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-white/10 px-6 py-5 text-[10px] uppercase tracking-[0.28em] text-white/40 md:grid">
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
                  <p className="mt-2 text-sm text-white/45">{row.product}</p>
                </div>
                {[row.speed, row.fidelity, row.editability].map((value, index) => {
                  const good = row.state[index] === "good";
                  return (
                    <div key={value} className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 md:hidden">
                        {comparisonLabels[index]}
                      </p>
                      <div className="flex items-start gap-3 text-sm leading-relaxed text-white/60">
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${
                            good ? "bg-white text-black" : "liquid-glass text-white/55"
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
      backgroundImageSrc={deckImages.traction}
      backgroundClassName="object-center"
    >
      <Reveal>
        <SectionLabel>Traction</SectionLabel>
      </Reveal>
      <div className="mt-6 grid gap-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <Reveal delay={0.08}>
            <h2 className="max-w-[13ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              Low-friction entry. <Accent>Expansion revenue by usage.</Accent>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tractionHighlights.map(([value, label], index) => (
              <Reveal key={label} delay={0.18 + index * 0.08}>
                <div className="liquid-glass rounded-[1.7rem] p-6">
                  <p className="text-4xl tracking-tight text-white md:text-5xl">{value}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <Reveal delay={0.16} className="md:col-span-2">
            <MediaPanel
              videoSrc={featuredVideo}
              imageSrc={deckImages.traction}
              className="aspect-[16/8] min-h-[20rem]"
              videoClassName="object-center brightness-[0.42]"
              imageClassName="object-center opacity-24"
            >
              <div className="flex h-full items-end p-6 md:p-8">
                <div className="liquid-glass max-w-lg rounded-[1.6rem] p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Revenue Engine</p>
                  <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                    Free entry creates habit. Paid plans and refills expand revenue over time.
                  </p>
                </div>
              </div>
            </MediaPanel>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="liquid-glass rounded-[1.9rem] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Pricing</p>
              <div className="mt-6 space-y-4">
                {pricingTiers.map((tier) => (
                  <div key={tier.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xl tracking-tight text-white">{tier.title}</p>
                        <p className="mt-2 text-sm text-white/70">{tier.credits}</p>
                        <p className="mt-3 text-sm leading-relaxed text-white/55">{tier.text}</p>
                        <p className="mt-2 text-xs leading-relaxed text-white/35">{tier.detail}</p>
                      </div>
                      <p className="text-right text-3xl tracking-tight text-white">
                        {tier.price}
                        <span className="ml-1 text-sm text-white/40">{tier.suffix}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="liquid-glass flex h-full flex-col rounded-[1.9rem] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Expansion</p>
              <p className="mt-5 text-6xl tracking-tight text-white">$192</p>
              <p className="mt-2 text-sm text-white/55">Yearly upfront</p>
              <div className="mt-8 space-y-4">
                {onDemandBillingPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-relaxed text-white/60">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <p className="text-sm leading-relaxed text-white/55">
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
      backgroundVideoSrc={craftVideo}
      backgroundImageSrc={deckImages.ask}
      backgroundClassName="object-top"
    >
      <Reveal>
        <SectionLabel>Team & Ask</SectionLabel>
      </Reveal>
      <div className="mt-6 grid gap-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <Reveal delay={0.08}>
            <h2 className="max-w-[14ch] text-4xl leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              The team to build it. <Accent>The capital to scale it.</Accent>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4">
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
              <Reveal key={person.role} delay={0.18 + index * 0.12}>
                <div className="liquid-glass rounded-[1.7rem] p-6">
                  <p className="text-2xl tracking-tight text-white">{person.name}</p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/40">{person.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/60">{person.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <Reveal delay={0.18}>
            <MediaPanel
              videoSrc={askVideo}
              imageSrc={deckImages.ask}
              className="aspect-[4/5] min-h-[30rem]"
              videoClassName="object-top brightness-[0.52]"
              imageClassName="object-top"
            >
              <div className="flex h-full items-end p-6 md:p-8">
                <div className="liquid-glass max-w-sm rounded-[1.6rem] p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Scale Up</p>
                  <p className="mt-3 text-2xl leading-tight text-white md:text-3xl">
                    Capital scales product velocity.
                  </p>
                </div>
              </div>
            </MediaPanel>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="liquid-glass flex h-full flex-col rounded-[1.9rem] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">The Ask</p>
              <p className="mt-5 text-6xl tracking-tight text-white">$3M</p>
              <p className="mt-2 text-lg text-white/55">Seed Round</p>
              <div className="mt-8 space-y-4">
                {askBars.map((item) => (
                  <div key={item.label} className="grid grid-cols-[70px_1fr_38px] items-center gap-3 text-sm">
                    <span className="text-white/50">{item.label}</span>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-white" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-right text-white/55">{item.value}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-10">
                <p className="text-sm text-white/40">founders@unstableml.ai</p>
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
    <main className="overflow-hidden bg-black text-white">
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
