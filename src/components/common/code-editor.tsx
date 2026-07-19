"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import type { CodingLanguage } from "@/lib/course-api";

const LANG_EXTENSIONS: Record<CodingLanguage, ReturnType<typeof python>> = {
  python: python(),
  javascript: javascript(),
  cpp: cpp(),
  java: java(),
};

/**
 * Shared code editor (CodeMirror 6) for coding-exercise authoring and the
 * learner IDE. Syntax highlighting + line numbers + indentation per the
 * exercise's language. `dark` switches to the One Dark theme (learner IDE);
 * the light default matches the authoring form inputs.
 */
export default function CodeEditor({
  language,
  value,
  onChange,
  placeholder,
  minHeight = "160px",
  dark = false,
  readOnly = false,
}: {
  language: CodingLanguage;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  dark?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div
      className={`mt-1 rounded-lg overflow-hidden border transition-shadow text-[13px] ${
        dark
          ? "border-(--gray-700)"
          : "border-(--gray-200) focus-within:ring-2 focus-within:ring-(--primary-700)"
      }`}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[LANG_EXTENSIONS[language]]}
        theme={dark ? oneDark : "light"}
        placeholder={placeholder}
        minHeight={minHeight}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          autocompletion: true,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
        }}
      />
    </div>
  );
}
