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
    <div className="flex items-center gap-1 flex-wrap py-3 px-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
