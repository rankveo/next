# rankveo blog starter

Copy these into your Next.js App Router project:

```bash
cp -r node_modules/@rankveo/next/starter/app/blog app/blog
cp -r node_modules/@rankveo/next/starter/app/api/rankveo app/api/rankveo
```

Then edit `app/blog/rankveo.ts` — it holds the client, the base path, your site
URL, and the page size. Everything else follows from those.

## Files

| File | What it does |
| --- | --- |
| `rankveo.ts` | Client and blog-wide settings. Start here. |
| `page.tsx` | Paginated listing |
| `[slug]/page.tsx` | Article page, metadata, JSON-LD |
| `tag/[slug]/page.tsx` | Tag listing |
| `sitemap.ts` | `/blog/sitemap.xml`, including image entries |
| `ArticleCard.tsx`, `Pagination.tsx` | Listing pieces |
| `blog.css` | Styles the article HTML. See below. |
| `../api/rankveo/revalidate/route.ts` | Lets rankveo push cache invalidation on publish |

## About `blog.css`

Article bodies come back as HTML. `blog.css` styles them under a single
`.article-body` class, with no framework dependency — edit it to match your
design system.

It exists because CSS resets are hostile to raw HTML. Tailwind's preflight ships
`ol,ul,menu{list-style:none}` and `h1..h6{font-size:inherit;font-weight:inherit}`,
so without something restoring them an article renders as one flat wall of text —
headings indistinguishable from body copy, lists with no markers.

If you already use `@tailwindcss/typography`, replace `article-body` with
`prose prose-neutral dark:prose-invert` and delete this file. Make sure the plugin
is registered in your CSS (`@plugin "@tailwindcss/typography";` in Tailwind v4),
not merely installed — otherwise `prose` does nothing and you get the same flat
wall of text.

## Card styling

The listing components use Tailwind utility classes. If you do not use Tailwind,
replace those class names; nothing else depends on it.
