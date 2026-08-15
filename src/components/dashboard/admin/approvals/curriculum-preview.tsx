"use client";

import type { ReactNode } from "react";
import { Loader2, PlayCircle, FileText, HelpCircle, ClipboardList, Code2, Check, ChevronRight } from "lucide-react";
import { useCourseAdminCurriculum } from "@/hooks/use-admin-courses";
import { hlsAssetUrl } from "@/lib/course-api";
import VideoPlayer from "@/components/dashboard/learner/course-player/VideoPlayer";
import { RichHtml } from "../../settings-shared/ui";
import type {
  AdminSectionContent,
  AdminLecture,
  AdminQuiz,
  AdminCodingExercise,
  AdminAssignment,
} from "@/lib/admin-courses-api";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "emerald" | "amber" | "red" }) {
  const toneClass = {
    gray: "bg-(--gray-100) text-(--gray-600)",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
  }[tone];
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${toneClass}`}>
      {children}
    </span>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  if (!code.trim()) return null;
  return (
    <div>
      <p className="text-[12px] font-semibold text-(--gray-500) mb-1">{label}</p>
      <pre className="text-[12px] bg-(--gray-50) border border-(--gray-200) rounded-lg p-3 overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function LectureBody({ lecture }: { lecture: AdminLecture }) {
  return (
    <div className="space-y-2.5 pl-6">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge>{lecture.lecture_type === "video" ? "Video" : "Article"}</Badge>
        {lecture.is_preview && <Badge tone="emerald">Preview</Badge>}
        {lecture.lecture_type === "video" && (
          <Badge tone={lecture.active_video_asset?.status === "ready" ? "emerald" : "amber"}>
            {lecture.active_video_asset?.status ?? "no video"}
          </Badge>
        )}
        {lecture.lecture_type === "video" && lecture.active_video_asset?.duration_seconds != null && (
          <Badge>{formatDuration(lecture.active_video_asset.duration_seconds)}</Badge>
        )}
      </div>
      {lecture.transcoding_error && (
        <p className="text-[12px] text-red-600">Transcoding error: {lecture.transcoding_error}</p>
      )}
      {lecture.lecture_type === "article" && (
        <div className="max-h-48 overflow-y-auto">
          <RichHtml html={lecture.article_content} emptyText="No content." />
        </div>
      )}
      {lecture.lecture_type === "video" &&
        (lecture.stream_master_playlist ? (
          <div className="rounded-lg overflow-hidden max-w-md">
            <VideoPlayer
              moduleLabel={lecture.title}
              src={hlsAssetUrl(lecture.stream_master_playlist)}
            />
          </div>
        ) : (
          <p className="text-[12px] text-(--gray-400)">
            Video not ready to play yet ({lecture.active_video_asset?.status ?? "no video uploaded"}).
          </p>
        ))}
    </div>
  );
}

function QuizBody({ quiz }: { quiz: AdminQuiz }) {
  if (quiz.questions.length === 0) {
    return <p className="text-[12px] text-(--gray-400) pl-6">No questions added.</p>;
  }
  return (
    <div className="space-y-3 pl-6">
      {quiz.questions.map((q, i) => (
        <div key={q.id}>
          <p className="text-[13px] font-medium text-(--text-title)">
            {i + 1}. {q.question_text}
          </p>
          <ul className="mt-1 space-y-0.5">
            {q.answers.map((a) => (
              <li
                key={a.id}
                className={`text-[12px] flex items-center gap-1.5 ${a.is_correct ? "text-emerald-700 font-medium" : "text-(--gray-500)"}`}
              >
                {a.is_correct ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                {a.answer_text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CodingBody({ exercise }: { exercise: AdminCodingExercise }) {
  return (
    <div className="space-y-3 pl-6">
      <div className="flex items-center gap-2">
        <Badge>{exercise.language}</Badge>
        <Badge>{exercise.time_limit_ms}ms limit</Badge>
      </div>
      {exercise.description && (
        <p className="text-[13px] text-(--gray-600) whitespace-pre-wrap">{exercise.description}</p>
      )}
      <CodeBlock label="Starter Code" code={exercise.starter_code} />
      <CodeBlock label="Solution Code" code={exercise.solution_code} />
      <CodeBlock label="Evaluation Script" code={exercise.evaluation_script} />
    </div>
  );
}

function AssignmentBody({ assignment }: { assignment: AdminAssignment }) {
  return (
    <div className="space-y-3 pl-6">
      <div className="flex items-center gap-2">
        <Badge>Total {assignment.total_score}</Badge>
        <Badge>Pass {assignment.passing_score}</Badge>
        <Badge tone={assignment.max_score === assignment.total_score ? "emerald" : "amber"}>
          Allocated {assignment.max_score}
        </Badge>
      </div>
      {assignment.instructions && (
        <p className="text-[13px] text-(--gray-600) whitespace-pre-wrap">{assignment.instructions}</p>
      )}
      {assignment.questions.length === 0 ? (
        <p className="text-[12px] text-(--gray-400)">No questions added.</p>
      ) : (
        <div className="space-y-3">
          {assignment.questions.map((q, i) => (
            <div key={q.id} className="border border-(--gray-200) rounded-lg p-2.5">
              <p className="text-[13px] font-medium text-(--text-title)">
                {i + 1}. {q.question_text} <span className="text-(--gray-400) font-normal">({q.points} pts)</span>
              </p>
              {q.hint && <p className="text-[12px] text-(--gray-500) mt-1">Hint: {q.hint}</p>}
              {q.model_answer && (
                <p className="text-[12px] text-(--gray-600) mt-1">
                  <span className="font-medium">Model answer:</span> {q.model_answer}
                </p>
              )}
              {Array.isArray(q.rubric) && q.rubric.length > 0 && (
                <p className="text-[11px] text-(--gray-400) mt-1">
                  Rubric: {JSON.stringify(q.rubric)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ITEM_META: Record<AdminSectionContent["item_type"], { icon: typeof PlayCircle; label: string }> = {
  lecture: { icon: PlayCircle, label: "Lecture" },
  quiz: { icon: HelpCircle, label: "Quiz" },
  assignment: { icon: ClipboardList, label: "Assignment" },
  coding: { icon: Code2, label: "Coding Exercise" },
};

function contentTitle(content: AdminSectionContent): string {
  return (
    content.lecture?.title ??
    content.quiz?.title ??
    content.assignment?.title ??
    content.coding_exercise?.title ??
    "Untitled"
  );
}

function ContentItem({ content }: { content: AdminSectionContent }) {
  const meta = ITEM_META[content.item_type];
  const Icon = meta.icon;

  return (
    <details className="group">
      <summary className="flex items-center gap-2 py-2 cursor-pointer list-none">
        <ChevronRight className="w-3.5 h-3.5 text-(--gray-400) transition-transform group-open:rotate-90 shrink-0" />
        <Icon className="w-4 h-4 text-(--gray-400) shrink-0" />
        <span className="text-[13px] text-(--text-title)">{contentTitle(content)}</span>
        <span className="text-[11px] text-(--gray-400)">{meta.label}</span>
      </summary>
      <div className="pb-2">
        {content.item_type === "lecture" && content.lecture && <LectureBody lecture={content.lecture} />}
        {content.item_type === "quiz" && content.quiz && <QuizBody quiz={content.quiz} />}
        {content.item_type === "coding" && content.coding_exercise && (
          <CodingBody exercise={content.coding_exercise} />
        )}
        {content.item_type === "assignment" && content.assignment && (
          <AssignmentBody assignment={content.assignment} />
        )}
      </div>
    </details>
  );
}

export default function CurriculumPreview({ courseId }: { courseId: number }) {
  const { data, isLoading, isError } = useCourseAdminCurriculum(courseId);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-[13px] text-(--gray-400)">
        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
        Loading curriculum…
      </div>
    );
  }
  if (isError || !data) {
    return <p className="py-6 text-center text-[13px] text-red-500">Failed to load curriculum.</p>;
  }
  if (data.sections.length === 0) {
    return <p className="py-6 text-center text-[13px] text-(--gray-400)">No sections added yet.</p>;
  }

  return (
    <div className="divide-y divide-(--gray-100)">
      {data.sections.map((section, i) => (
        <details key={section.id} className="group py-1" open={i === 0}>
          <summary className="flex items-center gap-2 py-2 cursor-pointer list-none">
            <ChevronRight className="w-4 h-4 text-(--gray-400) transition-transform group-open:rotate-90 shrink-0" />
            <FileText className="w-4 h-4 text-(--gray-400) shrink-0" />
            <span className="text-[13px] font-semibold text-(--text-title)">
              {section.title}
            </span>
            <span className="text-[11px] text-(--gray-400)">
              {section.contents.length} item{section.contents.length === 1 ? "" : "s"}
            </span>
          </summary>
          <div className="pl-3 pb-1 divide-y divide-(--gray-50)">
            {section.contents.length === 0 ? (
              <p className="text-[12px] text-(--gray-400) py-2 pl-6">No content in this section.</p>
            ) : (
              section.contents.map((content) => <ContentItem key={content.id} content={content} />)
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
