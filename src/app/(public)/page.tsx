import { Hero } from "@/components/home/hero";
import { CareerJourney } from "@/components/common/career-journey";
import { IndustryStrip } from "@/components/home/industry-strip";
import { PopularCourses } from "@/components/home/popular-courses";
import { TrendingCourses } from "@/components/home/trending-courses";
import { LearningJourneySteps } from "@/components/home/learning-journey-steps";
import { Testimonials } from "@/components/home/testimonials";
import { InstructorsSection } from "@/components/home/instructors-section";
import { FavoriteMentors } from "@/components/home/favorite-mentors";
import { PlatformFeatures } from "@/components/home/platform-features";
import { UpcomingWebinars } from "@/components/home/upcoming-webinars";
import { FaqSection } from "@/components/common/faq-section";
import { InsightsResources } from "@/components/home/insights-resources";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <IndustryStrip />
      <PopularCourses />
      <CareerJourney />
      <TrendingCourses />
      {/* <PlatformFeatures /> */}
      <LearningJourneySteps />
      <InstructorsSection />
      {/* <FavoriteMentors /> */}
      <Testimonials />
      <UpcomingWebinars />
      <FaqSection />
      <InsightsResources />
      <DreamCareerCta />
    </>
  );
}
