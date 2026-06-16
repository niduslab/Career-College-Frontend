"use client";

import { useState, useEffect, useRef } from "react";
import {
  NotebookPen,
  Plus,
  Search,
  Trash2,
  Pin,
  PinOff,
  Tag,
  Clock,
  BookOpen,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import gsap from "gsap";

// Types
type NoteColor = "default" | "yellow" | "green" | "blue" | "pink";
type NoteCategory =
  | "All"
  | "Lecture"
  | "Summary"
  | "To-Do"
  | "Question"
  | "Idea";

interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  pinned: boolean;
  tags: string[];
  course: string;
  updatedAt: string;
}

// Constants
const CATEGORIES: NoteCategory[] = [
  "All",
  "Lecture",
  "Summary",
  "To-Do",
  "Question",
  "Idea",
];

const COLOR_CONFIG: Record<
  NoteColor,
  { bg: string; border: string; dot: string }
> = {
  default: {
    bg: "bg-white",
    border: "border-(--gray-200)",
    dot: "bg-(--gray-400)",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  blue: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  pink: { bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-400" },
};

const COLOR_LABELS: Record<NoteColor, string> = {
  default: "White",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  pink: "Pink",
};

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "Transformer Architecture Overview",
    content:
      "Self-attention mechanism allows the model to weigh the importance of each token relative to all others. Key components:\n- Multi-head attention\n- Positional encoding\n- Feed-forward network\n- Layer normalisation\n\nFormula: Attention(Q, K, V) = softmax(QK^T / √d_k) · V",
    category: "Lecture",
    color: "blue",
    pinned: true,
    tags: ["LLMs", "Attention"],
    course: "Generative AI & LLMs",
    updatedAt: "2h ago",
  },
  {
    id: 2,
    title: "SQL Window Functions",
    content:
      "Window functions perform calculations across a set of rows related to the current row.\n\nROW_NUMBER() — unique sequential integer\nRANK() — same rank for ties, gaps after\nDENSE_RANK() — same rank for ties, no gaps\nLAG/LEAD — access previous/next rows\n\nAlways use OVER() clause with PARTITION BY and ORDER BY.",
    category: "Summary",
    color: "green",
    pinned: false,
    tags: ["SQL", "Analytics"],
    course: "SQL for Data Analytics",
    updatedAt: "1d ago",
  },
  {
    id: 3,
    title: "Week 3 Study Goals",
    content:
      "- [ ] Complete Module 4 of LLMs course\n- [ ] Practice 5 SQL window function problems\n- [ ] Watch Figma design critique recording\n- [ ] Submit RAG project draft\n- [ ] Review flashcards for transformer quiz",
    category: "To-Do",
    color: "yellow",
    pinned: true,
    tags: ["Goals"],
    course: "General",
    updatedAt: "30m ago",
  },
  {
    id: 4,
    title: "Question: Fine-tuning vs RAG",
    content:
      "When should I fine-tune a model vs. using RAG?\n\nFine-tuning: when style/tone matters, domain-specific language, or task-specific behaviour.\n\nRAG: when knowledge is frequently updated, source attribution matters, or training data is limited.\n\nAsk Dr. Lena Park in next session.",
    category: "Question",
    color: "pink",
    pinned: false,
    tags: ["LLMs", "RAG"],
    course: "Generative AI & LLMs",
    updatedAt: "3d ago",
  },
  {
    id: 5,
    title: "Polars vs Pandas Performance Notes",
    content:
      "Polars is significantly faster for large datasets:\n- Written in Rust, zero-copy\n- Lazy evaluation with query optimiser\n- True multi-threading\n\nPandas still wins for:\n- Ecosystem compatibility\n- Small datasets\n- Existing code bases\n\nBenchmark: Polars ~5–10× faster on 1M+ rows.",
    category: "Lecture",
    color: "default",
    pinned: false,
    tags: ["Python", "Performance"],
    course: "Python Data Wrangling",
    updatedAt: "5d ago",
  },
  {
    id: 6,
    title: "Project Idea: Course Recommendation Engine",
    content:
      "Build a personalised course recommendation system using:\n1. Collaborative filtering on completion data\n2. Content-based filtering on tags/descriptions\n3. Hybrid model combining both\n\nStack: Python, scikit-learn, FastAPI, React\nTimeline: 3 weeks",
    category: "Idea",
    color: "blue",
    pinned: false,
    tags: ["Project", "ML"],
    course: "General",
    updatedAt: "1w ago",
  },
];

