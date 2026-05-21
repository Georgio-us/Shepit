# Tech Debt / TODO (Shepit Landing)

Оновлено: 2026-05-21

## Поточне тимчасове рішення

- Політика конфіденційності відкривається у модалці `#privacy-modal` на головній сторінці.
- Карта сайту відкривається у модалці `#sitemap-modal` на головній сторінці.
- Блог (список статей + 3 статті) відкривається модалками:
  - `#blog-index-modal`
  - `#blog-article-1-modal`
  - `#blog-article-2-modal`
  - `#blog-article-3-modal`
- Канонічний домен для SEO зараз: `https://www.shepit-house.com.ua/`.
- XML sitemap вже додано: `/sitemap.xml`.
- Robots файл вже додано: `/robots.txt`.

## Що повернути після затвердження URL-структури

1. Винести контент політики на окремий URL `/privacy-policy`.
2. Винести HTML sitemap на окремий URL `/sitemap`.
3. Винести блог на окремі URL:
   - `/blog`
   - `/blog/<slug-article-1>`
   - `/blog/<slug-article-2>`
   - `/blog/<slug-article-3>`
4. Замінити футерні та блог-посилання з модалок на реальні URL.
5. Додати canonical, OpenGraph і Twitter meta для кожної окремої сторінки.
6. Оновити `sitemap.xml`, коли з'являться реальні URL сторінок.
7. Налаштувати 301 редирект `https://shepit-house.com.ua/` -> `https://www.shepit-house.com.ua/`.

## Нотатки

- Контент у модалках зараз шаблонний/чернетковий і підлягає редактурі після погодження фінальних текстів.
- Після повернення URL-структури потрібно повторно перевірити внутрішню перелінковку та sitemap.
- Деталі SEO-рішення зафіксовані у `SEO.md`.
