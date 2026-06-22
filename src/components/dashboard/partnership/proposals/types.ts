import { StaticImageData } from "next/image";

export type ProposalStatus = "Pending" | "Approved" | "Rejected" | "Draft";
export type ProposalCategory = "Enterprise" | "Academic" | "SMB" | "Non-profit" | "Government";

export interface Proposal {
  id: string;
  title: string;
  organization: string;
  avatar: StaticImageData;
  category: ProposalCategory;
  value: string;
  submittedDate: string;
  expiryDate: string;
  status: ProposalStatus;
}