//  Note Editor Modal
function NoteEditor({
  note,
  onClose,
  onSave,
}: {
  note: Partial<Note> | null;
  onClose: () => void;
  onSave: (n: Omit<Note, "id" | "updatedAt">) => void;
}) {
  const isNew = !note?.id;
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [category, setCategory] = useState<NoteCategory>(
    note?.category ?? "Lecture",
  );
  const [color, setColor] = useState<NoteColor>(note?.color ?? "default");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [course, setCourse] = useState(note?.course ?? "");
  const [catOpen, setCatOpen] = useState(false);

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] border ${COLOR_CONFIG[color].bg} ${COLOR_CONFIG[color].border}`}
      >
        {/* Header */}
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
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title…"
            className="w-full text-[16px] md:text-[20px] lg:text-[20px] font-semibold text-(--text-title) bg-transparent border-none outline-none placeholder:text-(--gray-300)"
          />

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <div className="relative">
              <button
                onClick={() => setCatOpen((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-(--gray-200) bg-white text-[14px] text-(--gray-500) hover:border-(--primary-300) transition-colors cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                {category}
                <ChevronDown className="w-4 h-4" />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-9 z-20 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1 w-36">
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCategory(c);
                        setCatOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[14px] hover:bg-(--gray-50) cursor-pointer ${category === c ? "font-semibold text-(--primary-600)" : "text-(--text-title)"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color picker */}
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

            {/* Course */}
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course…"
              className="h-9 px-3 rounded-lg border border-(--gray-200) bg-white text-[13px] text-(--gray-600) outline-none focus:border-(--primary-300) transition-colors w-40 placeholder:text-(--gray-300)"
            />
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here…"
            rows={10}
            className="w-full bg-transparent text-[14px] text-(--text-title) leading-relaxed outline-none resize-none placeholder:text-(--gray-300)"
          />

          {/* Tags */}
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
                placeholder="Add tag… (Enter)"
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
            onClick={() => {
              if (canSave) {
                onSave({
                  title,
                  content,
                  category,
                  color,
                  pinned: note?.pinned ?? false,
                  tags,
                  course,
                });
                onClose();
              }
            }}
            disabled={!canSave}
            className="h-10 px-5 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isNew ? "Create Note" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Note card component
function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
}) {
  const cfg = COLOR_CONFIG[note.color];
  return (
    <div
      onClick={() => onEdit(note)}
      className={`note-card opacity-0 relative rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col gap-3 ${cfg.bg} ${cfg.border}`}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-(--primary-600)">
          <Pin className="w-4 h-4 fill-(--primary-600)" />
        </span>
      )}

      {/* Category */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-white/80 text-(--gray-500) border border-(--gray-200)">
          {note.category}
        </span>
      </div>

      {/* Title + content */}
      <div>
        <h3 className="text-[14px] md:text-[16px] lg:text-[16px] font-semibold text-(--text-title) leading-snug mb-1.5 pr-5">
          {note.title}
        </h3>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) leading-relaxed line-clamp-3 whitespace-pre-line">
          {note.content}
        </p>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[12px]   font-medium px-2 py-0.5 rounded-full bg-white/70 text-(--gray-500) border border-(--gray-200)"
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
            {note.updatedAt}
          </span>
          {note.course !== "General" && (
            <span className="flex items-center gap-1 text-[14px] text-(--gray-400) truncate max-w-24">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{note.course}</span>
            </span>
          )}
        </div>
        {/* Actions */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onTogglePin(note.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) hover:text-(--primary-600) transition-colors cursor-pointer"
          >
            {note.pinned ? (
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

// Main page
export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeCategory, setActiveCategory] = useState<NoteCategory>("All");
  const [search, setSearch] = useState("");
  const [editorNote, setEditorNote] = useState<Partial<Note> | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(200);

  const filtered = notes.filter((n) => {
    const matchCat = activeCategory === "All" || n.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);
  const sorted = [...pinned, ...unpinned];

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleSave = (data: Omit<Note, "id" | "updatedAt">) => {
    if (editorNote?.id) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editorNote.id ? { ...n, ...data, updatedAt: "Just now" } : n,
        ),
      );
    } else {
      const newNote: Note = {
        ...data,
        id: ++idRef.current,
        updatedAt: "Just now",
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleDelete = (id: number) =>
    setNotes((prev) => prev.filter((n) => n.id !== id));
  const handleTogglePin = (id: number) =>
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );

  /* Animations */
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
  }, [activeCategory, search, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            setEditorNote({});
            setShowEditor(true);
          }}
          className="flex items-center justify-center gap-2 h-11 px-5 w-full sm:w-auto rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Notes",
            value: notes.length,
            iconBg: "bg-(--primary-100)",
            color: "text-(--primary-600)",
            Icon: NotebookPen,
            badge: "saved",
          },
          {
            label: "Pinned",
            value: notes.filter((n) => n.pinned).length,
            iconBg: "bg-amber-100",
            color: "text-amber-600",
            Icon: Pin,
            badge: "pinned",
          },
          {
            label: "Courses",
            value: new Set(
              notes.map((n) => n.course).filter((c) => c !== "General"),
            ).size,
            iconBg: "bg-emerald-100",
            color: "text-emerald-600",
            Icon: BookOpen,
            badge: "covered",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {s.label}
                </p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {s.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${s.iconBg} flex items-center justify-center shrink-0`}
              >
                <s.Icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <div className="border border-dashed border-(--gray-200)" />
            <p className="text-[12px] font-medium text-(--gray-400)">
              {s.badge}
            </p>
          </div>
        ))}
      </div> */}

      {/* Filter row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${activeCategory === cat ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
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

      {/* Results count */}
      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {sorted.length}
        </span>{" "}
        note{sorted.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && (
          <>
            {" "}
            in{" "}
            <span className="font-semibold text-(--primary-600)">
              {activeCategory}
            </span>
          </>
        )}
      </p>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      >
        {paginated.map((note) => (
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
        {sorted.length === 0 && (
          <div className="col-span-full py-16 text-center text-(--gray-400)">
            <NotebookPen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium text-(--text-title)">
              No notes found
            </p>
            <p className="text-[14px] mt-1">
              Try a different search or create a new note
            </p>
          </div>
        )}
      </div>

      {/* Pagination — import only if needed, handled inline */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-9 h-9 rounded-lg text-[14px] font-medium border transition-colors cursor-pointer ${safePage === p ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showEditor && (
        <NoteEditor
          note={editorNote}
          onClose={() => setShowEditor(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
