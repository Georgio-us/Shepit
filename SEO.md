# SHEPIT HOUSE — SEO specification

## Scope

This document describes the single public SEO surface of SHEPIT HOUSE. `index.html` is the homepage; all other indexable pages have their own stable URL. There are no alternate-version URLs in this site structure.

## Canonical URL policy

The canonical host is:

`https://www.shepit-house.com.ua/`

Every public HTML page declares a self-referencing canonical URL on that host. The same URL is used in `og:url`, structured data and `sitemap.xml`.

When the host is configured, the non-canonical host must permanently redirect to the canonical host at the DNS, CDN or hosting layer. Do not use `robots.txt` to solve canonicalization.

## Indexable URL set

Only the following URLs belong in `sitemap.xml`:

- `/`
- `/residences/`
- `/residences/t92/`
- `/residences/t102/`
- `/residences/d101/`
- `/calculator/`
- `/blog/`
- `/blog/chomu-taunhaus-kompromis/`
- `/blog/oglyad-infrastruktury/`
- `/blog/rozterminuvannya-vid-zabudovnyka/`
- `/privacy-policy/`
- `/sitemap/`

The 404 page is deliberately excluded and has `noindex,follow`.

## Metadata contract

Each indexable page must have:

- a unique `title` and meta description;
- a self-referencing canonical URL;
- `og:type`, `og:site_name`, `og:locale`, `og:url`, `og:title`, `og:description` and `og:image`;
- `twitter:card`, `twitter:title`, `twitter:description` and `twitter:image`;
- one meaningful visible `h1`.

Blog articles additionally carry `Article` structured data. The homepage carries `Organization` and `WebSite` JSON-LD with the project contact details. Structured data must reflect visible, current information only.

## Crawling and sitemap

`robots.txt` permits crawling of the public site and points only to `https://www.shepit-house.com.ua/sitemap.xml`.

`sitemap.xml` is the source of truth for indexable URLs. A URL may be added only after its page, self-canonical and internal links are ready. Update `lastmod` only when the page content has materially changed.

## Release checks

Before publishing the site to its canonical host:

1. Verify every sitemap URL returns `200` and has the matching self-canonical.
2. Verify non-existent and retired URLs return `404` with the noindex page.
3. Confirm the canonical host, `www`/apex redirect and HTTPS at the hosting layer.
4. Validate homepage organization JSON-LD and article JSON-LD.
5. Submit the final sitemap in the Search Console property for the canonical host.
