import Image from 'next/image';
import Link from 'next/link';
import { formatPublishedDate, type BlogArticleSummary } from '@rankveo/next';
import { BLOG_BASE_PATH } from './rankveo';

export function ArticleCard({ article }: { article: BlogArticleSummary }) {
  const published = formatPublishedDate(article);
  const href = `${BLOG_BASE_PATH}/${article.slug}`;

  return (
    <article className="blog-card">
      {article.image ? (
        <Link href={href}>
          <Image
            src={article.image.url}
            alt={article.image.alt}
            width={article.image.width ?? 1200}
            height={article.image.height ?? 750}
          />
        </Link>
      ) : null}

      <div>
        {article.category ? (
          <span className="blog-card-category">{article.category.name}</span>
        ) : null}

        <h2>
          <Link href={href}>{article.title}</Link>
        </h2>

        <p>{article.metaDescription}</p>

        <div className="blog-meta">
          {published ? (
            <time dateTime={article.publishedAt ?? undefined}>{published}</time>
          ) : null}
          <span>{article.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
