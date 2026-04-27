type Tab = { label: string };

interface CourseTabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (label: string) => void;
}

export default function CourseTabs({ tabs, activeTab, setActiveTab }: CourseTabsProps) {
  return (
    <nav className="flex items-center gap-2 py-3 overflow-x-auto hide-scrollbar" aria-label="Course sections">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
              ${isActive
                ? "bg-purple-600 text-white shadow-sm"
                : "border border-gray-300 text-gray-700 bg-white hover:border-purple-400 hover:text-purple-600"
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
