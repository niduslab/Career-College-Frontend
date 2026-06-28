import BlogsPage from "@/components/dashboard/instructor/blogs-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Blogs"
        subtitle="Manage your blog posts and grow your audience."
      />
      <BlogsPage />
    </div>
  );
}
