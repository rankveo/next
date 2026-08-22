import Link from 'next/link';

// Links rather than buttons, so pagination works without JavaScript and each
// page stays independently crawlable.
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

  return (
    <nav className="blog-pagination" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} rel="prev">← Newer</Link>
      ) : (
        <span />
      )}

      <span>Page {currentPage} of {totalPages}</span>

      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} rel="next">Older →</Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
