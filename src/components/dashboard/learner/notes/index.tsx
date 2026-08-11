"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  NotebookPen,
  Plus,
  Search,
  Trash2,
  Pin,
  PinOff,
  Clock,
  BookOpen,
  X,
  Check,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/query-states";
import {
  useMyCourses,
  ALL_ENROLLMENTS_PAGE_SIZE,
} from "@/hooks/use-course-catalog";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/hooks/use-notes";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type {
  LearnerNote,
  NoteColor,
  NoteCreateInput,
} from "@/lib/notes-api";

const PAGE_SIZE = 9;

/** The backend palette is a fixed enum, so the UI cannot invent swatches. */
const COLOR_CONFIG: Record<
  NoteColor,
  { bg: string; border: string; dot: string }
> = {
  default: {
    bg: "bg-white",
    border: "border-(--gray-200)",
    dot: "bg-(--gray-400)",
  },
  yellow: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  blue: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  pink: { bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-400" },
  purple: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
};

const COLOR_LABELS: Record<NoteColor, string> = {
  default: "White",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  pink: "Pink",
  purple: "Purple",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

function formatPlaybackStamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

interface EditorCourseOption {
  slug: string;
  title: string;
}

function NoteEditor({
  note,
  courses,
  saving,
  onClose,
  onSave,
}: {
  note: LearnerNote | null;
  courses: EditorCourseOption[];
  saving: boolean;
  onClose: () => void;
  onSave: (input: NoteCreateInput) => void;
}) {
  const isNew = note === null;
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [color, setColor] = useState<NoteColor>(note?.color ?? "default");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [courseSlug, setCourseSlug] = useState(note?.course?.slug ?? "");

  // The backend rejects an empty body at both the serializer and a DB check
  // constraint; the title is optional.
  const canSave = body.trim().length > 0;

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (value && !tags.includes(value) && tags.length < 10) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] border ${COLOR_CONFIG[color].bg} ${COLOR_CONFIG[color].border}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200) shrink-0">
          <h2 className="text-[16px] font-semibold text-(--text-title)">
            {isNew ? "New Note" : "Edit Note"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (optional)…"
            maxLength={200}
            className="w-full text-[16px] md:text-[20px] lg:text-[20px] font-semibold text-(--text-title) bg-transparent border-none outline-none placeholder:text-(--gray-300)"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              {(Object.keys(COLOR_CONFIG) as NoteColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={COLOR_LABELS[c]}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${COLOR_CONFIG[c].dot} ${color === c ? "border-(--text-title) scale-125" : "border-transparent"}`}
                />
              ))}
            </div>

            {/* A note can only be filed under a course the learner can reach,
                so this is a picker over their enrollments, not free text. */}
            <select
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
              className="h-9 px-3 rounded-lg border border-(--gray-200) bg-white text-[13px] text-(--gray-600) outline-none focus:border-(--primary-300) transition-colors max-w-52"
            >
              <option value="">General (no course)</option>
              {courses.map((course) => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note here…"
            rows={10}
            className="w-full bg-transparent text-[14px] text-(--text-title) leading-relaxed outline-none resize-none placeholder:text-(--gray-300)"
          />

          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-200)"
                >
                  #{t}
                  <button
                    onClick={() =>
                      setTags((prev) => prev.filter((x) => x !== t))
                    }
                    className="cursor-pointer hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag… (Enter, max 10)"
                className="flex-1 h-10 px-3 rounded-lg border border-(--gray-200) bg-white text-[14px] text-(--gray-600) outline-none focus:border-(--primary-300) transition-colors placeholder:text-(--gray-300)"
              />
              <button
                onClick={addTag}
                className="h-10 px-3 rounded-lg bg-(--primary-600) text-white text-[14px] font-medium cursor-pointer hover:bg-(--primary-700) transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-(--gray-200) flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-md border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                title,
                body,
                color,
                tags,
                course_slug: courseSlug || undefined,
              })
            }
            disabled={!canSave || saving}
            className="h-10 px-5 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : isNew ? "Create Note" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: LearnerNote;
  onEdit: (n: LearnerNote) => void;
  onDelete: (id: number) => void;
  onTogglePin: (n: LearnerNote) => void;
}) {
  const cfg = COLOR_CONFIG[note.color] ?? COLOR_CONFIG.default;

  return (
    <div
      onClick={() => onEdit(note)}
      className={`note-card opacity-0 relative rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col gap-3 ${cfg.bg} ${cfg.border}`}
    >
      {note.is_pinned && (
        <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-(--primary-600)">
          <Pin className="w-4 h-4 fill-(--primary-600)" />
        </span>
      )}

      <div>
        <h3 className="text-[14px] md:text-[16px] lg:text-[16px] font-semibold text-(--text-title) leading-snug mb-1.5 pr-5">
          {note.title || "Untitled note"}
        </h3>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) leading-relaxed line-clamp-3 whitespace-pre-line">
          {note.body}
        </p>
      </div>

      {note.lecture && (
        <span className="flex w-fit items-center gap-1 rounded-full border border-(--gray-200) bg-white/70 px-2 py-0.5 text-[12px] text-(--gray-500)">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-40">{note.lecture.title}</span>
          {note.timestamp_seconds !== null && (
            <span className="font-medium">
              · {formatPlaybackStamp(note.timestamp_seconds)}
            </span>
          )}
        </span>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-(--gray-500) border border-(--gray-200)"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-(--gray-200)/60 mt-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[14px] text-(--gray-400)">
            <Clock className="w-4 h-4" />
            {relativeTime(note.updated_at)}
          </span>
          {note.course && (
            <span className="flex items-center gap-1 text-[14px] text-(--gray-400) truncate max-w-24">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{note.course.title}</span>
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onTogglePin(note)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) hover:text-(--primary-600) transition-colors cursor-pointer"
          >
            {note.is_pinned ? (
              <PinOff className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-(--gray-400) hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  // The backend has no note "category" — it has free-form tags, so the old
  // category tab bar is a tag filter now.
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editorNote, setEditorNote] = useState<LearnerNote | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useNotes({
    page: currentPage,
    page_size: PAGE_SIZE,
    search: search.trim() || undefined,
    tag: activeTag ? [activeTag] : undefined,
  });

  // The editor's course picker must offer every enrollment.
  const { data: myCourses } = useMyCourses({
    page_size: ALL_ENROLLMENTS_PAGE_SIZE,
  });
  const courseOptions = useMemo<EditorCourseOption[]>(
    () =>
      (myCourses?.results ?? []).map((enrollment) => ({
        slug: enrollment.course.slug,
        title: enrollment.course.title,
      })),
    [myCourses],
  );

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const notes = useMemo(() => data?.results ?? [], [data]);
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Tag chips are built from the notes currently loaded. Filtering itself is
  // server-side, so a tag that exists only on a later page won't be offered
  // until that page is reached.
  const availableTags = useMemo(() => {
    const seen = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => seen.add(tag)));
    if (activeTag) seen.add(activeTag);
    return Array.from(seen).sort();
  }, [notes, activeTag]);

  const handleSave = (input: NoteCreateInput) => {
    const onError = (err: unknown) =>
      notify.error(
        err instanceof ApiError ? err.message : "Couldn't save the note.",
      );

    if (editorNote) {
      updateMutation.mutate(
        { id: editorNote.id, input },
        {
          onSuccess: () => {
            notify.success("Note updated.");
            setShowEditor(false);
          },
          onError,
        },
      );
      return;
    }

    createMutation.mutate(input, {
      onSuccess: () => {
        notify.success("Note created.");
        setShowEditor(false);
      },
      onError,
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Couldn't delete the note.",
        ),
    });
  };

  const handleTogglePin = (note: LearnerNote) => {
    updateMutation.mutate({
      id: note.id,
      input: { is_pinned: !note.is_pinned },
    });
  };

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".note-card"));
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power3.out" },
    );
  }, [activeTag, search, currentPage, notes.length]);

  return (
    <div className="space-y-6">
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] font-semibold text-(--text-title)">
            Notes
          </h1>
          <p className="text-[14px] text-(--gray-500) mt-1">
            Capture ideas, summaries, and study notes in one place.
          </p>
        </div>
        <button
          onClick={() => {
            setEditorNote(null);
            setShowEditor(true);
          }}
          className="flex items-center justify-center gap-2 h-11 px-5 w-full sm:w-auto rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTag(null);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${activeTag === null ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveTag(tag);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${activeTag === tag ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 w-full xl:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search notes…"
            className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
          />
        </div>
      </div>

      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {isLoading ? "—" : total}
        </span>{" "}
        note{total !== 1 ? "s" : ""}
        {activeTag && (
          <>
            {" "}
            tagged{" "}
            <span className="font-semibold text-(--primary-600)">
              #{activeTag}
            </span>
          </>
        )}
      </p>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState title="Couldn't load your notes" onRetry={() => refetch()} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="w-6 h-6" />}
          title={
            search || activeTag ? "No notes found" : "You haven't written any notes"
          }
          description={
            search || activeTag
              ? "Try a different search term or tag."
              : "Notes you take while studying will collect here."
          }
        />
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(n) => {
                  setEditorNote(n);
                  setShowEditor(true);
                }}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {showEditor && (
        <NoteEditor
          note={editorNote}
          courses={courseOptions}
          saving={createMutation.isPending || updateMutation.isPending}
          onClose={() => setShowEditor(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
