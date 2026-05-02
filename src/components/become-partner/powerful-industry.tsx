import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import image from "@/assets/images/become-partner/image2.webp";
const BENEFITS = [
  "Showcase your company to a growing global audience of motivated learners.",
  "Increase awareness and adoption through educational integration.",
  "Deliver your expertise to learners, enterprises, and institutions worldwide.",
];

export default function PowerfulIndustry() {
  return (
    <section className="w-full  lg:mt-25 lg:mb-25 mt-10 mb-10">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 w-full h-64 md:h-100 xl:h-133 xl:w-137.5">
              <Image
                src={image}
                alt="Education partnership collaboration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 550px"
                priority
              />
            </div>
          </div>
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-[32px] md:text-[40px] lg:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] --text-title">
              Build Powerful Industry Connections That Drive Real Career
              Outcomes
            </h2>

            <p className="mt-4 sg-p-default --text-paragraph font-normal leading-relaxed">
              Partner with Career College to connect with skilled talent,
              strengthen your brand presence, and play a key role in shaping the
              future workforce. Our industry partnerships are designed to bridge
              the gap between learning and real-world careers through practical
              training and meaningful collaboration.
            </p>

            {/* Benefits List */}
            <ul className="space-y-4.5 mt-6">
              {BENEFITS.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle
                    size={16}
                    className="text-(--primary-700) shrink-0 mt-0.5"
                  />
                  <span className="sg-p-default --text-paragraph font-normal leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-8 lg:mt-10">
              <button className="group cursor-pointer inline-flex sg-p-default  items-center gap-2 bg-(--primary-700)  h-12 text-white px-6 py-3 rounded-md font-semibold transition-all duration-300  hover:-translate-y-0.5 active:translate-y-0">
                Become an Industry Partner
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
