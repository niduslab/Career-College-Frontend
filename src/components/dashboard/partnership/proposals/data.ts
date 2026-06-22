import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import avatar1 from "@/assets/images/instructors/instructor1.webp";
import avatar2 from "@/assets/images/instructors/instructor2.webp";
import avatar3 from "@/assets/images/instructors/instructor3.webp";
import avatar4 from "@/assets/images/instructors/instructor4.webp";
import avatar5 from "@/assets/images/instructors/instructor5.webp";
import avatar6 from "@/assets/images/instructors/instructor6.webp";
import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import { Proposal, ProposalCategory, ProposalStatus } from "./types";

export const PROPOSALS: Proposal[] = [
  {
    id: "pr1",
    title: "Enterprise Training Program 2026",
    organization: "TechCorp International",
    avatar: avatar1,
    category: "Enterprise",
    value: "$18,500",
    submittedDate: "Jun 1, 2026",
    expiryDate: "Jul 1, 2026",
    status: "Approved",
  },
  {
    id: "pr2",
    title: "Academic Certification Partnership",
    organization: "Greenfield University",
    avatar: avatar2,
    category: "Academic",
    value: "$7,200",
    submittedDate: "Jun 5, 2026",
    expiryDate: "Jul 5, 2026",
    status: "Pending",
  },
  {
    id: "pr3",
    title: "SMB Skills Accelerator Bundle",
    organization: "Apex Solutions",
    avatar: avatar3,
    category: "SMB",
    value: "$3,400",
    submittedDate: "May 28, 2026",
    expiryDate: "Jun 28, 2026",
    status: "Rejected",
  },
  {
    id: "pr4",
    title: "FinTech Leadership Development",
    organization: "NovaTech Partners",
    avatar: avatar4,
    category: "Enterprise",
    value: "$12,000",
    submittedDate: "Jun 10, 2026",
    expiryDate: "Jul 10, 2026",
    status: "Pending",
  },
  {
    id: "pr5",
    title: "Community Digital Skills Initiative",
    organization: "Bright Future NGO",
    avatar: avatar5,
    category: "Non-profit",
    value: "$1,800",
    submittedDate: "Jun 3, 2026",
    expiryDate: "Jul 3, 2026",
    status: "Approved",
  },
  {
    id: "pr6",
    title: "Global Expansion Partnership Offer",
    organization: "Orion Enterprises",
    avatar: avatar6,
    category: "Enterprise",
    value: "$22,000",
    submittedDate: "Jun 12, 2026",
    expiryDate: "Jul 12, 2026",
    status: "Draft",
  },
  {
    id: "pr7",
    title: "Healthcare e-Learning Rollout",
    organization: "MedBridge Healthcare",
    avatar: image1,
    category: "SMB",
    value: "$5,600",
    submittedDate: "Jun 8, 2026",
    expiryDate: "Jul 8, 2026",
    status: "Pending",
  },
  {
    id: "pr8",
    title: "Public Sector Upskilling Program",
    organization: "CivicNet Government",
    avatar: image2,
    category: "Government",
    value: "$9,100",
    submittedDate: "Jun 15, 2026",
    expiryDate: "Jul 15, 2026",
    status: "Draft",
  },
];

export const STATS = [
  { label: "Total Proposals", value: "34", change: "+5 this month", icon: FileText },
  { label: "Approved", value: "18", change: "53% approval rate", icon: CheckCircle },
  { label: "Pending Review", value: "9", change: "Avg. 3 day response", icon: Clock },
  { label: "Rejected", value: "7", change: "21% rejection rate", icon: XCircle },
];

export const RECENT_ACTIVITY = [
  { label: "Enterprise Training Program 2026", org: "TechCorp International", action: "Approved", color: "text-green-600 bg-green-50", time: "2h ago" },
  { label: "SMB Skills Accelerator Bundle", org: "Apex Solutions", action: "Rejected", color: "text-red-500 bg-red-50", time: "5h ago" },
  { label: "FinTech Leadership Development", org: "NovaTech Partners", action: "Submitted", color: "text-blue-600 bg-blue-50", time: "1d ago" },
  { label: "Community Digital Skills Initiative", org: "Bright Future NGO", action: "Approved", color: "text-green-600 bg-green-50", time: "2d ago" },
  { label: "Healthcare e-Learning Rollout", org: "MedBridge Healthcare", action: "Submitted", color: "text-blue-600 bg-blue-50", time: "3d ago" },
];

export const TIPS = [
  { color: "text-blue-500", text: "Proposals with clear ROI breakdowns have 60% higher approval rates." },
  { color: "text-green-500", text: "Follow up on Pending proposals after 3 business days." },
  { color: "text-orange-500", text: "Tailor each proposal to the partner's specific industry needs." },
];

export const CATEGORIES: ("All" | ProposalCategory)[] = ["All", "Enterprise", "Academic", "SMB", "Non-profit", "Government"];
export const STATUSES: ("All" | ProposalStatus)[] = ["All", "Approved", "Pending", "Rejected", "Draft"];
