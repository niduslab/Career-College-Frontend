"use client";

import { useState } from "react";
import { X, Trash2, Plus, ChevronDown } from "lucide-react";
import type { Lesson } from "./types";

const CODING_LANGUAGES = ["JavaScript", "Python", "C++", "Java"];

const STARTER_TEMPLATES: Record<string, string> = {
  JavaScript: "function solution(input) {\n  // your code here\n}",
  Python: "def solution(input):\n    # your code here\n    pass",
  "C++":
    "#include <iostream>\nusing namespace std;\n\nint solution(int input) {\n    // your code here\n    return 0;\n}",
  Java: "public class Solution {\n    public int solution(int input) {\n        // your code here\n        return 0;\n    }\n}",
};

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

function TestCaseModal({
  testCases,
  onClose,
  onSave,
}: {
  testCases: TestCase[];
  onClose: () => void;
  onSave: (cases: TestCase[]) => void;
}) {
  const [cases, setCases] = useState<TestCase[]>(
    testCases.length ? testCases : [{ id: 1, input: "", expectedOutput: "" }],
  );

  const addCase = () =>
    setCases((prev) => [
      ...prev,
      { id: Date.now(), input: "", expectedOutput: "" },
    ]);

  const removeCase = (id: number) =>
    setCases((prev) => prev.filter((c) => c.id !== id));

  const updateCase = (
    id: number,
    field: "input" | "expectedOutput",
    value: string,
  ) =>
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
          <h3 className="text-[16px] font-semibold text-(--text-title)">
            Test Cases
          </h3>
          <button
            onClick={onClose}
            className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {cases.map((c, i) => (
            <div
              key={c.id}
              className="border border-(--gray-200) rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-(--text-title)">
                  Test Case {i + 1}
                </span>
                {cases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCase(c.id)}
                    className="text-red-400 hover:text-red-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-normal text-(--text-title)">
                  Input
                </label>
                <textarea
                  value={c.input}
                  onChange={(e) => updateCase(c.id, "input", e.target.value)}
                  rows={2}
                  placeholder="e.g. [1, 2, 3]"
                  spellCheck={false}
                  className="w-full px-3 py-2 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-normal text-(--text-title)">
                  Expected Output
                </label>
                <textarea
                  value={c.expectedOutput}
                  onChange={(e) =>
                    updateCase(c.id, "expectedOutput", e.target.value)
                  }
                  rows={2}
                  placeholder="e.g. 6"
                  spellCheck={false}
                  className="w-full px-3 py-2 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCase}
            className="flex items-center gap-2 text-[13px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Test Case
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-(--gray-100)">
          <button
            onClick={onClose}
            className="px-5 h-10 text-[14px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(cases);
              onClose();
            }}
            className="px-5 h-10 text-[14px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
          >
            Save Test Cases
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CodingExerciseModal({
  initialLesson,
  onSave,
  onClose,
}: {
  initialLesson?: Omit<Lesson, "id">;
  onSave: (lesson: Omit<Lesson, "id">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [duration, setDuration] = useState(initialLesson?.duration ?? "");
  const [description, setDescription] = useState(
    initialLesson?.description ?? "",
  );
  const [language, setLanguage] = useState("JavaScript");
  const [langDropOpen, setLangDropOpen] = useState(false);
  const [starterCode, setStarterCode] = useState(
    STARTER_TEMPLATES["JavaScript"],
  );
  const [solutionCode, setSolutionCode] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCaseModalOpen, setTestCaseModalOpen] = useState(false);

  const isEdit = !!initialLesson;

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setStarterCode(STARTER_TEMPLATES[lang]);
    setLangDropOpen(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      type: "Coding Exercise",
      title: title.trim(),
      videoType: language,
      duration,
      description,
      isFreePreview: false,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[94vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--gray-100)">
            <h3 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
              {isEdit ? "Edit Coding Exercise" : "Add Coding Exercise"}
            </h3>
            <button
              onClick={onClose}
              className="text-(--gray-500) hover:text-(--gray-600) cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
            {/* Lesson Title + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="New Coding Exercise"
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="12.10"
                  className="w-full h-12 px-3 text-[14px] mt-1 border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What will the student learn in this lesson"
                className="w-full px-3 py-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            {/* Coding Language */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Coding Language
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropOpen((v) => !v)}
                  className="flex items-center w-full h-12 mt-1 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] cursor-pointer hover:bg-(--gray-50) transition-colors"
                >
                  <span className="flex-1 text-left text-(--text-title)">
                    {language}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-(--gray-500) transition-transform duration-200 ${langDropOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {langDropOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-50 py-1">
                    {CODING_LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full text-left cursor-pointer px-4 py-2 text-[14px] transition-colors ${lang === language ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Starter Code */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Starter Code
              </label>
              <textarea
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                rows={5}
                spellCheck={false}
                className="w-full px-3 py-3 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            {/* Solution Code */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-normal text-(--text-title)">
                Solution Code
              </label>
              <textarea
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                rows={5}
                spellCheck={false}
                placeholder="Write the complete solution code here..."
                className="w-full px-3 py-3 mt-1 text-[13px] font-mono border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow resize-none"
              />
            </div>

            {/* Test Cases */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-normal text-(--text-title)">
                  Test Cases
                  {testCases.length > 0 && (
                    <span className="ml-2 text-[12px] text-(--primary-700) font-semibold">
                      ({testCases.length} added)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setTestCaseModalOpen(true)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-(--primary-700) hover:text-(--primary-900) cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {testCases.length > 0 ? "Edit Test Cases" : "Add Test Cases"}
                </button>
              </div>
              {testCases.length === 0 ? (
                <div
                  onClick={() => setTestCaseModalOpen(true)}
                  className="w-full mt-1 rounded-lg border border-dashed border-(--gray-200) bg-(--gray-50) flex items-center justify-center gap-2 py-5 cursor-pointer hover:border-(--primary-300) hover:bg-(--primary-50) transition-colors"
                >
                  <Plus className="w-4 h-4 text-(--gray-400)" />
                  <p className="text-[13px] text-(--gray-500)">
                    No test cases yet — click to add
                  </p>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  {testCases.map((c, i) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-4 py-2.5 border border-(--gray-200) rounded-lg bg-(--gray-50) text-[13px] font-mono text-(--text-title)"
                    >
                      <span className="text-(--gray-400) shrink-0">
                        #{i + 1}
                      </span>
                      <span className="truncate flex-1">
                        Input: {c.input || "—"}
                      </span>
                      <span className="truncate text-(--gray-500)">
                        → {c.expectedOutput || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 px-6 py-4 border-t border-(--gray-100) sm:flex-row sm:items-center sm:justify-between">
            {isEdit && (
              <button className="flex items-center gap-2 text-[14px] font-medium text-red-500 hover:text-red-600 cursor-pointer transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete Exercise
              </button>
            )}
            <div className={`flex items-center gap-2 ${isEdit ? "sm:ml-auto" : "ml-auto"}`}>
              <button
                onClick={onClose}
                className="px-4 h-9 text-[13px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 h-9 text-[13px] font-normal border border-(--gray-200) rounded-md text-(--gray-600) hover:bg-(--gray-50) cursor-pointer transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleSave}
                className="px-4 h-9 text-[13px] font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-md cursor-pointer transition-colors"
              >
                Save Lesson
              </button>
            </div>
          </div>
        </div>
      </div>

      {testCaseModalOpen && (
        <TestCaseModal
          testCases={testCases}
          onClose={() => setTestCaseModalOpen(false)}
          onSave={setTestCases}
        />
      )}
    </>
  );
}
