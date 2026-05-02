"use client";

import { LottieAnimation } from "./lottie-animation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full bg-(--gray-50)">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Right Side - Form */}
          <div className="w-full">{children}</div>
          {/* Left Side - Animation Only */}
          <div className="hidden lg:flex relative h-150 rounded-2xl overflow-hidden items-center justify-center">
            <div className="relative z-10">
              <LottieAnimation width={600} height={600} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
