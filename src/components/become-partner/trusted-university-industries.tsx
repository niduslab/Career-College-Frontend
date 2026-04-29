"use client";
import Image from "next/image";
import google from "@/assets/images/become-partner/logo-google.svg";
import meta from "@/assets/images/become-partner/meta-logo.svg";
import university from "@/assets/images/become-partner/university-of-michigan-logo.svg";
import penn from "@/assets/images/become-partner/penn.svg";
import collge from "@/assets/images/become-partner/imperial-college-london.svg";
import ibm from "@/assets/images/become-partner/ibm-svgrepo-com.svg";
import amazon from "@/assets/images/become-partner/layer.svg";

// Logos with individual dimensions
const LOGOS = [
  { name: "Google", logo: google, width: 350, height: 245 },
  { name: "Meta", logo: meta, width: 150, height: 30 },
  { name: "University of Michigan", logo: university, width: 150, height: 30 },
  { name: "Penn", logo: penn, width: 150, height: 48 },
  { name: "Imperial College London", logo: collge, width: 168, height: 44 },
  { name: "IBM", logo: ibm, width: 150, height: 60 },
  { name: "Amazon", logo: amazon, width: 140, height: 42 },
];

export default function TrustedUniversityIndustries() {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] font-semibold tracking-[-0.02em] text-gray-900">
              Trusted by more than
              <br />
              500+ Universities &
              <br />
              Industries
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              Join a global network of leading educational institutions and
              industry partners who trust Career College to deliver exceptional
              learning experiences and drive meaningful impact.
            </p>
          </div>

          {/* Right Grid */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 md:gap-5 lg:gap-6">
            {LOGOS.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 transition-all duration-300 h-24"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={140}
                  height={60}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
