"use client";

import dynamic from "next/dynamic";
import educationAnimation from "@/assets/images/auth/education.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieAnimationProps {
  width?: number;
  height?: number;
}

export function LottieAnimation({ width = 400, height = 400 }: LottieAnimationProps) {
  return (
    <div className="flex items-center justify-center">
      <Lottie 
        animationData={educationAnimation} 
        loop 
        autoplay
        style={{ width, height }}
      />
    </div>
  );
}
