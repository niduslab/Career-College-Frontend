import Image from "next/image";
import { ArrowRight, CalendarDays, Heart } from "lucide-react";
import image1 from "@/assets/images/insights-resources/image1.webp";
import image2 from "@/assets/images/insights-resources/image2.webp";
import image3 from "@/assets/images/insights-resources/image3.webp";

const BLOGS = [
  {
    title: "Top 10 In-Demand Skills You Should Learn in 2026",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image1,
  },
  {
    title: "A Complete Guide to Starting Your Career in AI",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image2,
  },
  {
    title: "How to Build a Job-Winning Portfolio in 30 Days",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image3,
  },
];

export function InsightsResources() {
  return (
    <section className="mt-10 w-full bg-(--gray-50) py-12 md:py-16 lg:mt-25 lg:py-20">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2 className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
          Insights, Tips & Career
          <br />
          Growth Resources
        </h2>

        <div className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3">
          {BLOGS.map((blog) => (
            <article
              key={blog.title}
              className="rounded-2xl border border-(--gray-200) bg-(--gray-50) p-3 md:p-4"
            >
              <div
                className={`relative overflow-hidden rounded-lg   before:absolute before:inset-0 before:z-10`}
              >
                <Image
                  src={blog.image}
                  alt={blog.title}
                  width={368}
                  height={262}
                  className="h-65.5 w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--text-white)/95 text-(--gray-500) shadow-[0_8px_20px_rgba(16,24,40,0.12)]"
                >
                  <Heart size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="sg-caption text-(--text-paragraph)">
                    By {blog.author}
                  </p>
                  <span className="inline-flex items-center gap-1 sg-caption text-(--gray-500)">
                    <CalendarDays size={12} />
                    {blog.date}
                  </span>
                </div>

                <h3 className="mt-3 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
                  {blog.title}
                </h3>

                <button
                  type="button"
                  className="group mt-4 lg:mt-6 inline-flex items-center gap-2 sg-p-small lg:sg-p-default font-semibold text-(--primary-700) transition-colors hover:text-(--primary-900)"
                >
                  Read More
                  <ArrowRight
                    size={20}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <button
            type="button"
            className="group inline-flex h-12 items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
          >
            View All Blogs
            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
