import { StaticImageData } from "next/image";

export type PartnerStatus = "Active" | "Pending" | "Inactive";
export type PartnerType = "Enterprise" | "Academic" | "SMB" | "Non-profit";

export interface Partner {
  id: string;
  name: string;
  contact: string;
  avatar: StaticImageData;
  type: PartnerType;
  revenue: string;
  dealsClosed: number;
  joinedDate: string;
  status: PartnerStatus;
}
