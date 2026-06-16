"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Users,
  Lock,
  Globe,
  Plus,
  Search,
  BookOpen,
  Calendar,
  MessageSquare,
  X,
  Check,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";

import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";
import instructor5 from "@/assets/images/instructors/instructor5.webp";
import instructor6 from "@/assets/images/instructors/instructor6.webp";

// types and mock data
type GroupCategory =
  | "All"
  | "AI & ML"
  | "Data"
  | "Design"
  | "Web Dev"
  | "General";
type GroupStatus = "open" | "private" | "full";
type MemberFilter = "All Groups" | "My Groups";

interface Member {
  id: number;
  avatar: Parameters<typeof Image>[0]["src"];
  name: string;
}

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  category: GroupCategory;
  status: GroupStatus;
  members: Member[];
  maxMembers: number;
  meetingSchedule: string;
  course: string;
  tags: string[];
  joined: boolean;
  lastActive: string;
  messages: number;
}

// Mock data
const GROUPS: StudyGroup[] = [
  {
    id: 1,
    name: "LLM Paper Reading Club",
    description:
      "We meet weekly to dissect the latest AI research papers. Currently going through the Attention Is All You Need series and modern LLM architectures.",
    category: "AI & ML",
    status: "open",
    members: [
      { id: 1, avatar: instructor1, name: "Dr. Lena Park" },
      { id: 2, avatar: instructor2, name: "Marcus Webb" },
      { id: 3, avatar: instructor3, name: "Dr. Omar Said" },
      { id: 4, avatar: instructor4, name: "Sara Kim" },
    ],
    maxMembers: 10,
    meetingSchedule: "Every Tuesday, 6 PM",
    course: "Generative AI & LLMs in Production",
    tags: ["Papers", "LLMs", "Research"],
    joined: true,
    lastActive: "2h ago",
    messages: 128,
  },
  {
    id: 2,
    name: "SQL Challenge Sprint",
    description:
      "Daily SQL challenges and weekly mock interviews. We tackle LeetCode-style database problems together and review each other's query optimizations.",
    category: "Data",
    status: "open",
    members: [
      { id: 1, avatar: instructor4, name: "Sara Kim" },
      { id: 2, avatar: instructor5, name: "James Carter" },
      { id: 3, avatar: instructor6, name: "Amara Okafor" },
    ],
    maxMembers: 8,
    meetingSchedule: "Daily, async",
    course: "SQL for Data Analytics",
    tags: ["SQL", "Practice", "Interviews"],
    joined: true,
    lastActive: "30m ago",
    messages: 74,
  },
  {
    id: 3,
    name: "Figma Design Critique",
    description:
      "Share your Figma designs and get actionable feedback. Weekly critique sessions with structured feedback rounds. Beginner-friendly!",
    category: "Design",
    status: "open",
    members: [
      { id: 1, avatar: instructor5, name: "James Carter" },
      { id: 2, avatar: instructor1, name: "Dr. Lena Park" },
      { id: 3, avatar: instructor2, name: "Marcus Webb" },
      { id: 4, avatar: instructor3, name: "Dr. Omar Said" },
      { id: 5, avatar: instructor4, name: "Sara Kim" },
    ],
    maxMembers: 8,
    meetingSchedule: "Every Friday, 5 PM",
    course: "UI/UX Design Fundamentals",
    tags: ["Figma", "Critique", "Feedback"],
    joined: false,
    lastActive: "1d ago",
    messages: 213,
  },
  {
    id: 4,
    name: "Polars + Pandas Benchmark Lab",
    description:
      "We benchmark real-world data tasks in both Polars and Pandas to understand performance tradeoffs. Hands-on notebooks every session.",
    category: "Data",
    status: "private",
    members: [
      { id: 1, avatar: instructor3, name: "Dr. Omar Said" },
      { id: 2, avatar: instructor6, name: "Amara Okafor" },
    ],
    maxMembers: 6,
    meetingSchedule: "Every Wednesday, 7 PM",
    course: "Python Data Wrangling with Polars",
    tags: ["Polars", "Pandas", "Performance"],
    joined: false,
    lastActive: "3d ago",
    messages: 45,
  },
  {
    id: 5,
    name: "RAG Implementation Squad",
    description:
      "Building production RAG systems together. We share code reviews, debugging sessions, and deployment strategies for real-world LLM apps.",
    category: "AI & ML",
    status: "full",
    members: [
      { id: 1, avatar: instructor1, name: "Dr. Lena Park" },
      { id: 2, avatar: instructor2, name: "Marcus Webb" },
      { id: 3, avatar: instructor3, name: "Dr. Omar Said" },
      { id: 4, avatar: instructor4, name: "Sara Kim" },
      { id: 5, avatar: instructor5, name: "James Carter" },
      { id: 6, avatar: instructor6, name: "Amara Okafor" },
    ],
    maxMembers: 6,
    meetingSchedule: "Every Thursday, 8 PM",
    course: "Generative AI & LLMs in Production",
    tags: ["RAG", "Production", "LangChain"],
    joined: false,
    lastActive: "5h ago",
    messages: 391,
  },
  {
    id: 6,
    name: "Data Viz Collective",
    description:
      "Exploring data storytelling using Plotly, Seaborn, and D3. Monthly showcase where members present their best visualizations.",
    category: "Data",
    status: "open",
    members: [
      { id: 1, avatar: instructor4, name: "Sara Kim" },
      { id: 2, avatar: instructor2, name: "Marcus Webb" },
    ],
    maxMembers: 12,
    meetingSchedule: "Every Monday, 7 PM",
    course: "Data Visualization with Plotly",
    tags: ["Plotly", "Seaborn", "Storytelling"],
    joined: false,
    lastActive: "2d ago",
    messages: 57,
  },
];

