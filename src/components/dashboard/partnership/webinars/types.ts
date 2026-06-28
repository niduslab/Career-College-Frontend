import { StaticImageData } from "next/image";

export type WebinarStatus = "Live" | "Upcoming" | "Recorded" | "Cancelled";
export type WebinarTopic =
  | "Engineering"
  | "Design"
  | "Business"
  | "Data Science"
  | "Marketing"
  | "Healthcare";

export interface Webinar {
  id: string;
  title: string;
  thumbnail: StaticImageData;
  host: string;
  hostAvatar: StaticImageData;
  topic: WebinarTopic;
  date: string;
  time: string;
  duration: string;
  registered: number;
  attended: number;
  status: WebinarStatus;
}
