import type { MetadataRoute } from 'next';
import { blogSitemapEntries } from '@rankveo/next';
import { BLOG_BASE_PATH, SITE_URL, blog } from './rankveo';

// Serves /blog/sitemap.xml. Submit it to Google Search Console on its own, or
// reference it from your root sitemap index.
//
// Google caps a sitemap at 50,000 URLs and 50MB. Split into a sitemap index if a
// blog ever approaches that.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles } = await blog.getSitemap();

  return [
    {
      url: `${SITE_URL}${BLOG_BASE_PATH}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogSitemapEntries(articles, SITE_URL, BLOG_BASE_PATH),
  ];
}
