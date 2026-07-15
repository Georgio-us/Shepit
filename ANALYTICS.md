# Analytics Tracking

The site uses one shared loader, `analytics-v2.js`, on every public HTML page.
It is the only place that initializes Google Tag Manager, GA4 and Meta Pixel.

## Active IDs

- Google tag / GA4: `G-BZKXJY7T45`
- Google Tag Manager: `GTM-53F9CWJ4`
- Meta Pixel: `1008871435016680`

## Loader ownership and duplicate prevention

`analytics-v2.js` sends the GA4 page view and Meta `PageView` directly, and loads
GTM for container-managed tags. The GTM container must not also contain a GA4
Configuration/Google tag for `G-BZKXJY7T45` or a Meta Pixel base tag for
`1008871435016680`; either would duplicate page views. Do not add provider
snippets to individual HTML pages.

## Current Pages Covered

The shared loader is installed on the homepage, residences catalog and detail
pages, calculator, blog and all three articles, privacy policy, sitemap, and
`404.html`.

## Rule For New URLs

When adding a new public HTML page, include `analytics-v2.js` once in `<head>` and
do not copy separate GA or Meta snippets into the page unless there is a specific
integration reason.

## Events

The shared layer records CTA and conversion-intent events for application-modal
opens, form submit attempts, phone, Telegram and Viber clicks, contact-widget opens,
residence and calculator navigation, masterplan interactions, video and FAQ opens,
newsletter submit attempts, and cookie-notice acceptance.

Only a successful `POST /api/lead` sends `generate_lead`. This one event reaches
GA4 and Meta Pixel (`Lead`) through `window.shepitTrack`, so failed submissions do
not become conversions. The successful newsletter response sends GA4 `sign_up`
with `method: newsletter`.

No personal data is sent as event parameters.

## Consent status

The current loader starts analytics immediately. A consent-mode implementation is
not present; it must be added only after the required cookie/legal policy is agreed.

## Verification

Run these checks after adding new pages:

```bash
node --check analytics-v2.js
rg -l "analytics-v2.js" -g '*.html' .
rg -n -i "googletagmanager|gtag/js|connect\\.facebook\\.net" --glob '*.html' .
```

Each public `.html` page should load the shared analytics layer exactly once. The
last command must return no inline provider snippets.
