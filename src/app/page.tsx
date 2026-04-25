import { Hero } from "@/components/home/hero";
import { CareerJourney } from "@/components/home/career-journey";
import { IndustryStrip } from "@/components/home/industry-strip";
import { PopularCourses } from "@/components/home/popular-courses";
import { TrendingCourses } from "@/components/home/trending-courses";
import { LearningJourneySteps } from "@/components/home/learning-journey-steps";
import { Testimonials } from "@/components/home/testimonials";
import { InstructorsSection } from "@/components/home/instructors-section";
import { UpcomingWebinars } from "@/components/home/upcoming-webinars";
import { FaqSection } from "@/components/home/faq-section";
import { InsightsResources } from "@/components/home/insights-resources";
import { DreamCareerCta } from "@/components/home/dream-career-cta";

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
      <Testimonials />
      <UpcomingWebinars />
      <FaqSection />
      <InsightsResources />
      <DreamCareerCta />
    </>
  );
}
