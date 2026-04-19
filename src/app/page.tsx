import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-72px)] bg-(--gray-50) px-4 py-16 md:px-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-(--gray-200) bg-(--text-white) p-10 shadow-[0_20px_60px_rgba(16,24,40,0.08)] md:p-14">
          <p className="mb-4 inline-flex rounded-full bg-(--primary-50) px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-(--primary-700)">
            Career-focused learning
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-(--text-title) md:text-5xl">
            Build in-demand skills with expert-led programs and guided
            mentorship.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-(--text-paragraph) md:text-lg">
            Explore practical courses, shape your roadmap, and join a community
            designed to accelerate your career journey.
          </p>
        </section>
      </main>
    </>
  );
}
