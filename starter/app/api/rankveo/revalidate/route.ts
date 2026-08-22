import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { BLOG_BASE_PATH } from '../../../blog/rankveo';

// rankveo calls this the moment an article is published, updated, or unpublished,
// so a new post is live in seconds instead of waiting out the page's revalidate
// window. Without it the blog still updates — just on its own cache schedule.
//
// Set RANKVEO_REVALIDATE_SECRET here and paste the same value into
// rankveo → Integrations → Next.js.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RevalidatePayload {
  event: 'article.published' | 'article.updated' | 'article.unpublished';
  slug?: string;
}

function authorized(header: string | null): boolean {
  const secret = process.env.RANKVEO_REVALIDATE_SECRET;
  if (!secret) return false;

  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  const received = Buffer.from(token);
  const expected = Buffer.from(secret);
  // Compare in constant time, and only when the lengths match — timingSafeEqual
  // throws on a length mismatch.
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get('authorization'))) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  let payload: RevalidatePayload;
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    return NextResponse.json({ revalidated: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const paths = [BLOG_BASE_PATH];
  // An article's own page only exists once it has a slug. Unpublishing still
  // refreshes it so the page 404s instead of serving a cached copy.
  if (payload.slug) paths.push(`${BLOG_BASE_PATH}/${payload.slug}`);

  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, paths });
}
