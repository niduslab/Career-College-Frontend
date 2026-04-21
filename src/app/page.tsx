import { Hero } from "@/components/home/hero";
import { CareerJourney } from "@/components/home/career-journey";
import { IndustryStrip } from "@/components/home/industry-strip";
import { PopularCourses } from "@/components/home/popular-courses";
import { TrendingCourses } from "@/components/home/trending-courses";
import { LearningJourneySteps } from "@/components/home/learning-journey-steps";
import { InstructorsSection } from "@/components/home/instructors-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <IndustryStrip />
      <PopularCourses />
      <CareerJourney />
      <TrendingCourses />
      <LearningJourneySteps />
      <InstructorsSection />
    </>
  );
}
