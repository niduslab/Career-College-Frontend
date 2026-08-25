import { RichText } from "@/components/common/rich-text";

interface WhatYouWillLearnProps {
  learningObjectives: string;
}

export default function WhatYouWillLearn({
  learningObjectives,
}: WhatYouWillLearnProps) {
  if (!learningObjectives.trim()) return null;

  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="sg-h5 font-semibold --title-text mb-4">
        What You Will Learn
      </h2>

      <div className="rounded-xl border border-gray-200 p-6 shadow-sm">
        <RichText
          html={learningObjectives}
          className="sg-p-small --text-paragraph leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        />
      </div>
    </div>
  );
}
