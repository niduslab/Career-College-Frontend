import { Hero } from "@/components/home/hero";
import { CareerJourney } from "@/components/home/career-journey";
import { IndustryStrip } from "@/components/home/industry-strip";
import { PopularCourses } from "@/components/home/popular-courses";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <IndustryStrip />
      <PopularCourses />
      <CareerJourney />
    </>
  );
}
