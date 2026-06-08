import { notFound } from "next/navigation";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { BlogDetailsContent } from "@/components/blog-details/blog-details-content";
import { BLOG_DETAILS, BLOGS } from "@/data/blogs-page";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOGS.map((blog) => ({ slug: blog.slug }));
}

export default async function BlogDetailsPage({
  params,
}: BlogDetailsPageProps) {
  const { slug } = await params;
  const data = BLOG_DETAILS[slug];

  if (!data) notFound();

  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title={data.pageTitle}
        subtitle={data.pageSubtitle}
        items={[
          { label: "Home", href: "/" },
          { label: "All Blogs", href: "/all-blogs" },
          { label: "Blog Details", active: true },
        ]}
      />
      <BlogDetailsContent data={data} />
      <div>
        <DreamCareerCta />
      </div>
    </div>
  );
}
