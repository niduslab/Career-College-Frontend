import { StaticImageData } from "next/image";

export interface BlogContentSection {
  heading?: string;
  body?: string;
  boldLabel?: string;
  bullets?: string[];
}

export interface RecentPost {
  title: string;
  date: string;
  image: StaticImageData | string;
  href?: string;
}

export interface BlogDetailsData {
  heroImage: StaticImageData | string;
  heroImageAlt: string;
  intro: string;
  sections: BlogContentSection[];
  recentPosts: RecentPost[];
}
