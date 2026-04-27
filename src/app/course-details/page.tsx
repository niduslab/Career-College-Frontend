"use client";
import { useState } from "react";
import { User, Globe, Users, Star } from "lucide-react";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { GradientBackground } from "@/components/common/gradient-background";
import CourseInformation from "@/components/course-details/CourseInformation";
import CourseTabs from "@/components/course-details/CourseTabs";
import CourseInstructor from "@/components/course-details/CourseInstructor";
import WhatYouWillLearn from "@/components/course-details/WhatYouWillLearn";
import CourseContent from "@/components/course-details/CourseContent";
import Requirements from "@/components/course-details/Requirements";
import Description from "@/components/course-details/Description";

const TABS = [
  { label: "Course Instructor" },
  { label: "What You Will Learn" },
  { label: "Course Content" },
  { label: "Requirements" },
  { label: "Description" },
];

export default function CourseDetailsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].label);

  const handleTabClick = (tabLabel: string) => {
    setActiveTab(tabLabel);
    const element = document.getElementById(`tab-${tabLabel}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero / Breadcrumb Section ── */}
      <section className="relative w-full bg-(--gray-950) overflow-visible">
        <GradientBackground />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Breadcrumb & Title */}
            <div className="flex-1 min-w-0 max-w-4xl">
              <Breadcrumb
                title="Complete UI/UX Design Course 2026: Figma + Real Project"
                subtitle="Use Figma to get a job in UI Design, User Interface, User Experience design, UX Design & Web Design"
                items={[
                  { label: "Home", href: "/" },
                  { label: "Design", href: "/design" },
                  { label: "User Experience Design", href: "/design/ux" },
                  { label: "Figma UI/UX Design", active: true },
                ]}
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-(--gray-300) mt-6">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>Instructor</span>
                    <a
                      href="#"
                      className="text-(--primary-200) hover:underline font-medium"
                    >
                      Daniel Walter Scott
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe size={14} />
                    <span>English</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>Enrolled 87,398</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={14} />
                    <span>4.7 (46,245 Reviews)</span>
                  </div>
                </div>
              </Breadcrumb>
            </div>
          </div>
        </div>

        {/* Right: Course Information Card - Positioned to overlap */}
        <div className="absolute right-4 md:right-6 lg:right-[250px] bottom-0 transform translate-y-1/2 w-full lg:w-[340px] z-20 hidden lg:block -mt-12">
          <CourseInformation />
        </div>
      </section>

      {/* ── Main Content Section ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 lg:pt-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Tabs + Content */}
          <div className="flex-1 min-w-0 max-w-2xl">
            {/* Sticky Tabs Bar */}
            <div className="sticky top-0 z-40 bg-white -mx-4 md:-mx-6 lg:mx-0 px-4 md:px-6 lg:px-0 shadow-sm">
              <CourseTabs
                activeTab={activeTab}
                setActiveTab={handleTabClick}
                tabs={TABS}
              />
            </div>

            {/* Tab Sections */}
            <div className="mt-8 space-y-10">
              <section id="tab-Course Instructor">
                <CourseInstructor />
              </section>
              <section id="tab-What You Will Learn">
                <WhatYouWillLearn />
              </section>
              <section id="tab-Course Content">
                <CourseContent />
              </section>
              <section id="tab-Requirements">
                <Requirements />
              </section>
              <section id="tab-Description">
                <Description />
              </section>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
}
