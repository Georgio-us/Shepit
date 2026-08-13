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

## Lead-form funnel

All event parameters are technical labels only: no name, phone, e-mail, or entered
form value is passed to GA4 or Meta.

| Event | Meaning | Key parameters |
| --- | --- | --- |
| `form_view` | At least 35% of the form entered the viewport. | `form_name` |
| `form_start` | A visitor focused the first field in that form. | `form_name`, `first_field` |
| `form_submit_attempt` | The browser dispatched a submit action. | `form_name` |
| `form_validation_error` | Native browser validation prevented submission. | `form_name`, `field_name` |
| `form_submit_blocked` | JavaScript stopped it for a known required step, if such a step is added later. | `form_name`, `reason` |
| `form_submit_failure` | The request to `/api/lead` failed or was rejected. | `form_name`, `reason` |
| `form_submit_success` | `/api/lead` confirmed delivery to at least one lead channel. | `form_name` |
| `lead_received` | Alias of the confirmed successful lead, for a clear GA4 conversion/report. | `form_name` |
| `generate_lead` | Existing conversion event and the Meta Pixel `Lead` event. | `form_name` |

`generate_lead`, `lead_received`, and `form_submit_success` are emitted together
only after a successful `/api/lead` response. Mark **`generate_lead`** as the main
GA4 conversion (or `lead_received` if a more literal name is preferred); do not mark
both, otherwise one lead will be counted twice.

The tracked forms are `application_modal`, `contact_form`, `calculator`,
`residences_catalog_inquiry`, and `residence_inquiry`. The shared layer also records
CTA and intent events for application-modal opens, phone, Telegram and Viber clicks,
contact-widget opens, residence and calculator navigation, masterplan interactions,
video and FAQ opens, newsletter submit attempts, and cookie-notice acceptance.

Opening a catalog consultation form is `catalog_inquiry_open`; opening a residence
consultation section is `residence_inquiry_open`. A master-plan CTA is recorded as
`application_modal_open` with `source: masterplan`.
The calculator buttons on the first screen use `calculator_open` with
`source: hero`, so their effectiveness can be compared with other calculator links.

## Residence opens

Each residence has its own event, so it is immediately visible in the GA4 event
list without filtering a shared event:

| GA4 event | Residence | `source` values |
| --- | --- | --- |
| `t92_open` | Таунхаус T92 | `Hero section`, `Секція «Наші будинки»`, `Все резиденции`, `Все резиденции — сравнение`, `Все резиденции — генплан`, `Карточка резиденции`, `Карточка резиденции — генплан` |
| `t102_open` | Таунхаус T102 | Same sources, where that residence is available |
| `d101_open` | Дуплекс D101 | Same sources, where that residence is available |

GA4 event names cannot contain spaces, so `t92_open`, `t102_open`, and
`d101_open` are the valid technical equivalents of “T92 Open”, “T102 Open”,
and “D101 Open”. Each also sends the readable `residence_name` parameter.
Register the event-scoped `source` parameter as a custom dimension in GA4
(for example, **Источник открытия резиденции**) to use it in standard reports
and Explorations.

### GA4 setup: «Источник открытия резиденции»

1. Open the SHEPIT HOUSE GA4 property and go to **Admin → Custom definitions**.
2. Choose **Create custom dimension** and enter:
   - Dimension name: `Источник открытия резиденции`
   - Scope: `Event`
   - Description: `Место, откуда пользователь открыл T92, T102 или D101`
   - Event parameter: `source`
   - Reporting parameter: `Источник открытия резиденции`
   - Type: `Text`
3. Save the dimension. Do not mark `t92_open`, `t102_open`, or `d101_open` as
   conversions: they are product-interest signals, not completed leads.

### GA4 verification

After deployment, open **Admin → DebugView** (or Realtime), visit the site, and
open one residence from each available source. Check that one of the following
events arrives immediately with the expected `source` parameter:

| Test action | Expected event | Expected `source` |
| --- | --- | --- |
| Open T92 from the first screen | `t92_open` | `Hero section` |
| Open D101 from “Наші будинки” | `d101_open` | `Секція «Наші будинки»` |
| Open T102 from the catalog | `t102_open` | `Все резиденции` |
| Switch to another model on a residence page | matching event | `Карточка резиденции` |

The event is visible in DebugView immediately. The custom dimension can take up
to 24 hours before it becomes available in standard reports and Explorations;
it only applies to events collected after the dimension was created.

The successful newsletter response sends GA4 `sign_up` with `method: newsletter`.

## Lead delivery resilience

The server sends every lead to Telegram and Kommo independently. A response is
successful when at least one channel accepts it, so a missing or expired Kommo token
does not stop Telegram leads. A failure of either channel is written to the server
log; a failure of both returns an error and produces `form_submit_failure` in GA4.

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
