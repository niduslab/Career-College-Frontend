import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Heart,
  UsersRound,
} from "lucide-react";
import image1 from "@/assets/images/popular-courses/image6.webp";

const WEBINARS = [
  {
    title: "Learn the fundamentals of artificial intelligence",
    speaker: "Farhan Ahmed",
    date: "15 April 2026",
    time: "8.00 PM",
    joined: "19 Students Joined",
    daysLeft: "10 Days Left",
  },
  {
    title: "Learn the fundamentals of artificial intelligence",
    speaker: "Farhan Ahmed",
    date: "15 April 2026",
    time: "8.00 PM",
    joined: "19 Students Joined",
    daysLeft: "10 Days Left",
  },
  {
    title: "Learn the fundamentals of artificial intelligence",
    speaker: "Farhan Ahmed",
    date: "15 April 2026",
    time: "8.00 PM",
    joined: "19 Students Joined",
    daysLeft: "10 Days Left",
  },
];

export function UpcomingWebinars() {
  return (
    <section className="w-full  mt-10 lg:mt-25 bg-(--gray-50) py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <h2 className="text-center text-[24px] leading-[1.12] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
          Free Upcoming Webinar
          <br />
          In Career College
        </h2>

        <div className="mt-10 grid lg:gap-5 gap-4 md:mt-12 lg:mt-15 md:grid-cols-2 lg:grid-cols-3">
          {WEBINARS.map((webinar, index) => (
            <article
              key={`${webinar.title}-${index}`}
              className="rounded-2xl  border border-(--gray-200) bg-(--text-white) p-4"
            >
              <div
                className={`relative overflow-hidden rounded-lg   before:absolute before:inset-0 before:z-10`}
              >
                <Image
                  src={image1}
                  alt={webinar.title}
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
                <span className="absolute bottom-4 border-gray-200 text-[12px] h-7 left-3 inline-flex items-center gap-1 rounded-full bg-(--primary-100) px-2 py-2.5 sg-caption font-medium text-(--text-title)">
                  <CalendarDays size={14} color="#100d14" />
                  {webinar.daysLeft}
                </span>
              </div>

              <div className="mt-3 px-1">
                <h3 className="line-clamp-2 sg-p-big leading-[1.22] font-semibold tracking-[-0.012em] text-(--text-title)">
                  {webinar.title}
                </h3>

                <p className="mt-2 sg-p-small font-normal text-(--text-paragraph)">
                  Speaker:{" "}
                  <span className="text-(--text-title)">{webinar.speaker}</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2 border-b border-dashed border-(--gray-200) pb-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <CalendarDays size={14} />
                    {webinar.date}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <Clock3 size={14} />
                    {webinar.time}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-(--gray-200) px-2 py-1 sg-caption text-(--gray-500)">
                    <UsersRound size={14} />
                    {webinar.joined}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-4 h-10 w-full rounded-md border border-(--primary-700) bg-(--text-white) sg-p-default font-semibold text-(--text-title) cursor-pointer transition-all duration-300 ease-out hover:-translate-y-px hover:bg-(--primary-700) hover:text-(--text-white) active:translate-y-0 active:scale-[0.99]"
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <button
            type="button"
            className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
          >
            View All Webinars
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
