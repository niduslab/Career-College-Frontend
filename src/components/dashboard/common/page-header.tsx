import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-[20px] lg:text-[24px] font-semibold text-(--text-title)">
          {title}
        </h1>
        <p className="text-[12px] lg:text-[14px] text-(--gray-500) mt-0.5">
          {subtitle}
        </p>
      </div>
      {action && <div className="self-start">{action}</div>}
    </div>
  );
}
