"use client";

import dynamic from "next/dynamic";
import instructorAnimation from "@/assets/images/auth/education.json";
import learnerAnimation from "@/assets/images/auth/learner.json";
import instituionAnimation from "@/assets/images/auth/institution.json";
import type { UserType } from "@/types/auth";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const ANIMATION_MAP: Record<UserType, object> = {
  learner: learnerAnimation,
  instructor: instructorAnimation,
  partner_institution: instituionAnimation,
};

interface LottieAnimationProps {
  width?: number;
  height?: number;
  userType?: UserType;
}

export function LottieAnimation({
  width = 400,
  height = 400,
  userType = "learner",
}: LottieAnimationProps) {
  return (
    <div className="flex items-center justify-center">
      <Lottie
        key={userType}
        animationData={ANIMATION_MAP[userType]}
        loop
        autoplay
        style={{ width, height }}
      />
    </div>
  );
}
