import { RichText } from "@/components/common/rich-text";

interface CourseRequirementsProps {
  prerequisites: string;
}

export default function CourseRequirements({
  prerequisites,
}: CourseRequirementsProps) {
  if (!prerequisites.trim()) return null;

  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        Course Requirements
      </h2>

      <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
        <RichText
          html={prerequisites}
          className="sg-p-small --text-paragraph leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        />
      </div>
    </div>
  );
}
