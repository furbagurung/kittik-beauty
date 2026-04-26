"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapUnderline from "@tiptap/extension-underline";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  RemoveFormatting,
  Underline,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProductDescriptionEditorProps = {
  disabled?: boolean;
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

function ToolbarButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10",
        "disabled:pointer-events-none disabled:opacity-45",
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-transparent hover:border-border hover:bg-card hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export default function ProductDescriptionEditor({
  disabled = false,
  id,
  onChange,
  placeholder = "Write a concise, useful description for shoppers and operators.",
  value,
}: ProductDescriptionEditorProps) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: {
          levels: [2, 3],
        },
        horizontalRule: false,
        strike: false,
        underline: false,
      }),
      TiptapUnderline,
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        "aria-label": "Product description",
        class:
          "min-h-36 px-3.5 py-3 text-sm leading-6 text-foreground outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.isEmpty ? "" : editor.getHTML());
    },
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.isEmpty ? "" : editor.getHTML();

    if ((value || "") !== currentHtml) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  function clearFormatting() {
    if (!editor) return;

    editor.chain().focus().unsetAllMarks().clearNodes().run();
  }

  const toolbarDisabled = disabled || !editor;

  return (
    <div
      className={cn(
        "surface-shadow-soft overflow-hidden rounded-lg border border-input bg-card transition",
        "focus-within:border-[color:color-mix(in_oklab,var(--primary)_32%,var(--input))] focus-within:ring-4 focus-within:ring-ring/10",
        disabled && "bg-secondary text-muted-foreground",
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border/80 bg-muted/45 px-2.5 py-2">
        <ToolbarButton
          label="Paragraph"
          active={editor?.isActive("paragraph")}
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor?.isActive("heading", { level: 2 })}
          disabled={toolbarDisabled}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor?.isActive("heading", { level: 3 })}
          disabled={toolbarDisabled}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Bold"
          active={editor?.isActive("bold")}
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor?.isActive("italic")}
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor?.isActive("underline")}
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Bullet list"
          active={editor?.isActive("bulletList")}
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor?.isActive("orderedList")}
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Clear formatting"
          disabled={toolbarDisabled}
          onClick={clearFormatting}
        >
          <RemoveFormatting className="size-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {editor?.isEmpty ? (
          <p className="pointer-events-none absolute left-3.5 top-3 text-sm leading-6 text-muted-foreground">
            {placeholder}
          </p>
        ) : null}
        <EditorContent
          id={id}
          editor={editor}
          className={cn(
            "max-w-none",
            "[&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:leading-7",
            "[&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:leading-6",
            "[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6",
            "[&_.ProseMirror_p]:my-2 [&_.ProseMirror_p:first-child]:mt-0 [&_.ProseMirror_p:last-child]:mb-0",
            "[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6",
            "[&_.ProseMirror]:min-h-36 [&_.ProseMirror]:outline-none",
            disabled && "cursor-not-allowed",
          )}
        />
      </div>
    </div>
  );
}
