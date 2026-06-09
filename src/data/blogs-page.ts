import image1 from "@/assets/images/insights-resources/image1.webp";
import image2 from "@/assets/images/insights-resources/image2.webp";
import image3 from "@/assets/images/insights-resources/image3.webp";
import type { BlogDetailsData } from "@/types/blogs";

export interface BlogListItem {
  slug: string;
  title: string;
  author: string;
  date: string;
  image: typeof image1;
}

export const BLOGS: BlogListItem[] = [
  {
    slug: "top-10-in-demand-skills-2026",
    title: "Top 10 In-Demand Skills You Should Learn in 2026",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image1,
  },
  {
    slug: "job-winning-portfolio-30-days",
    title: "How to Build a Job-Winning Portfolio in 30 Days",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image2,
  },
  {
    slug: "complete-guide-career-in-ai",
    title: "A Complete Guide to Starting Your Career in AI",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image3,
  },
  {
    slug: "complete-guide-career-in-ai-2",
    title: "A Complete Guide to Starting Your Career in AI",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image3,
  },
  {
    slug: "top-10-in-demand-skills-2026-2",
    title: "Top 10 In-Demand Skills You Should Learn in 2026",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image1,
  },
  {
    slug: "job-winning-portfolio-30-days-2",
    title: "How to Build a Job-Winning Portfolio in 30 Days",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image2,
  },
  {
    slug: "job-winning-portfolio-30-days-3",
    title: "How to Build a Job-Winning Portfolio in 30 Days",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image2,
  },
  {
    slug: "complete-guide-career-in-ai-3",
    title: "A Complete Guide to Starting Your Career in AI",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image3,
  },
  {
    slug: "top-10-in-demand-skills-2026-3",
    title: "Top 10 In-Demand Skills You Should Learn in 2026",
    author: "Maria Lopez",
    date: "22 March 2026",
    image: image1,
  },
];

const sharedRecentPosts = [
  {
    title: "Why Pension Security Matters for a Stable...",
    date: "March 12, 2026",
    image: image2,
    href: "#",
  },
  {
    title: "Why Pension Security Matters for a Stable...",
    date: "March 12, 2026",
    image: image3,
    href: "#",
  },
  {
    title: "Why Pension Security Matters for a Stable...",
    date: "March 12, 2026",
    image: image1,
    href: "#",
  },
];

const sharedSections = [
  {
    heading: "What Sustainable Welfare Really Means",
    body: "Sustainable welfare is about designing solutions that address root causes rather than temporary symptoms. Instead of one-time support, it focuses on building skills, financial stability, and access to opportunities that continue to benefit individuals over time.",
    boldLabel:
      "At Expro Welfare Foundation, our welfare approach is centered on:",
    bullets: [
      "Empowering people through education and skill development",
      "Providing financial security through structured contribution and pension systems",
      "Promoting social inclusion and equal participation",
      "Strengthening communities through collaboration and shared responsibility",
    ],
  },
  {
    heading: "Empowerment Through Education and Skills",
    body: "Education and training are powerful tools for change. By offering skill development programs, awareness initiatives, and capacity-building opportunities, we help individuals improve their livelihoods and confidence. These programs enable people to contribute meaningfully to their families, communities, and the broader economy.",
  },
  {
    body: "When individuals gain skills and knowledge, they move from dependence to self-reliance — creating a ripple effect of positive change.",
  },
  {
    heading: "Financial Security as a Foundation for Stability",
    body: "Economic uncertainty is one of the biggest challenges facing underprivileged communities. Structured financial support and pension-based systems play a critical role in ensuring long-term stability and dignity.",
    boldLabel:
      "Expro Welfare Foundation's financial initiatives are designed to:",
    bullets: [
      "Encourage responsible savings and contributions",
      "Provide long-term pension security",
      "Support individuals during times of need",
      "Promote transparency and trust in financial processes",
    ],
  },
];

export const BLOG_DETAILS: Record<
  string,
  BlogDetailsData & { pageTitle: string; pageSubtitle: string }
> = Object.fromEntries(
  BLOGS.map((blog) => [
    blog.slug,
    {
      pageTitle: blog.title,
      pageSubtitle:
        "The job market in 2026 is evolving faster than ever due to AI, automation, remote work culture, and digital transformation. To stay competitive, professionals need to focus on future-proof skills that are not only in demand today but will continue to grow in value over the coming years.",
      heroImage: blog.image,
      heroImageAlt: blog.title,
      intro:
        "Sustainable welfare goes beyond short-term assistance — it focuses on creating systems that empower individuals and communities to become self-reliant, resilient, and future-ready. At Expro Welfare Foundation, we believe that true development happens when people are equipped with the tools, knowledge, and support they need to shape their own futures.",
      sections: sharedSections,
      recentPosts: sharedRecentPosts,
    },
  ]),
);
