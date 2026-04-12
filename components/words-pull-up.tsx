"use client";

import { motion } from "framer-motion";

type WordsPullUpProps = {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  justify?: "start" | "center";
};

type Segment = {
  text: string;
  className?: string;
};

type WordsPullUpMultiStyleProps = {
  segments: Segment[];
  className?: string;
  justify?: "start" | "center";
};

const transition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] as const
};

function renderWord(word: string, showAsterisk?: boolean) {
  if (!showAsterisk) {
    return word;
  }

  const lastIndex = word.length - 1;
  if (lastIndex < 0 || word[lastIndex].toLowerCase() !== "a") {
    return word;
  }

  return (
    <span className="relative inline-block">
      {word.slice(0, -1)}
      <span className="relative inline-block">
        {word.slice(-1)}
        <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">*</span>
      </span>
    </span>
  );
}

export function WordsPullUp({
  text,
  className,
  showAsterisk = false,
  justify = "start"
}: WordsPullUpProps) {
  const words = text.split(" ").filter(Boolean);

  return (
    <div
      className={`text-balance inline-flex flex-wrap gap-x-[0.2em] gap-y-[0.05em] ${
        justify === "center" ? "justify-center" : "justify-start"
      }`}
    >
      {words.map((word, index) => {
        const isLast = index === words.length - 1;
        return (
          <span key={`${word}-${index}`} className="overflow-hidden">
            <motion.span
              className={className}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...transition, delay: index * 0.08 }}
            >
              {renderWord(word, isLast && showAsterisk)}
            </motion.span>
          </span>
        );
      })}
    </div>
  );
}

export function WordsPullUpMultiStyle({
  segments,
  className,
  justify = "center"
}: WordsPullUpMultiStyleProps) {
  const words = segments.flatMap((segment) =>
    segment.text
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ word, className: segment.className ?? "" }))
  );

  return (
    <div
      className={`text-balance inline-flex flex-wrap gap-x-[0.25em] gap-y-[0.12em] ${
        justify === "center" ? "justify-center" : "justify-start"
      } ${className ?? ""}`}
    >
      {words.map(({ word, className: wordClassName }, index) => (
        <span key={`${word}-${index}`} className="overflow-hidden">
          <motion.span
            className={wordClassName}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...transition, delay: index * 0.08 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
