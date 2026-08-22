import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPublishedDate } from '@rankveo/next';
import { BLOG_BASE_PATH, SITE_URL, blog } from '../rankveo';
import '../blog.css';

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

// Pre-renders every published article at build time. Remove this if your archive
// is large enough that you would rather render on first request.
export async function generateStaticParams() {
  const { articles } = await blog.getSitemap();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await blog.findArticle(slug);
  if (!article) return {};

  const url = `${SITE_URL}${BLOG_BASE_PATH}/${article.slug}`;
  // Open Graph accepts several images and picks the best fit, so offer every
  // image on the page with the featured one first.
  const images = article.images.length
    ? article.images.map((image) => ({ url: image.url, alt: image.alt }))
    : undefined;

  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.metaDescription,
      url,
      images,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      tags: article.tags.map((tag) => tag.name),
    },
    twitter: {
      card: article.image ? 'summary_large_image' : 'summary',
      title: article.title,
      description: article.metaDescription,
      images,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await blog.findArticle(slug);
  if (!article) notFound();

  const published = formatPublishedDate(article);
  const url = `${SITE_URL}${BLOG_BASE_PATH}/${article.slug}`;

  // Article structured data, so search engines and AI systems can attribute the
  // piece to your site rather than guessing.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription,
    mainEntityOfPage: url,
    url,
    // Every image on the page, so Google can associate all of them with the
    // article rather than just the hero.
    ...(article.images.length ? { image: article.images.map((image) => image.url) } : {}),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    dateModified: article.updatedAt,
    wordCount: article.wordCount,
    keywords: article.tags.map((tag) => tag.name).join(', '),
  };

  return (
    <main className="blog-article">
      <script
        type="application/ld+json"
        // Serialized server-side from our own API response, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav>
        <Link href={BLOG_BASE_PATH} >
          ← All articles
        </Link>
      </nav>

      <header>
        {article.category ? (
          <Link
            href={`${BLOG_BASE_PATH}?category=${article.category.slug}`}
            
          >
            {article.category.name}
          </Link>
        ) : null}

        <h1>
          {article.title}
        </h1>

        <div className="blog-meta">
          {published ? (
            <time dateTime={article.publishedAt ?? undefined}>{published}</time>
          ) : null}
          <span>{article.readingTime} min read</span>
        </div>
      </header>

      {/*
        Only a genuinely featured image becomes the hero. When an article has no
        featured image, `article.image` falls back to its first body image — and
        that one is already rendered by the article HTML below, so showing it
        here too would print it twice.
      */}
      {article.image?.role === 'featured' ? (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={article.image.url}
            alt={article.image.alt}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      {/*
        The API returns the article body as HTML with no wrapper element, so it
        goes straight in. `article-body` (see ../blog.css) styles it without
        depending on a Tailwind plugin — a CSS reset would otherwise flatten the
        headings and strip the list markers.
      */}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      {article.tags.length > 0 ? (
        <footer className="blog-tags">
          {article.tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`${BLOG_BASE_PATH}/tag/${tag.slug}`}
              
            >
              {tag.name}
            </Link>
          ))}
        </footer>
      ) : null}

      {article.relatedPosts.length > 0 ? (
        <section className="blog-related">
          <h2>Keep reading</h2>
          <ul>
            {article.relatedPosts.map((related) => (
              <li key={related.id}>
                <Link
                  href={`${BLOG_BASE_PATH}/${related.slug}`}
                  
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
