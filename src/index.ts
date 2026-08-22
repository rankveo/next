import {
  BlogClient as CoreBlogClient,
  sitemapXml,
  type BlogClientOptions as CoreOptions,
  type BlogSitemapEntry,
} from '@rankveo/client';

// Everything framework-neutral is re-exported rather than redefined, so
// `instanceof RankveoBlogError` keeps working across package boundaries.
export {
  ArticleNotFoundError,
  RankveoBlogError,
  absoluteArticleUrl,
  articleJsonLd,
  articleUrl,
  escapeXml,
  formatPublishedDate,
  pageCount,
  rssXml,
  sitemapXml,
  verifyRevalidateSecret,
} from '@rankveo/client';

export type {
  BlogArticle,
  BlogArticleList,
  BlogArticleSummary,
  BlogImage,
  BlogRelatedArticle,
  BlogSite,
  BlogSitemap,
  BlogSitemapEntry,
  BlogTag,
  BlogTagCount,
  BlogTagList,
  ListArticlesOptions,
  UrlOptions,
} from '@rankveo/client';

const DEFAULT_REVALIDATE_SECONDS = 3_600;

export interface BlogClientOptions extends Omit<CoreOptions, 'requestInit'> {
  /**
   * Seconds Next.js should cache each response. Defaults to 3600 (one hour).
   * Pass `0` to fetch on every request.
   */
  revalidate?: number;
}

/**
 * Reads published articles from a rankveo workspace, with Next.js cache hints.
 *
 * Server-side only, and enforced: constructing this in a browser throws, because
 * the key would already be in a bundle a visitor can read.
 */
export class BlogClient extends CoreBlogClient {
  constructor(options: BlogClientOptions | string = {}) {
    const resolved = typeof options === 'string' ? { apiKey: options } : options;
    const revalidate = resolved.revalidate ?? DEFAULT_REVALIDATE_SECONDS;
    super({
      ...resolved,
      // The one genuinely Next-specific thing in the package. It lives here
      // rather than in core because `next: {…}` and `cache: 'no-store'` are not
      // understood by every runtime — Workers' fetch has thrown on the latter.
      requestInit: revalidate > 0 ? { next: { revalidate } } : { cache: 'no-store' },
    } as CoreOptions);
  }
}

/**
 * The `images.remotePatterns` value for `next.config.js`, built from the hosts
 * your articles actually use.
 *
 * ```ts
 * const { imageHosts } = await blog.getSite();
 * console.log(JSON.stringify(remotePatterns(imageHosts), null, 2));
 * ```
 */
export function remotePatterns(
  hosts: string[],
): Array<{ protocol: 'https'; hostname: string }> {
  return hosts.map((hostname) => ({ protocol: 'https' as const, hostname }));
}

/**
 * Maps the sitemap feed onto Next.js `MetadataRoute.Sitemap` entries. Next is
 * the only supported framework with a native sitemap object format; everywhere
 * else, use `sitemapXml` from core.
 */
export function blogSitemapEntries(
  entries: BlogSitemapEntry[],
  siteUrl: string,
  basePath = '/blog',
): Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'weekly';
  priority: number;
  images?: string[];
}> {
  const origin = siteUrl.replace(/\/+$/, '');
  const base = basePath.replace(/\/+$/, '');
  return entries.map((entry) => {
    const images = (entry.images ?? []).map((image) => image.url).filter(Boolean);
    return {
      url: `${origin}${base}/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      ...(images.length ? { images } : {}),
    };
  });
}

/** Re-exported so a starter can build a full sitemap document if it prefers. */
export { sitemapXml as blogSitemapXml };
