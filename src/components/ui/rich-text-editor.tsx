import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  minHeight?: string;
}

const isHtml = (val: string) => /<[a-z][\s\S]*>/i.test(val);

const escapeHtml = (val: string) =>
  val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Converts a legacy plain-text description into simple HTML paragraphs. */
export const toEditorHtml = (value: string | null | undefined) => {
  if (!value) return "";
  if (isHtml(value)) return value;
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  id,
  disabled,
  minHeight = "140px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external value in only when it differs from the DOM (avoids caret jumps).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const incoming = toEditorHtml(value);
    if (el.innerHTML !== incoming) {
      el.innerHTML = incoming;
    }
  }, [value]);

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    onChange(html === "<br>" || html === "<p><br></p>" ? "" : html);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Enter the URL");
    if (!url) return;
    exec("createLink", url);
  };

  const isEmpty = !toEditorHtml(value).replace(/<[^>]*>/g, "").trim();

  const buttons: Array<{ icon: typeof Bold; label: string; action: () => void }> = [
    { icon: Bold, label: "Bold", action: () => exec("bold") },
    { icon: Italic, label: "Italic", action: () => exec("italic") },
    { icon: Underline, label: "Underline", action: () => exec("underline") },
    { icon: List, label: "Bulleted list", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", action: () => exec("insertOrderedList") },
    { icon: Link2, label: "Insert link", action: addLink },
    { icon: Undo, label: "Undo", action: () => exec("undo") },
    { icon: Redo, label: "Redo", action: () => exec("redo") },
  ];

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-1 py-1">
        {buttons.map(({ icon: Icon, label, action }, index) => (
          <span key={label} className="flex items-center">
            {index === 6 && <Separator orientation="vertical" className="mx-1 h-5" />}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={label}
              title={label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={action}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </span>
        ))}
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          }}
          className="prose prose-sm dark:prose-invert max-w-none px-3 py-2 text-sm outline-none [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