const CATEGORIES: GroupCategory[] = [
  "All",
  "AI & ML",
  "Data",
  "Design",
  "Web Dev",
  "General",
];

const STATUS_CONFIG: Record<
  GroupStatus,
  { label: string; badge: string; dot: string }
> = {
  open: {
    label: "Open",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  private: {
    label: "Private",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-400",
  },
  full: {
    label: "Full",
    badge: "bg-(--gray-100) text-(--gray-500) border border-(--gray-200)",
    dot: "bg-(--gray-400)",
  },
};

// Create Group Modal
function CreateGroupModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    name: string,
    description: string,
    category: GroupCategory,
    isPrivate: boolean,
  ) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GroupCategory>("General");
  const [isPrivate, setIsPrivate] = useState(false);
  const canSubmit = name.trim().length > 2 && description.trim().length > 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-200)">
          <h2 className="text-[16px] font-semibold text-(--text-title)">
            Create Study Group
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Category */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-md text-[12px]  border transition-colors cursor-pointer ${category === c ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Group Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ML Paper Reading Club"
              className="w-full h-10 px-3 rounded-lg border border-(--gray-200) text-[14px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[12px] font-semibold text-(--gray-500) mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this group focus on? How often will you meet?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-(--gray-200) text-[14px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors resize-none"
            />
          </div>

          {/* Privacy */}
          <button
            onClick={() => setIsPrivate((v) => !v)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${isPrivate ? "border-(--primary-300) bg-(--primary-50)" : "border-(--gray-200) hover:border-(--primary-200)"}`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isPrivate ? "bg-(--primary-600)" : "bg-(--gray-100)"}`}
            >
              {isPrivate ? (
                <Lock className="w-4 h-4 text-white" />
              ) : (
                <Globe className="w-4 h-4 text-(--gray-500)" />
              )}
            </div>
            <div className="text-left flex-1">
              <p className="text-[14px] font-semibold text-(--text-title)">
                {isPrivate ? "Private Group" : "Public Group"}
              </p>
              <p className="text-[12px] text-(--gray-500)">
                {isPrivate
                  ? "Members join by invite only"
                  : "Anyone can discover and join"}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isPrivate ? "border-(--primary-600) bg-(--primary-600)" : "border-(--gray-300)"}`}
            >
              {isPrivate && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        </div>

        <div className="px-5 py-4 border-t border-(--gray-200) flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 rounded-md h-11 border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canSubmit) {
                onCreate(name, description, category, isPrivate);
                onClose();
              }
            }}
            disabled={!canSubmit}
            className=" px-4 rounded-md h-11 bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

// Group Card
function GroupCard({
  group,
  onToggleJoin,
}: {
  group: StudyGroup;
  onToggleJoin: (id: number) => void;
}) {
  const cfg = STATUS_CONFIG[group.status];
  const spotsLeft = group.maxMembers - group.members.length;
  const fillPct = Math.min(
    100,
    (group.members.length / group.maxMembers) * 100,
  );
  const canJoin = group.status === "open";

  return (
    <div className="group-card opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}
          >
            {group.status === "private" ? (
              <Lock className="w-3 h-3" />
            ) : group.status === "full" ? (
              <Users className="w-3 h-3" />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            {cfg.label}
          </span>
          <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-100)">
            {group.category}
          </span>
          {group.joined && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-(--primary-600) text-white">
              Joined
            </span>
          )}
        </div>
        {/* Action */}
        {group.joined ? (
          <button
            onClick={() => onToggleJoin(group.id)}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-(--gray-200) text-(--gray-500) hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            Leave
          </button>
        ) : (
          <button
            onClick={() => canJoin && onToggleJoin(group.id)}
            disabled={!canJoin}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${canJoin ? "bg-(--primary-600) hover:bg-(--primary-700) text-white" : "bg-(--gray-100) text-(--gray-400) cursor-not-allowed"}`}
          >
            {group.status === "private" ? (
              <>
                <Lock className="w-4 h-4" />
                Request
              </>
            ) : group.status === "full" ? (
              "Full"
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Join
              </>
            )}
          </button>
        )}
      </div>

      {/* Name + description */}
      <div>
        <h3 className=" text-[14px] md:text-[16px] lg:text-[16px] font-semibold text-(--text-title) leading-snug mb-1.5">
          {group.name}
        </h3>
        <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) leading-relaxed line-clamp-2">
          {group.description}
        </p>
      </div>

      {/* Course */}
      <div className="flex items-center gap-1.5 text-[12px] text-(--gray-400)">
        <BookOpen className="w-4 h-4 shrink-0" />
        <span className="truncate">{group.course}</span>
      </div>

      {/* Tags */}
      {group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-(--gray-100) text-(--gray-500)"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Members */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {group.members.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shrink-0"
            >
              <Image
                src={m.avatar}
                alt={m.name}
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
          ))}
          {group.members.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-(--gray-100) flex items-center justify-center text-[10px] font-semibold text-(--gray-500) shrink-0">
              +{group.members.length - 5}
            </div>
          )}
        </div>
        <span className="text-[12px] text-(--gray-500)">
          {group.members.length}/{group.maxMembers} members
          {group.status === "open" && spotsLeft <= 3 && (
            <span className="ml-1.5 text-rose-500 font-semibold">
              {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
            </span>
          )}
        </span>
      </div>

      {/* Capacity bar */}
      <div className="h-1.5 rounded-full bg-(--gray-100) overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${group.status === "full" ? "bg-(--gray-400)" : "bg-(--primary-600)"}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-2 border-t border-(--gray-100)">
        <span className="flex items-center gap-1.5 text-[12px] text-(--gray-400)">
          <Calendar className="w-4 h-4 shrink-0" />
          {group.meetingSchedule}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-(--gray-400) ml-auto">
          <MessageSquare className="w-4 h-4 shrink-0" />
          {group.messages}
        </span>
        <span className="text-[12px] text-(--gray-400)">
          {group.lastActive}
        </span>
      </div>
    </div>
  );
}

