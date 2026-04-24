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
  ...props
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const isNearViewport = useInView(ref, { once: true, margin: "240px" });
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isNearViewport) {
      setShouldLoad(true);
    }
  }, [isNearViewport]);

  return (
    <video
      {...props}
      ref={ref}
      src={shouldLoad ? src : undefined}
      preload={shouldLoad ? preload : "none"}
      autoPlay={shouldLoad ? autoPlay : false}
      className={className}
      style={{
        backgroundColor: "#050505",
        ...props.style
      }}
    />
  );
}
