import Image from 'next/image';
import Link from 'next/link';
import { formatPublishedDate, type BlogArticleSummary } from '@rankveo/next';
import { BLOG_BASE_PATH } from './rankveo';

export function ArticleCard({ article }: { article: BlogArticleSummary }) {
  const published = formatPublishedDate(article);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700">
      {article.image ? (
        <Link href={`${BLOG_BASE_PATH}/${article.slug}`} className="relative block aspect-[16/9]">
          <Image
            src={article.image.url}
            alt={article.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {article.category ? (
          <Link
            href={`${BLOG_BASE_PATH}?category=${article.category.slug}`}
            className="text-xs font-medium uppercase tracking-wide text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {article.category.name}
          </Link>
        ) : null}

        <h2 className="text-lg font-semibold leading-snug">
          <Link href={`${BLOG_BASE_PATH}/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h2>

        <p className="line-clamp-3 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
          {article.metaDescription}
        </p>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {published ? (
            <time dateTime={article.publishedAt ?? undefined}>{published}</time>
          ) : null}
          {published ? <span aria-hidden="true">·</span> : null}
          <span>{article.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
