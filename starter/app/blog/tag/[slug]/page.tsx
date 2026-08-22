import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pageCount } from '@rankveo/next';
import { ArticleCard } from '../../ArticleCard';
import { Pagination } from '../../Pagination';
import { BLOG_BASE_PATH, PAGE_SIZE, SITE_URL, blog, toApiPage } from '../../rankveo';
import '../../blog.css';

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateStaticParams() {
  const { tags } = await blog.getTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { tags } = await blog.getTags();
  const tag = tags.find((entry) => entry.slug === slug);
  if (!tag) return {};

  return {
    title: `${tag.name} articles`,
    description: `Everything we have written about ${tag.name}.`,
    alternates: { canonical: `${SITE_URL}${BLOG_BASE_PATH}/tag/${tag.slug}` },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const page = toApiPage(search.page);

  const [{ tags }, { articles, total }] = await Promise.all([
    blog.getTags(),
    blog.getTagArticles(slug, { page, limit: PAGE_SIZE }),
  ]);

  // An unknown tag is a 404 rather than an empty page, so a mistyped URL does
  // not become a thin indexable page.
  const tag = tags.find((entry) => entry.slug === slug);
  if (!tag) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="mb-12">
        <Link href={BLOG_BASE_PATH} className="text-sm text-neutral-500 hover:underline">
          ← All articles
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{tag.name}</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          {total} {total === 1 ? 'article' : 'articles'}
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Pagination
        currentPage={page + 1}
        totalPages={pageCount(total, PAGE_SIZE)}
        basePath={`${BLOG_BASE_PATH}/tag/${tag.slug}`}
      />
    </main>
  );
}
