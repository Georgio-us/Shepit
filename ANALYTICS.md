# Analytics Tracking

This project uses two tracking snippets that must be present on every public HTML page.

## Active IDs

- Google tag / GA4: `G-BZKXJY7T45`
- Meta Pixel: `1008871435016680`

## Current Pages Covered

The snippets are currently installed on:

- `index.html`
- `blog/index.html`
- `blog/oglyad-infrastruktury/index.html`
- `blog/chomu-taunhaus-kompromis/index.html`
- `blog/rozterminuvannya-vid-zabudovnyka/index.html`
- `privacy-policy/index.html`
- `sitemap/index.html`

## Rule For New URLs

When adding a new URL as a real HTML page, add both snippets inside `<head>`:

1. Google tag `gtag.js`
2. Meta Pixel script and `noscript` fallback

Do not add duplicate copies of the same snippet to a page.

## Google Tag Snippet

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-BZKXJY7T45"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-BZKXJY7T45');
</script>
```

## Meta Pixel Snippet

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1008871435016680');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1008871435016680&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

## Verification Command

Run this after adding new pages:

```bash
rg -n "G-BZKXJY7T45|1008871435016680" -g '*.html' .
```

Each public `.html` page should show both IDs.
