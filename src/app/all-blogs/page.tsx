import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { AllBlogsGrid } from "@/components/all-blogs/all-blogs-grid";
import { CareerJourney } from "@/components/common/career-journey";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Insights That Inspire Growth & Innovation"
        subtitle="Welcome to our blog — a space where creativity meets knowledge. Here, we share thoughtful insights, design trends, development strategies, and real-world experiences that help designers, developers, entrepreneurs, and innovators stay ahead in a fastchanging digital landscape."
        items={[
          { label: "Home", href: "/" },
          { label: "All Blogs", active: true },
        ]}
      />
      <AllBlogsGrid />
      <DreamCareerCta />
    </div>
  );
}
