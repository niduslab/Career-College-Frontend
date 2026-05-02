"use client";
import Image from "next/image";
import learnersIcon from "@/assets/images/unlock-global-learning/student.svg";
import institutionsIcon from "@/assets/images/unlock-global-learning/management.svg";
import educatorIcon from "@/assets/images/unlock-global-learning/management.svg";

const STATS = [
  {
    number: "500k+",
    label: "Learners",
    description: "Reaching a global audience of motivated learners",
    icon: learnersIcon,
  },
  {
    number: "120+",
    label: "Institutions",
    description: "Reaching a global audience of motivated learners",
    icon: institutionsIcon,
  },
  {
    number: "350+",
    label: "Educator Partners",
    description: "Reaching a global audience of motivated learners",
    icon: educatorIcon,
  },
];

export default function UnlockGlobalLearning() {
  return (
    <section className="w-full lg:mt-25 mt-10 py-12 md:py-16 lg:py-20 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-15 lg:mb-15">
          <h2 className="text-[32px]  md:text-[40px] lg:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] --text-title mb-4">
            Unlock Global Learning
            <br />
            Opportunities
          </h2>
          <p className="sg-p-default --text-pargraph font-normal  max-w-2xl mx-auto">
            Partner with Career College to reach a global learning network and
            scale your impact.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {STATS.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl bg-(--primary-50) p-6    flex flex-col justify-between relative min-h-73"
            >
              {/* Content */}
              <div>
                {/* Number and Label - Inline */}
                <div className="flex items-baseline gap-2 mb-3">
                  <h3 className="sg-p-big lg:sg-h5 font-semibold --text-title">
                    {stat.number} {stat.label}
                  </h3>
                </div>

                {/* Description */}
                <p className="sg-p-default max-w-58.5 font-normal --text-paragraph leading-relaxed">
                  {stat.description}
                </p>
              </div>

              {/* Icon - Right Bottom */}
              {stat.icon && (
                <div className="absolute bottom-6 right-6 w-20 h-20">
                  <Image
                    src={stat.icon}
                    alt={stat.label}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
