import Image from "next/image";
import {
  BookOpenText,
  GraduationCap,
  UserRoundPlus,
  BadgeCheck,
} from "lucide-react";
import image from "@/assets/images/learning-journey-steps/image.webp";

const JOURNEY_STEPS = [
  {
    title: "Create Your Account",
    description: "Sign up to access your learning dashboard.",
    badge: "Step 01",
    Icon: UserRoundPlus,
  },
  {
    title: "Explore & Choose a Course",
    description: "Explore trending courses that match your career goals.",
    badge: "Step 02",
    Icon: GraduationCap,
  },
  {
    title: "Enroll & Start Learning",
    description: "Watch lessons, complete assignments, and practice.",
    badge: "Step 03",
    Icon: BookOpenText,
  },
  {
    title: "Get Certified",
    description: "Earn certificates and showcase your skills.",
    badge: "Step 04",
    Icon: BadgeCheck,
  },
];

export function LearningJourneySteps() {
  return (
    <section className=" w-full  mt-10 lg:mt-25  py-12 md:py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-310 items-stretch gap-8 px-4 md:gap-10 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="flex h-full flex-col justify-between">
          <div>
            <h2 className="text-[34px] leading-[1.08] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
              Your Learning Journey
              <br />
              Starts in Minutes
            </h2>

            <p className="mt-4 max-w-130 sg-p-small lg:sg-p-default text-(--text-paragraph)">
              Getting started with Career College is simple and seamless. Follow
              a few easy steps and begin building skills that shape your future.
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-2xl md:mt-8 lg:mt-12">
            <Image
              src={image}
              alt="Learner sitting with laptop"
              width={505}
              height={290}
              className="h-58 w-full object-cover md:h-72.5 lg:h-72.5"
            />
          </div>
        </div>

        <div className="grid content-start gap-4 md:gap-6 lg:gap-6">
          {JOURNEY_STEPS.map(({ title, description, badge, Icon }) => (
            <article
              key={badge}
              className="flex items-start justify-between  rounded-lg border-[0.5px] border-(--gray-200) bg-(--gray-50) p-4  md:p-6 lg:p-6"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <span className="inline-flex lg:h-14 h-10 lg:w-14 w-10 shrink-0 items-center justify-center rounded-lg bg-(--gray-100) text-(--primary-700)">
                  <Icon className="h-5 w-5 lg:h-8 lg:w-8" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="sg-p-big lg:sg-h6 leading-[1.2] font-semibold tracking-[-0.015em] text-(--text-title)">
                    {title}
                  </h3>
                  <p className="mt-1 sg-p-small lg:sg-p-default font-normal text-(--text-paragraph)">
                    {description}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full border-[0.5px] border-(--gray-200) bg-(--gray-100) px-3 py-1.5 sg-caption font-medium text-(--title-text)">
                {badge}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
