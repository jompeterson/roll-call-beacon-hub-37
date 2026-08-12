interface CompletionRecapProps {
  title: string;
  isEnded?: boolean | null;
  accomplishments?: string | null;
  images?: string[] | null;
  /** Extra stat rows rendered above the accomplishments list */
  stats?: { label: string; value: string }[];
}

export const CompletionRecap = ({
  title,
  isEnded,
  accomplishments,
  images,
  stats = [],
}: CompletionRecapProps) => {
  const hasContent =
    !!accomplishments || stats.length > 0 || (images?.length ?? 0) > 0;

  if (!isEnded || !hasContent) return null;

  return (
    <div className="rounded-md border bg-muted/40 p-4">
      <h3 className="font-semibold mb-2">Accomplishments</h3>
      {stats.map((stat) => (
        <p key={stat.label} className="mb-1 text-sm">
          <span className="font-medium">{stat.label}:</span> {stat.value}
        </p>
      ))}
      {accomplishments && (
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {accomplishments
            .split("\n")
            .filter(Boolean)
            .map((item, i) => (
              <li key={i}>{item}</li>
            ))}
        </ul>
      )}
      {(images?.length ?? 0) > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images!.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={url}
                alt={`Photo ${i + 1} from ${title}`}
                loading="lazy"
                className="aspect-square w-full rounded-md border object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
