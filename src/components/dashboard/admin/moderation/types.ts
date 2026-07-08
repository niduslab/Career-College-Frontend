export type ReportStatus = "Open" | "Resolved" | "Dismissed";
export type ReportContentType = "Course Review" | "Comment" | "Forum Post" | "Message";
export type ReportReason = "Spam" | "Harassment" | "Copyright" | "Inappropriate" | "Misinformation";

export interface Report {
  id: string;
  content: string;
  contentType: ReportContentType;
  reportedUser: string;
  reporter: string;
  reason: ReportReason;
  status: ReportStatus;
  reported: string;
}
