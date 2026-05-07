"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const teamMembers = [
  {
    initials: "SM",
    name: "Samit M.",
    role: "CEO / Co-Founder",
    imageSrc: ""
  },
  {
    initials: "JL",
    name: "Justin Li",
    role: "Backend developer",
    imageSrc: ""
  },
  {
    initials: "JY",
    name: "Justin Yee",
    role: "Full stack developer",
    imageSrc: ""
  },
  {
    initials: "NK",
    name: "Nick Kulinich",
    role: "Frontend developer",
    imageSrc: ""
  }
];

export default function TeamAskSection() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="team"
      ref={ref}
      className="deck-section bg-[radial-gradient(ellipse_at_bottom,_rgba(151,176,209,0.08)_0%,_transparent_62%)] px-6 pb-28 pt-18 md:pb-32 md:pt-20"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="deck-kicker mb-5 text-xs">
              06 / TEAM
            </p>
            <h2 className="max-w-4xl text-3xl tracking-tight text-white md:text-5xl">
              Built by operators who know the stack.
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-white/56 md:text-right">
            Product depth. Model depth. Clear taste.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.08 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: 0.14 + index * 0.08 }}
              className={`${index % 2 === 0 ? "deck-tint-warm" : "deck-tint-cool"} deck-panel-matte deck-frame rounded-[1.35rem] p-3`}
            >
              <div className="deck-media relative aspect-square overflow-hidden rounded-[1.05rem] bg-black/58">
                {/* Put team images here by setting imageSrc to a public image path, for example "/team/samit-m.jpg". */}
                {member.imageSrc ? (
                  <img
                    src={member.imageSrc}
                    alt={`${member.name} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_28%,_rgba(255,255,255,0.14),_transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.01)),radial-gradient(circle_at_50%_118%,_rgba(255,255,255,0.08),_transparent_28%)]">
                    <div className="deck-panel-soft flex h-14 w-14 items-center justify-center rounded-full text-sm text-white/70">
                      {member.initials}
                    </div>
                  </div>
                )}

                <div className="absolute right-3 top-3 deck-panel-soft rounded-full px-2.5 py-1 text-[10px] text-white/54">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>

              <div className="px-1 pb-2 pt-4">
                <p className="text-xl tracking-tight text-white">{member.name}</p>
                <p className="mt-1 text-sm leading-snug text-white/58">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
