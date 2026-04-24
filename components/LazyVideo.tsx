"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type LazyVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
};

export default function LazyVideo({
  src,
  preload = "metadata",
  autoPlay,
  className,
  onCanPlay,
  onLoadedData,
  ...props
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const isNearViewport = useInView(ref, { once: true, margin: "420px" });
  const isVisible = useInView(ref, { margin: "80px" });
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isNearViewport) {
      setShouldLoad(true);
    }
  }, [isNearViewport]);

  useEffect(() => {
    const video = ref.current;

    if (!video || !shouldLoad || !autoPlay) {
      return;
    }

    if (isVisible) {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [autoPlay, isVisible, shouldLoad]);

  return (
    <video
      {...props}
      ref={ref}
      src={shouldLoad ? src : undefined}
      preload={shouldLoad ? preload : "none"}
      autoPlay={shouldLoad ? autoPlay : false}
      onLoadedData={(event) => {
        setIsReady(true);
        onLoadedData?.(event);
      }}
      onCanPlay={(event) => {
        setIsReady(true);
        onCanPlay?.(event);
      }}
      disablePictureInPicture
      className={`${className ?? ""} transition-opacity duration-700 ease-out ${isReady ? "opacity-100" : "opacity-0"}`}
      style={{
        backgroundColor: "#050505",
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.14), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
        ...props.style
      }}
    />
  );
}
