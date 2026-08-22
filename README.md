# @rankveo/next

Run your [rankveo](https://rankveo.com/next) blog on a Next.js App Router site.
rankveo is the CMS: you approve and publish there, your site reads the article
and renders it under your own domain, design, and URLs. Nothing to sync, no
second copy of the content.

```bash
npm install @rankveo/next
```

Create a **blog** API key in rankveo under **Settings → API keys**:

```env
RANKVEO_BLOG_API_KEY=rk_your_key_here
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

Blog keys work on every plan and only read published articles, so a leaked one
exposes nothing that is not already on your site.

## Quick start

```ts
import { BlogClient } from '@rankveo/next';

const blog = new BlogClient();
const { articles, total } = await blog.getArticles({ page: 0, limit: 10 });
const article = await blog.getArticle('how-to-rank-in-ai-answers');
```

Server-side only, and enforced: constructing the client in a browser throws,
because the key would already be in a bundle a visitor can read.

## Starter

```bash
cp -r node_modules/@rankveo/next/starter/app/blog app/blog
cp -r node_modules/@rankveo/next/starter/app/api/rankveo app/api/rankveo
```

| Route | File |
| --- | --- |
| `/blog` | `app/blog/page.tsx` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` — metadata and JSON-LD |
| `/blog/tag/[slug]` | `app/blog/tag/[slug]/page.tsx` |
| `/blog/sitemap.xml` | `app/blog/sitemap.ts` |
| `POST /api/rankveo/revalidate` | push invalidation on publish |

Set your site URL and page size in `app/blog/rankveo.ts`.

## Images

Ask the API which hosts your articles use rather than guessing:

```ts
import { remotePatterns } from '@rankveo/next';

const { imageHosts } = await blog.getSite();
console.log(JSON.stringify(remotePatterns(imageHosts), null, 2));
```

Paste into `next.config.js` under `images.remotePatterns`. Re-run it when you
start using a new host — a missing one fails the build the first time an article
using it is pre-rendered.

## Article styling

`starter/app/blog/blog.css` styles the article HTML under `.article-body`. It
has no dependencies and is meant to be edited.

Do not drop it and rely on your own reset. Tailwind's preflight — and most other
resets — ship `ol, ul, menu { list-style: none }` and
`h1…h6 { font-size: inherit; font-weight: inherit }`. With those in force and
nothing restoring them, an article renders as one flat wall of text.

Already using `@tailwindcss/typography`? Swap `article-body` for
`prose prose-neutral dark:prose-invert`, and make sure the plugin is
*registered* (`@plugin "@tailwindcss/typography";` in Tailwind v4), not merely
installed — an unregistered plugin fails silently and produces the same wall of
text.

## Instant updates

Pages cache for an hour by default. Deploy the revalidate route, set
`RANKVEO_REVALIDATE_SECRET`, and paste the URL and secret into
rankveo → Integrations → Next.js. rankveo then POSTs whenever an article is
published, edited while live, or taken down, and the page drops out of cache
immediately.

## Things to know

- **Pagination is zero-based** in the API; URLs are one-based. The starter
  converts once, in `toApiPage`.
- **`article.html` is the body only.** Render it with `dangerouslySetInnerHTML`.
- **Body images are already inside `article.html`.** `article.images` lists them
  for host allowlisting, image sitemaps, and OG tags — not for a second render.
  Show a hero only when `image.role === 'featured'`.
- **`article.image` can be a body image.** With no featured image it falls back
  to the first one in the body, so cards are never blank.

Built on [`@rankveo/client`](https://github.com/rankveo/client), which works in
any JavaScript runtime.

---

[Docs and setup guide](https://rankveo.com/next) · [All integrations](https://rankveo.com)

MIT.
