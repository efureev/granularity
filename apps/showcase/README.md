# `apps/showcase`

Витрина дизайн-системы: живые демо всех компонентов, директив, композаблов и утилит
пакета. Публикуется на GitHub Pages (`base` — `/granularity/` в build, `/` в dev).

Одновременно это площадка автоматических проверок качества: e2e-слой a11y и визуальной
регрессии гоняется именно по её страницам — см. `e2e/README.md`.

## Как витрина видит библиотеку

Через **собранный `dist`**, а не исходники. После любой правки библиотеки нужно
пересобрать пакет и перегенерировать контракты:

```bash
yarn workspace @feugene/granularity build
yarn workspace @feugene/granularity-showcase generate:api
yarn workspace @feugene/granularity-showcase generate:search
```

`generate:api` читает реестр `granular-provider` и парсит `.vue` через
`vue-component-meta` → `src/content/generated/componentApi.generated.json`.
`generate:search` строит поисковый индекс. Оба файла **генерируемые, руками не
править**.

## Структура

| Путь | Что там |
| --- | --- |
| `src/demos/components/gr-x/` | демо-компоненты (`Gr<X><Case>Demo.vue`) |
| `src/pages/ComponentDetailPage.vue` | реестр `previewKey` → демо |
| `src/content/component-docs/examples/` | описания примеров + строка `code` |
| `src/content/component-docs/overrides.ts` | doc-meta компонента, блок «О компоненте» |
| `src/content/handAuthored.ts` | группы каталога, англоязычные `summary`, теги |
| `src/i18n/locales/` | локали витрины |
| `src/content/generated/` | сгенерированные API и поисковый индекс |
| `e2e/` | Playwright: axe + скриншоты |

Правило верности примеров: строка `code` в `*.examples.ts` обязана **буквально**
совпадать с содержимым демо-`.vue`. Расхождение — баг витрины.

## Команды

```bash
yarn dev:showcase            # из корня: собирает библиотеку, генерит контракты, поднимает dev
yarn build:showcase
yarn test:showcase           # юнит-тесты контента и реестров
```

Проверять изменения глазами — только через dev-сервер (`npx vite --port <N>`, base `/`).
`vite preview` под базой `/granularity/` даёт нестабильный SPA-фолбэк на глубоких
ссылках и белые страницы.
