import Link from 'next/link';

// Rendered as links rather than buttons so pagination works without JavaScript
// and each page stays independently crawlable.
export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  /** One-based, as it appears in the URL. */
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`);
  const previous = currentPage - 1;
  const next = currentPage + 1;

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4">
      {previous >= 1 ? (
        <Link
          href={href(previous)}
          rel="prev"
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          ← Newer
        </Link>
      ) : (
        <span />
      )}

      <span className="text-sm text-neutral-500">
        Page {currentPage} of {totalPages}
      </span>

      {next <= totalPages ? (
        <Link
          href={href(next)}
          rel="next"
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
