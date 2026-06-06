import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-[#4a5565] font-normal mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {buttonLabel && (
        <button
          onClick={onButtonClick}
          className="self-start h-12 flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] lg:text-[16px] font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {buttonLabel}
        </button>
        // <button className="self-start h-12 flex items-center gap-2 bg-(--primary-700) hover:bg-(--primary-600) text-white text-[14px] lg:text-[16px] font-semibold px-4 py-2.5 rounded-md transition-colors whitespace-nowrap">
        //   <Plus size={16} color="white" />
        //   Create New Course
        // </button>
      )}
    </div>
  );
}
