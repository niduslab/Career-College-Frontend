import { redirect } from "next/navigation";
import { BLOGS } from "@/data/blogs";

export default function BlogDetailsIndexPage() {
  redirect(`/blog-details/${BLOGS[0].slug}`);
}