// Main component

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState(GROUPS);
  const [activeCategory, setActiveCategory] = useState<GroupCategory>("All");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("All Groups");
  const [search, setSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = groups.filter((g) => {
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    const matchMember = memberFilter === "All Groups" || g.joined;
    const q = search.toLowerCase();
    const matchSearch =
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchMember && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleToggleJoin = (id: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              joined: !g.joined,
              members: g.joined
                ? g.members.filter((m) => m.name !== "You")
                : [
                    ...g.members,
                    { id: Date.now(), avatar: instructor6, name: "You" },
                  ],
            }
          : g,
      ),
    );
  };

  const handleCreate = (
    name: string,
    description: string,
    category: GroupCategory,
    isPrivate: boolean,
  ) => {
    const newGroup: StudyGroup = {
      id: Date.now(),
      name,
      description,
      category,
      status: isPrivate ? "private" : "open",
      members: [{ id: 1, avatar: instructor6, name: "You" }],
      maxMembers: 10,
      meetingSchedule: "TBD",
      course: "General",
      tags: [],
      joined: true,
      lastActive: "Just now",
      messages: 0,
    };
    setGroups((prev) => [newGroup, ...prev]);
  };

  /* ── Animations ── */
  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll(".group-card"));
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
    );
  }, [activeCategory, memberFilter, search, currentPage]);

  const myGroupsCount = groups.filter((g) => g.joined).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            Study Groups
          </h1>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
            Learn together, grow faster. Join or create a study group.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 w-full sm:w-auto rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Groups",
            value: groups.length,
            iconBg: "bg-(--primary-100)",
            color: "text-(--primary-600)",
            Icon: Users,
            badge: "available",
          },
          {
            label: "My Groups",
            value: myGroupsCount,
            iconBg: "bg-emerald-100",
            color: "text-emerald-600",
            Icon: Crown,
            badge: "joined",
          },
          {
            label: "Open to Join",
            value: groups.filter((g) => g.status === "open" && !g.joined)
              .length,
            iconBg: "bg-amber-100",
            color: "text-amber-600",
            Icon: Globe,
            badge: "accepting members",
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
        {/* Left  member filter + category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(["All Groups", "My Groups"] as MemberFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setMemberFilter(f);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${memberFilter === f ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              {f}
              {f === "My Groups" && myGroupsCount > 0 && (
                <span
                  className={`ml-1.5 text-[12px] font-semibold px-1.5 py-0.5 rounded-full ${memberFilter === f ? "bg-white/20 text-white" : "bg-(--gray-100) text-(--gray-500)"}`}
                >
                  {myGroupsCount}
                </span>
              )}
            </button>
          ))}
          <div className="w-px h-6 bg-(--gray-200) shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${activeCategory === cat ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right — search */}
        <div className="relative shrink-0 w-full xl:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search groups..."
            className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
          />
        </div>
      </div>

      {/* Results */}
      <p className="text-[14px] font-normal text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {filtered.length}
        </span>{" "}
        group{filtered.length !== 1 ? "s" : ""}
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {paginated.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onToggleJoin={handleToggleJoin}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-(--gray-400)">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium text-(--text-title)">
              No groups found
            </p>
            <p className="text-[14px] mt-1">
              Try a different keyword or category
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
