"use client";

import { MotionValue, motion, useTransform } from "framer-motion";

type AnimatedLetterProps = {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
};

export function AnimatedLetter({ char, progress, range }: AnimatedLetterProps) {
  const opacity = useTransform(progress, range, [0.2, 1], { clamp: true });

  return (
    <motion.span style={{ opacity }} className={char === " " ? "mr-[0.28em]" : ""}>
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}
