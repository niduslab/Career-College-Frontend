import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import image from "@/assets/images/become-partner/image.webp";
const BENEFITS = [
  "Connect with global learners and elevate your institution worldwide.",
  "Convert degrees into modern, scalable learning experiences.",
  "Track data to optimize learning performance",
];

export default function ExpandEducation() {
  return (
    <section className="w-full  lg:mt-25 mt-10 ">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-[32px] md:text-[40px] lg:text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] --text-title">
              Expand Education Beyond Borders Partner for Global Impact
            </h2>

            <p className="mt-4 sg-p-default --text-paragraph font-normal leading-relaxed">
              With Career College, you can extend your academic programs beyond
              physical campuses, unlock new revenue streams, and empower a
              diverse global audience through flexible, high-quality digital
              education.
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
                Become an University Partner
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 w-full h-64 md:h-100 xl:h-133 xl:w-137.5">
              <Image
                src={image}
                alt="Education partnership collaboration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
