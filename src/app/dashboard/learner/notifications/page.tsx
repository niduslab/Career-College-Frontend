import { NotificationsListPage } from "@/components/dashboard/common/notifications-list-page";

export default function Page() {
  return (
    <NotificationsListPage
      coursePlayerBase="/dashboard/learner/course-player"
      messagesBase="/dashboard/learner/messages"
    />
  );
}
