import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const primaryText = "#E1E0CC";

const heroVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const productVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";
const problemVideo = "https://www.pexels.com/download/video/8475056/";
const marketVideo =
  "https://media.istockphoto.com/id/2215175664/video/astronaut-on-moon-in-front-of-planet-earth-wormhole-bending-laws-of-the-universe-augmented.mp4?s=mp4-640x640-is&k=20&c=PT3MofP0Ov4IGwzXNfIvPfRUWNSEssvEO4txyeIumqk=";
const askVideo = "https://www.pexels.com/download/video/31129791/";

const deckImages = {
  problem: "/prisma-media/problem-orbit.svg",
  solution: "/prisma-media/solution-grid.svg",
  market: "/prisma-media/market-globe.svg",
  ask: "/prisma-media/ask-ascent.svg",
  product: "/prisma-media/product-ribbon.svg",
  competition: "/prisma-media/competition-matrix.svg",
  traction: "/prisma-media/traction-signal.svg"
};

type SlideProps = {
  id: string;
  step: string;
  eyebrow: string;
  title: string;
  description: string;
  points?: string[];
  stats?: [string, string][];
  mediaVideo: string;
  mediaImage: string;
  mediaAlt: string;
  mediaPosition?: string;
  overlayImagePosition?: string;
  reverse?: boolean;
  children?: ReactNode;
};

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
      <p className="text-xl tracking-[-0.04em]" style={{ color: primaryText }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
    </div>
  );
}

