import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { RankveoBlogError as CoreError } from '@rankveo/client';
import { BlogClient, RankveoBlogError, blogSitemapEntries, remotePatterns } from './index.js';

const KEY = 'rk_test-key';

function stubFetch(): Array<{ url: string; init: RequestInit & { next?: unknown } }> {
  const calls: Array<{ url: string; init: RequestInit & { next?: unknown } }> = [];
  mock.method(globalThis, 'fetch', async (input: string, init: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ articles: [], total: 0, page: 0, limit: 10 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });
  return calls;
}

test.afterEach(() => mock.restoreAll());

void test('re-exported errors keep their identity across the package boundary', () => {
  // A consumer catching RankveoBlogError from @rankveo/next must match one
  // thrown by the core, or `instanceof` silently stops working after the split.
  assert.equal(RankveoBlogError, CoreError);
});

void test('caches for an hour by default, and honours an override', async () => {
  const calls = stubFetch();

  await new BlogClient(KEY).getArticles();
  assert.deepEqual(calls[0]?.init.next, { revalidate: 3_600 });

  await new BlogClient({ apiKey: KEY, revalidate: 60 }).getArticles();
  assert.deepEqual(calls[1]?.init.next, { revalidate: 60 });
});

void test('revalidate: 0 fetches every time instead of caching forever', async () => {
  const calls = stubFetch();
  await new BlogClient({ apiKey: KEY, revalidate: 0 }).getArticles();

  assert.equal(calls[0]?.init.next, undefined);
  assert.equal(calls[0]?.init.cache, 'no-store');
});

void test('still accepts a bare key string, as 0.1.x did', async () => {
  const calls = stubFetch();
  await new BlogClient(KEY).getArticles();
  const headers = calls[0]?.init.headers as Record<string, string>;
  assert.equal(headers.Authorization, `Bearer ${KEY}`);
});

void test('builds next.config remotePatterns from reported hosts', () => {
  assert.deepEqual(remotePatterns(['cdn.example.com', 'images.unsplash.com']), [
    { protocol: 'https', hostname: 'cdn.example.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ]);
  assert.deepEqual(remotePatterns([]), []);
});

void test('sitemap entries keep the Next MetadataRoute shape', () => {
  const entries = blogSitemapEntries(
    [
      {
        slug: 'first',
        publishedAt: null,
        updatedAt: '2026-05-02T09:00:00.000Z',
        images: [{ url: 'https://cdn/a.png', alt: 'A' }],
      },
    ],
    'https://example.com/',
    '/blog/',
  );

  assert.equal(entries[0]?.url, 'https://example.com/blog/first');
  assert.deepEqual(entries[0]?.lastModified, new Date('2026-05-02T09:00:00.000Z'));
  assert.deepEqual(entries[0]?.images, ['https://cdn/a.png']);
});

void test('sitemap entries omit images entirely when there are none', () => {
  const entries = blogSitemapEntries(
    [{ slug: 'a', publishedAt: null, updatedAt: '2026-05-02T09:00:00.000Z', images: [] }],
    'https://example.com',
  );
  // An empty array would render as a stray element in the Next sitemap output.
  assert.equal('images' in entries[0]!, false);
});
