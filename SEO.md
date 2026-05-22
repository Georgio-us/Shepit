# SEO notes

## Current canonical domain

Primary URL for indexing:

`https://www.shepit-house.com.ua/`

This is the active Railway-connected domain at the moment. The apex domain `shepit-house.com.ua` is not treated as canonical until DNS/redirect handling is finalized.

## Implemented now

- Added `<link rel="canonical" href="https://www.shepit-house.com.ua/">` on the homepage.
- Updated Open Graph URL/image to the `www` domain.
- Added Twitter Card meta tags.
- Updated JSON-LD with `url`, `image`, `telephone`, and the current address.
- Added `robots.txt`.
- Added `sitemap.xml` with the current public URLs.
- Added real indexable routes:
  - `/blog/`
  - `/blog/chomu-taunhaus-kompromis/`
  - `/blog/oglyad-infrastruktury/`
  - `/blog/rozterminuvannya-vid-zabudovnyka/`
  - `/privacy-policy/`
  - `/sitemap/`

## Sitemap policy

Current sitemap contains:

- `https://www.shepit-house.com.ua/`
- `https://www.shepit-house.com.ua/blog/`
- `https://www.shepit-house.com.ua/blog/chomu-taunhaus-kompromis/`
- `https://www.shepit-house.com.ua/blog/oglyad-infrastruktury/`
- `https://www.shepit-house.com.ua/blog/rozterminuvannya-vid-zabudovnyka/`
- `https://www.shepit-house.com.ua/privacy-policy/`
- `https://www.shepit-house.com.ua/sitemap/`

Each real page should keep its own title, meta description, canonical URL, Open Graph tags, meaningful `h1`, and sitemap entry.

## Redirect policy

Recommended current redirect:

`https://shepit-house.com.ua/` -> `https://www.shepit-house.com.ua/`

Use a permanent `301` redirect when the apex domain is available through DNS/provider tooling, Cloudflare, or hosting-level redirects. This should be configured outside the landing page HTML.

## Future if canonical changes to non-www

If the final production decision is to use:

`https://shepit-house.com.ua/`

Then update:

- `canonical` in all HTML pages
- `og:url` in all HTML pages
- `og:image` / `twitter:image` if image URLs change
- JSON-LD `url` and `image`
- `robots.txt` sitemap URL
- every `<loc>` inside `sitemap.xml`
- Railway custom domains
- 301 redirect direction: `www` -> apex

## Future SEO/content work

- Replace placeholder/fallback social links with real profiles.
- Replace placeholder video with final video embed or agreed reels-style format.
- Replace temporary/gallery images when final media pack is approved.
- Review legal text before production indexing.
