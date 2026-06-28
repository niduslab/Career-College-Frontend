import PartnershipMessagesPage from "@/components/dashboard/partnership/messages-page";
import PageHeader from "@/components/dashboard/common/page-header";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle="Chat with your partners and organizations."
      />
      <PartnershipMessagesPage />
    </div>
  );
}
