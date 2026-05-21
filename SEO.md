# SEO notes

## Current canonical domain

Primary URL for indexing:

`https://www.shepit-house.com.ua/`

This is the active Railway-connected domain at the moment. The apex domain `shepit-house.com.ua` is not treated as canonical until DNS/redirect handling is finalized.

## Implemented now

- Added `<link rel="canonical" href="https://www.shepit-house.com.ua/">`.
- Updated Open Graph URL/image to the `www` domain.
- Added Twitter Card meta tags.
- Updated JSON-LD with `url`, `image`, `telephone`, and the current address.
- Added `robots.txt`.
- Added `sitemap.xml` with the current single public URL.

## Sitemap policy

Current sitemap contains only:

- `https://www.shepit-house.com.ua/`

Blog articles, privacy policy, and site map are currently modal content, not separate URLs. They should not be added to XML sitemap until they become real indexable routes.

## Redirect policy

Recommended current redirect:

`https://shepit-house.com.ua/` -> `https://www.shepit-house.com.ua/`

Use a permanent `301` redirect when the apex domain is available through DNS/provider tooling. This should be configured at DNS/hosting/proxy level, not inside the landing page HTML.

## Future if canonical changes to non-www

If the final production decision is to use:

`https://shepit-house.com.ua/`

Then update:

- `canonical` in `index.html`
- `og:url` in `index.html`
- `og:image` / `twitter:image` if image URLs change
- JSON-LD `url` and `image`
- `robots.txt` sitemap URL
- every `<loc>` inside `sitemap.xml`
- Railway custom domains
- 301 redirect direction: `www` -> apex

## Future indexable pages

When real routes are added, create/update sitemap entries for:

- `/blog/`
- individual blog articles
- `/privacy-policy/`
- `/sitemap/` or another HTML site-map route if needed

Each real page should have its own:

- `<title>`
- meta description
- canonical URL
- Open Graph tags
- meaningful `h1`
- sitemap entry
