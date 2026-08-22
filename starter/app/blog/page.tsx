import type { Metadata } from 'next';
import Link from 'next/link';
import { pageCount } from '@rankveo/next';
import { ArticleCard } from './ArticleCard';
import { Pagination } from './Pagination';
import { BLOG_BASE_PATH, PAGE_SIZE, SITE_URL, blog, toApiPage } from './rankveo';
import './blog.css';

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
    <main className="blog-index">
      <header>
        <h1>Blog</h1>
        <p>
          {total} {total === 1 ? 'article' : 'articles'}
          {params.tag ? ` tagged “${params.tag}”` : ''}
          {params.category ? ` in “${params.category}”` : ''}
        </p>
        {params.tag || params.category ? (
          <Link href={BLOG_BASE_PATH} >
            Clear filter
          </Link>
        ) : null}
      </header>

      {articles.length === 0 ? (
        <p>
          Nothing published yet. Approve and publish an article in rankveo and it appears here.
        </p>
      ) : (
        <div className="blog-grid">
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
