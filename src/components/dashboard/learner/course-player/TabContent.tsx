import { Clock, File, FileText, Star, Target, Trophy } from "lucide-react";
import { ACTIVE_LESSON } from "./data";
import type { TabKey } from "./types";

const RESOURCES = [
  "XGBoost Paper Summary.pdf",
  "Ensemble Methods Cheatsheet.pdf",
  "Practice Dataset.csv",
];

const TRANSCRIPT = [
  {
    time: "0:00",
    text: "Welcome to the lesson on Gradient Boosting and XGBoost.",
  },
  {
    time: "0:42",
    text: "In this module we'll explore how boosting differs from bagging.",
  },
  {
    time: "2:15",
    text: "Gradient boosting works by fitting weak learners sequentially to residual errors.",
  },
  {
    time: "4:30",
    text: "XGBoost extends this by adding L1 and L2 regularization terms.",
  },
  {
    time: "6:24",
    text: "Now let's look at how tree depth and learning rate affect your model.",
  },
];

const COMMENTS = [
  {
    name: "Maria G.",
    time: "2h ago",
    text: "Can someone explain why a lower learning rate usually leads to better generalization?",
  },
  {
    name: "James K.",
    time: "5h ago",
    text: "The part about handling missing values in XGBoost was really eye-opening!",
  },
];

const REVIEWS = [
  {
    name: "Ayesha M.",
    rating: 5,
    text: "Excellent explanation of XGBoost internals. The regularization part was crystal clear.",
  },
  {
    name: "Sam R.",
    rating: 4,
    text: "Very good content. Would love more visualizations of the residual fitting process.",
  },
];

const META_CARDS = [
  {
    icon: Target,
    label: "Learning objectives",
    value: ACTIVE_LESSON.objectives,
  },
  { icon: Clock, label: "Duration", value: ACTIVE_LESSON.duration },
  {
    icon: FileText,
    label: "Resources",
    value: `${ACTIVE_LESSON.resources} files`,
  },
  { icon: Trophy, label: "XP reward", value: ACTIVE_LESSON.xp },
];

export default function TabContent({ activeTab }: { activeTab: TabKey }) {
  return (
    <div className="px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
      {activeTab === "overview" && (
        <div className="max-w-3xl">
          <h2 className="text-[20px] lg:text-[24px] font-bold text-(--text-title) mb-2 sm:mb-3">
            {ACTIVE_LESSON.title}
          </h2>
          <p className="text-[12px] lg:text-[14px] text-(--gray-500) leading-relaxed mb-5 sm:mb-6">
            {ACTIVE_LESSON.description}
          </p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            {META_CARDS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="flex items-center gap-2 sm:gap-3 bg-(--gray-50) rounded-xl px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-(--primary-50) flex items-center justify-center shrink-0">
                    <Icon className=" w-4 sm:h-4 text-(--primary-600)" />
                  </div>
                  <div className="min-w-0">
                    <p className=" text-[12px] text-(--gray-400) font-medium truncate">
                      {m.label}
                    </p>
                    <p className="text-[14px] font-semibold text-(--text-title)">
                      {m.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div className="max-w-2xl space-y-3">
          <h3 className="text-[16px] font-semibold text-(--text-title) mb-4">
            Lesson Resources
          </h3>
          {RESOURCES.map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 p-3 border border-(--gray-200)  rounded-xl hover:bg-(--gray-50) transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-(--primary-50) flex items-center justify-center shrink-0">
                <File className="w-4 h-4 text-(--primary-600)" />
              </div>
              <span className=" text-[14px] text-(--text-title) font-medium">
                {f}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="max-w-2xl space-y-4">
          <h3 className=" text-[16px] font-semibold text-(--text-title) mb-4">
            Transcript
          </h3>
          {TRANSCRIPT.map((t) => (
            <div key={t.time} className="flex gap-3 sm:gap-4">
              <span className="text-[12px] text-(--primary-600) font-semibold shrink-0 mt-0.5 w-9 sm:w-10">
                {t.time}
              </span>
              <p className="text-[12px] lg:text-[14px] text-(--gray-500) leading-relaxed">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "discussion" && (
        <div className="max-w-2xl">
          <h3 className="text-[16px] font-semibold text-(--text-title) mb-4">
            Discussion
          </h3>
          <div className="space-y-4">
            {COMMENTS.map((c) => (
              <div key={c.name} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-(--primary-100) flex items-center justify-center shrink-0 text-[12px] font-bold text-(--primary-600)">
                  {c.name[0]}
                </div>
                <div className="flex-1 bg-(--gray-50) rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-(--text-title)">
                      {c.name}
                    </span>
                    <span className="text-[12px]  text-(--gray-400)">
                      {c.time}
                    </span>
                  </div>
                  <p className="text-[12px] lg:text-[14px] text-(--gray-500)">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="max-w-2xl">
          <h3 className="text-[16px] font-semibold text-(--text-title) mb-4">
            Reviews
          </h3>
          <div className="space-y-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-[12px] font-bold text-emerald-600">
                  {r.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-(--text-title)">
                      {r.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-amber-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[12px] lg:text-[14px] text-(--gray-500)">
                    {r.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
