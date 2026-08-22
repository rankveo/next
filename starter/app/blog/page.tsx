import type { Metadata } from 'next';
import Link from 'next/link';
import { pageCount } from '@rankveo/next';
import { ArticleCard } from './ArticleCard';
import { Pagination } from './Pagination';
import { BLOG_BASE_PATH, PAGE_SIZE, SITE_URL, blog, toApiPage } from './rankveo';

// Regenerate the listing hourly. Swap for `export const dynamic = 'force-dynamic'`
// if you would rather fetch on every request.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, research, and product notes.',
  alternates: { canonical: `${SITE_URL}${BLOG_BASE_PATH}` },
};

type SearchParams = Promise<{ page?: string; tag?: string; category?: string }>;

export default async function BlogIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = toApiPage(params.page);

  const { articles, total } = await blog.getArticles({
    page,
    limit: PAGE_SIZE,
    tag: params.tag,
    category: params.category,
  });

  const totalPages = pageCount(total, PAGE_SIZE);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          {total} {total === 1 ? 'article' : 'articles'}
          {params.tag ? ` tagged “${params.tag}”` : ''}
          {params.category ? ` in “${params.category}”` : ''}
        </p>
        {params.tag || params.category ? (
          <Link href={BLOG_BASE_PATH} className="mt-4 inline-block text-sm underline">
            Clear filter
          </Link>
        ) : null}
      </header>

      {articles.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">
          Nothing published yet. Approve and publish an article in rankveo and it appears here.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page + 1}
        totalPages={totalPages}
        basePath={BLOG_BASE_PATH}
      />
    </main>
  );
}
