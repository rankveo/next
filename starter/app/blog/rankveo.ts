import { BlogClient } from '@rankveo/next';

// One client for the whole blog. Module scope, so the key is read once and never
// crosses into a Client Component.
//
// Every function in this file is server-only. Do not import it from a file that
// carries 'use client'.
export const blog = new BlogClient({
  // Cache each response for an hour. Lower it while you are setting the blog up;
  // raise it once your publishing cadence settles.
  revalidate: 3_600,
});

/** Where the blog lives on your site. Change this and every link follows. */
export const BLOG_BASE_PATH = '/blog';

/** Your production origin, used for canonical URLs and the sitemap. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

/** Articles per page in the listing. */
export const PAGE_SIZE = 9;

/**
 * URLs are one-based (`/blog?page=2`); the API is zero-based. Converting in one
 * place keeps the off-by-one out of every page component.
 */
export function toApiPage(searchPage: string | string[] | undefined): number {
  const raw = Array.isArray(searchPage) ? searchPage[0] : searchPage;
  const parsed = Number.parseInt(raw ?? '1', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  return parsed - 1;
}
