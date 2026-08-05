import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { toEditorHtml } from "@/components/ui/rich-text-editor";

interface RichTextProps {
  value: string | null | undefined;
  className?: string;
}

const ALLOWED_TAGS = [
  "p", "br", "b", "strong", "i", "em", "u", "s", "ul", "ol", "li", "a", "span", "div", "h1", "h2", "h3", "h4", "blockquote", "code",
];

export const sanitizeRichText = (value: string | null | undefined) =>
  DOMPurify.sanitize(toEditorHtml(value), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

/** Strips all markup — use for table cells, previews and search. */
export const richTextToPlain = (value: string | null | undefined) => {
  if (!value) return "";
  return sanitizeRichText(value)
    .replace(/<\/(p|div|li|h[1-4]|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};

export function RichText({ value, className }: RichTextProps) {
  if (!value) return null;
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
    />
  );
}
