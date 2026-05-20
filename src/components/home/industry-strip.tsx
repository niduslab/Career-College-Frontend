import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import google from "@/assets/images/become-partner/logo-google.svg";
import meta from "@/assets/images/become-partner/meta-logo.svg";
import university from "@/assets/images/become-partner/university-of-michigan-logo.svg";
import penn from "@/assets/images/become-partner/penn.svg";
import imperialCollege from "@/assets/images/become-partner/imperial-college-london.svg";
import ibm from "@/assets/images/become-partner/ibm-svgrepo-com.svg";
import amazon from "@/assets/images/become-partner/layer.svg";
import university2 from "@/assets/images/become-partner/university2.webp";

const LOGOS = [
  { name: "Google", logo: google },
  { name: "Meta", logo: meta },
  { name: "University of Michigan", logo: university },
  { name: "Penn", logo: penn },
  { name: "Imperial College London", logo: imperialCollege },
  { name: "IBM", logo: ibm },
  { name: "Amazon", logo: amazon },
  { name: "University2", logo: university2 },
];

export function IndustryStrip() {
  const loopItems = [...LOGOS, ...LOGOS];

  return (
    <section className="w-full lg:mt-25 mt-10">
      <div className="px-4 md:px-6 lg:px-8">
        <h2 className="text-center text-[24px] lg:leading-12 font-semibold tracking-[-0.4px] text-(--text-title) md:text-[40px] lg:text-[40px]">
          Meet Our Partners
        </h2>

        <div className="relative mt-10 overflow-hidden md:mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 md:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 md:w-24" />

          <div className="industry-marquee">
            {loopItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-center shrink-0 px-6 md:px-10"
              >
                <Image
                  src={item.logo}
                  alt={item.name}
                  className="w-auto h-auto max-h-10 md:max-h-12 lg:max-h-14 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center md:mt-10">
        <Link
          href="/our-partners"
          className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white)"
        >
          View All Partners
          <ArrowRight size={20} strokeWidth={2.4} />
        </Link>
      </div>
    </section>
  );
}
