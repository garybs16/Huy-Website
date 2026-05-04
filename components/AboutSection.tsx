"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
const features = [
  {
    tag: "01",
    title: "Browser-based 3D scene",
    detail:
      "Full Blender-like control over every aspect of the 3D scene directly in the browser, including exact character motion, camera movement, staging, and edits."
  },
  {
    tag: "02",
    title: "Real-time video-to-video model",
    detail:
      "As the creator or agent edits, the video reshapes immediately for live previsualization and co-pilot style iteration."
  },
  {
    tag: "03",
    title: "Splat-based and image-based skyboxes",
    detail:
      "The world agent supports flat image-based skyboxes and Gaussian splat skyboxes, understands the movable 3D world or mesh, and places characters inside it."
  },
  {
    tag: "04",
    title: "Rigging and 700+ animations",
    detail:
      "Rig humanoid characters and apply 700+ built-in animations for blocking, movement, and fast performance iteration."
  }
];

export default function AboutSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={ref}
      className="deck-section deck-divider relative bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] px-6 pb-18 pt-20 md:pb-22 md:pt-24"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div>
            <p className="deck-kicker mb-6 text-xs">
              03 / FEATURES
            </p>

            <h2 className="max-w-5xl text-3xl leading-tight tracking-tight text-white md:text-5xl">
              Core capabilities
            </h2>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.75, delay: 0.12 }}
              className="deck-frame deck-media relative overflow-hidden rounded-[2rem]"
            >
              <img
                src="/core-capabilities-scene.jpg"
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/24 to-black/6" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,_rgba(151,176,209,0.16),_transparent_24%)]" />

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="deck-panel deck-frame max-w-md rounded-[1.6rem] bg-black/64 p-4 md:p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/52">
                    Browser-Based 3D Scene
                  </p>
                  <p className="mt-3 text-2xl leading-[1.02] tracking-tight text-white md:text-[2rem]">
                    Full control over the world, camera, characters, and motion.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="deck-frame deck-media relative overflow-hidden rounded-[1.7rem]"
            >
              <img
                src="/core-capabilities-world.jpg"
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/24 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="max-w-sm text-lg leading-tight tracking-tight text-white/96 md:text-xl">
                  Skyboxes, world mapping, and real-time visual feedback.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="deck-panel deck-frame deck-tint-warm rounded-[1.7rem] p-5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/48">
                Black box vs. controllable scene
              </p>
              <p className="mt-4 text-2xl leading-tight tracking-tight text-white md:text-3xl">
                Regular video generation is a black box. This keeps the 3D scene editable.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/68">
                Instead of accepting a flattened output from a prompt, creators and agents can tangibly control character movement, camera movement, motion, and scene changes.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.34 + index * 0.06 }}
                  className="deck-panel-matte deck-frame min-h-[14rem] rounded-[1.55rem] p-5"
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/44">
                    {feature.tag}
                  </p>
                  <p className="mt-3 text-xl leading-tight tracking-tight text-white">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/66">
                    {feature.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
