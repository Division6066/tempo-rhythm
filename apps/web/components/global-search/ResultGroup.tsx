import Link from "next/link";

export type ResultRow = {
  id: string;
  label: string;
  href: string;
  detail?: string;
};

type Props = {
  title: string;
  rows: ResultRow[];
};

export function ResultGroup({ title, rows }: Props) {
  if (rows.length === 0) return null;
  const headingId = `search-group-${title.toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="font-semibold text-sm">
        {title} ({rows.length})
      </h2>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              href={row.href}
              data-search-result
              className="block rounded-md border border-border px-3 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="block text-sm">{row.label}</span>
              {row.detail ? (
                <span className="block text-muted-foreground text-xs">{row.detail}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
