import { Hero } from "@/components/home/hero";
import { IndustryStrip } from "@/components/home/industry-strip";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <IndustryStrip />
    </>
  );
}
