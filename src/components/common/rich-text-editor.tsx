"use client";

import { useState } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Heading2,
  Heading3,
  RemoveFormatting,
  ChevronsUpDown,
  ChevronDown,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Custom extension to apply line-height via paragraph style
const LineHeight = Extension.create({
  name: "lineHeight",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => el.style.lineHeight || null,
            renderHTML: (attrs) =>
              attrs.lineHeight
                ? { style: `line-height: ${attrs.lineHeight}` }
                : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({
          commands,
        }: {
          commands: {
            updateAttributes: (
              type: string,
              attrs: Record<string, unknown>,
            ) => boolean;
          };
        }) => {
          return commands.updateAttributes("paragraph", { lineHeight });
        },
    } as never;
  },
});

const SPACING_OPTIONS = [
  { label: "Single (1.0)", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "Double (2.0)", value: "2" },
  { label: "2.5", value: "2.5" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
        active
          ? "bg-(--primary-100) text-(--primary-700)"
          : "text-(--gray-500) hover:bg-(--gray-100) hover:text-(--text-title)"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something...",
  minHeight = "160px",
}: RichTextEditorProps) {
  const [spacingOpen, setSpacingOpen] = useState(false);
  const [currentSpacing, setCurrentSpacing] = useState("1.5");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TextStyle.configure(),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      LineHeight.configure(),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "outline-none" },
    },
  });

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (!url || !editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const applySpacing = (val: string) => {
    if (!editor) return;
    (
      editor.chain().focus() as unknown as {
        setLineHeight: (v: string) => { run: () => void };
      }
    )
      .setLineHeight(val)
      .run();
    setCurrentSpacing(val);
    setSpacingOpen(false);
  };

  if (!editor) return null;

  return (
    <div className="border border-(--gray-200) rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-(--primary-700) transition-shadow">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-(--gray-200) bg-(--gray-50)">
        {/* History */}
        {/* <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-3.5 h-3.5" />
        </ToolbarButton> */}

        {/* <div className="w-px h-5 bg-(--gray-200) mx-1" /> */}

        {/* Headings */}
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-(--gray-200) mx-1" />

        {/* Formatting */}
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-(--gray-200) mx-1" />

        {/* Lists */}
        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-(--gray-200) mx-1" />

        {/* Alignment */}
        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-(--gray-200) mx-1" />

        {/* Link */}
        <ToolbarButton
          title="Add Link"
          active={editor.isActive("link")}
          onClick={addLink}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-(--gray-200) mx-1" />

        {/* Line & Paragraph Spacing */}
        <div className="relative">
          <button
            type="button"
            title="Line & Paragraph Spacing"
            onClick={() => setSpacingOpen((v) => !v)}
            className="h-7 px-1.5 flex items-center gap-0.5 rounded text-(--gray-500) hover:bg-(--gray-100) hover:text-(--text-title) transition-colors"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {spacingOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-(--gray-200) rounded-lg shadow-lg z-50 py-1 min-w-36">
              <p className="px-3 py-1 text-[11px] font-medium text-(--gray-400) uppercase tracking-wide">
                Line Spacing
              </p>
              {SPACING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applySpacing(opt.value)}
                  className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                    currentSpacing === opt.value
                      ? "bg-(--primary-50) text-(--primary-700) font-medium"
                      : "text-(--gray-600) hover:bg-(--gray-50)"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Formatting */}
        <ToolbarButton
          title="Clear Formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="px-3 py-2.5 text-[13px] text-(--text-title) [&_.tiptap]:outline-none [&_.tiptap]:min-h-[inherit] [&_.tiptap_p]:my-1 [&_.tiptap_h2]:text-[16px] [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:my-2 [&_.tiptap_h3]:text-[14px] [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:my-1.5 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_li]:my-0.5 [&_.tiptap_a]:text-(--primary-600) [&_.tiptap_a]:underline [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-(--gray-300) [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:text-(--gray-500) [&_.tiptap_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child]:before:text-(--gray-400) [&_.tiptap_p.is-editor-empty:first-child]:before:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child]:before:float-left [&_.tiptap_p.is-editor-empty:first-child]:before:h-0"
      />
    </div>
  );
}
