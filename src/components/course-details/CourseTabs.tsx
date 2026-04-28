type Tab = { label: string };

interface CourseTabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (label: string) => void;
}

export default function CourseTabs({
  tabs,
  activeTab,
  setActiveTab,
}: CourseTabsProps) {
  return (
    <nav
      className="flex lg:mt-6 mt-4  items-center gap-3 py-3 overflow-x-auto hide-scrollbar"
      aria-label="Course sections"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`
              px-5 py-2 cursor-pointer h-10  rounded-md sg-p-default  whitespace-nowrap transition-all duration-200
              ${
                isActive
                  ? "bg-(--primary-700) text-white font-semibold shadow-sm"
                  : "border border-gray-200 --text-paragraph bg-white "
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