function MediaPanel({
  video,
  image,
  alt,
  videoPosition = "object-center",
  imagePosition = "object-center"
}: {
  video: string;
  image: string;
  alt: string;
  videoPosition?: string;
  imagePosition?: string;
}) {
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-[1.7rem] border border-white/8 bg-black/40 shadow-cinematic sm:min-h-[420px] lg:min-h-[560px]">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover ${videoPosition}`}
        style={{ filter: "brightness(0.62) saturate(0.76)" }}
        src={video}
      />
      <img
        src={image}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-45 ${imagePosition}`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.42),rgba(0,0,0,0.74))]" />
      <div className="bg-noise absolute inset-0 opacity-[0.12]" />
      <div className="cream-glow absolute -left-14 top-6 h-52 w-52 opacity-30" />
      <div className="cream-glow absolute bottom-0 right-0 h-64 w-64 opacity-25" />
    </div>
  );
}

function SlideFrame({
  id,
  step,
  eyebrow,
  title,
  description,
  points,
  stats,
  mediaVideo,
  mediaImage,
  mediaAlt,
  mediaPosition,
  overlayImagePosition,
  reverse = false,
  children
}: SlideProps) {
  return (
    <section id={id} className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto max-w-[1320px]">
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0f0f0f,#090909)] shadow-cinematic">
          <div
            className={`grid gap-0 lg:min-h-[78svh] ${reverse ? "lg:grid-cols-[1fr_0.92fr]" : "lg:grid-cols-[0.92fr_1fr]"}`}
          >
            <div className={`flex ${reverse ? "lg:order-2" : ""}`}>
              <div className="flex w-full flex-col justify-between p-6 sm:p-8 lg:p-12 xl:p-14">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">{eyebrow}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Slide {step}</p>
                  </div>
                  <h2
                    className="mt-6 max-w-[13ch] text-[clamp(2.8rem,5vw,5.6rem)] leading-[0.94] tracking-[-0.06em]"
                    style={{ color: primaryText }}
                  >
                    {title}
                  </h2>
                  <p className="mt-6 max-w-[42rem] text-base leading-relaxed text-[#d7d1be]/84 sm:text-lg">
                    {description}
                  </p>
                  {points ? (
                    <div className="mt-8 space-y-3">
                      {points.map((point) => (
                        <p key={point} className="max-w-[42rem] text-sm leading-relaxed text-gray-300 sm:text-[15px]">
                          {point}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {stats ? (
                    <div className="mt-8 grid max-w-[34rem] gap-3 sm:grid-cols-3">
                      {stats.map(([value, label]) => (
                        <StatPill key={label} value={value} label={label} />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="mt-10">
                  {children}
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-5 lg:p-6 ${reverse ? "lg:order-1" : ""}`}>
              <MediaPanel
                video={mediaVideo}
                image={mediaImage}
                alt={mediaAlt}
                videoPosition={mediaPosition}
                imagePosition={overlayImagePosition}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="relative bg-black pb-8 pt-4">
      <SlideFrame
        id="intro"
        step="01"
        eyebrow="Unstable ML"
        title="Cinematic text-to-3D infrastructure."
        description="Generate shot-ready 3D scenes from text, sketches, and reference motion with a workflow built for creative teams."
        points={[
          "Prompt-native creation for directors and artists.",
          "Editable outputs that stay useful after the first render."
        ]}
        mediaVideo={heroVideo}
        mediaImage={deckImages.product}
        mediaAlt="A cinematic product visual introducing Unstable ML."
        mediaPosition="object-[50%_38%]"
        overlayImagePosition="object-center"
      >
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#problem"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black transition hover:gap-3"
          >
            Learn more
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-sm text-gray-500">Seed deck concept. Simple, visual, and direct.</p>
        </div>
      </SlideFrame>

      <SlideFrame
        id="problem"
        step="02"
        eyebrow="Problem"
        title="3D production is still too slow."
        description="Great ideas lose force when the workflow becomes the obstacle."
        points={[
          "Manual scene building, lighting, motion, and review cycles drag creative momentum.",
          "Teams spend too much time in tooling before they reach the shot."
        ]}
        mediaVideo={problemVideo}
        mediaImage={deckImages.problem}
        mediaAlt="Astronaut-style cinematic background representing friction in current 3D production."
        mediaPosition="object-[72%_50%]"
        overlayImagePosition="object-[78%_50%]"
        reverse
      >
        <div className="grid max-w-[28rem] gap-3 sm:grid-cols-2">
          <StatPill value="3-6 weeks" label="Per shot" />
          <StatPill value="$15k+" label="Starting cost" />
        </div>
      </SlideFrame>

      <SlideFrame
        id="solution"
        step="03"
        eyebrow="Solution"
        title="From prompt to scene in minutes."
        description="Unstable ML removes weeks of production overhead without removing creative control."
        points={[
          "Scene intent is built fast, refined fast, and kept editable.",
          "Teams move from concept to usable 3D without a dead-end video workflow."
        ]}
        mediaVideo={productVideo}
        mediaImage={deckImages.solution}
        mediaAlt="A product workflow visual showing prompt to scene generation."
        mediaPosition="object-center"
        overlayImagePosition="object-center"
      >
        <div className="flex flex-wrap gap-3">
          <StatPill value="10-100x" label="Faster" />
          <StatPill value="Editable" label="Output" />
          <StatPill value="Engine-ready" label="Workflow" />
        </div>
      </SlideFrame>

      <SlideFrame
        id="product"
        step="04"
        eyebrow="Product"
        title="One workflow from idea to editable scene."
        description="The product is built to feel direct: input intent, generate scenes, then refine inside a production-friendly workflow."
        points={[
          "Prompt, sketch, or reference input starts the scene.",
          "Outputs stay editable instead of collapsing into flat video."
        ]}
        mediaVideo={productVideo}
        mediaImage={deckImages.product}
        mediaAlt="A cinematic product slide for the workflow."
        mediaPosition="object-[54%_48%]"
        overlayImagePosition="object-center"
        reverse
      >
        <div className="flex flex-wrap gap-3">
          <StatPill value="01" label="Input" />
          <StatPill value="02" label="Generate" />
          <StatPill value="03" label="Refine" />
        </div>
      </SlideFrame>

      <SlideFrame
        id="market"
        step="05"
        eyebrow="Market"
        title="The market is large and arriving now."
        description="Creator demand, lower compute costs, and model maturity are aligning at the same moment."
        points={[
          "AI-native visual production is moving from novelty to workflow.",
          "The wedge is credible because creators already want speed without losing control."
        ]}
        stats={[
          ["$150B+", "Total market"],
          ["$45B", "Serviceable"],
          ["$5B", "Obtainable"]
        ]}
        mediaVideo={marketVideo}
        mediaImage={deckImages.market}
        mediaAlt="Astronaut and earth visual representing market scale and timing."
        mediaPosition="object-[58%_44%]"
        overlayImagePosition="object-[58%_48%]"
        reverse
      >
        <p className="max-w-[34rem] text-sm leading-relaxed text-gray-400">
          Foundation models crossed a quality threshold. GPU costs are dropping. Creative teams are already shifting behavior.
        </p>
      </SlideFrame>

      <SlideFrame
        id="competition"
        step="06"
        eyebrow="Competition"
        title="Speed matters. Control matters more."
        description="The category winner is not just fast. It is the company that keeps teams in editable 3D while moving at AI speed."
        points={[
          "Traditional tools have control but not speed.",
          "Gen-video tools have speed but not editability."
        ]}
        mediaVideo={productVideo}
        mediaImage={deckImages.competition}
        mediaAlt="A competitive landscape slide for Unstable ML."
        mediaPosition="object-center"
        overlayImagePosition="object-center"
      >
        <div className="grid max-w-[34rem] gap-3 sm:grid-cols-3">
          <StatPill value="Slow" label="Traditional" />
          <StatPill value="Flat" label="Gen-video" />
          <StatPill value="Editable" label="Unstable ML" />
        </div>
      </SlideFrame>

      <SlideFrame
        id="traction"
        step="07"
        eyebrow="Traction"
        title="Early demand is already visible."
        description="The revenue engine is simple: low-friction entry, broad paid conversion, then expansion through usage."
        stats={[
          ["25k+", "Waitlist"],
          ["42%", "MoM growth"],
          ["88%", "Retention"]
        ]}
        points={[
          "Free gets creators in quickly.",
          "Paid and usage expansion build the revenue curve."
        ]}
        mediaVideo={heroVideo}
        mediaImage={deckImages.traction}
        mediaAlt="A traction slide showing early demand."
        mediaPosition="object-center"
        overlayImagePosition="object-center"
        reverse
      >
        <div className="grid max-w-[34rem] gap-3 sm:grid-cols-3">
          <StatPill value="$20" label="Pro plan" />
          <StatPill value="$192" label="Annual" />
          <StatPill value="2c" label="Refill rate" />
        </div>
      </SlideFrame>

      <SlideFrame
        id="ask"
        step="08"
        eyebrow="Team & Ask"
        title="Raise capital. Scale the product."
        description="The ask is straightforward: fund product, compute, and go-to-market behind an early signal of demand."
        stats={[
          ["$3M", "Seed ask"],
          ["50%", "R&D"],
          ["25%", "Compute"]
        ]}
        points={[
          "Founder, CEO: creative tooling and 3D systems.",
          "Co-Founder, CTO: frontier models and inference depth."
        ]}
        mediaVideo={askVideo}
        mediaImage={deckImages.ask}
        mediaAlt="A cinematic background representing capital and momentum."
        mediaPosition="object-center"
        overlayImagePosition="object-center"
      >
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:founders@unstableml.ai"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black transition hover:gap-3"
          >
            Request intro
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-sm text-gray-500">Demo and data room available on request.</p>
        </div>
      </SlideFrame>
    </main>
  );
}
