import MessagesPage from "@/components/dashboard/instructor/messages-page";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          Messages
        </h1>
        <p className="text-[14px] text-(--gray-500) mt-0.5">
          Chat with your enrolled students.
        </p>
      </div>
      <MessagesPage />
    </div>
  );
}
