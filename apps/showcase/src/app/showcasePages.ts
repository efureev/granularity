import {
  featuredComponentTitles,
  featuredDirectiveTitles,
  featuredUtilityTitles,
  showcaseComponentEntities,
  showcaseComposableEntities,
  showcaseDirectiveEntities,
  showcaseUtilityEntities,
} from './showcaseEntities.ts'

import type {
  ShowcasePage,
  ShowcaseSection,
} from './showcaseModel.ts'

export const showcaseComponentDetailSections: ShowcaseSection[] = [
  {
    id: 'overview',
    title: 'Component overview',
    description: 'Краткий контекст по месту компонента в пакете, registry metadata и текущему покрытию showcase.',
    bullets: [
      'Показываем роль компонента в каталоге и его hand-authored summary.',
      'Отражаем generated API coverage и package-level source links.',
      'Фиксируем, какие сценарии уже реализованы в showcase, а какие ещё планируются.',
    ],
  },
  {
    id: 'live-examples',
    title: 'Live examples',
    description: 'Компонентные сценарии должны раскрывать одну конкретную возможность за карточку, а не сваливать всё в один demo.',
    bullets: [
      'Каждый example card содержит живой preview, snippet и краткое пояснение.',
      'Сначала покрываем самые показательные capability-сценарии, затем сложные edge cases.',
      'Плановые сценарии явно отмечаются, чтобы roadmap был виден прямо на странице компонента.',
    ],
  },
  {
    id: 'api',
    title: 'Generated API',
    description: 'Страница использует автогенерированные `props` / `slots` / `events` / `methods` и не дублирует API вручную.',
    bullets: [
      'Generated metadata остаётся основным источником правды для API-таблиц.',
      'Fallback metadata применяется только там, где extraction-слоя недостаточно.',
      'Usage snippet живёт рядом с таблицами API и не расходится с публичным экспортом пакета.',
    ],
  },
  {
    id: 'integration-notes',
    title: 'Integration notes',
    description: 'Дополнительные замечания по доступности, зависимостям и связанным package-level артефактам.',
    bullets: [
      'Keyboard/accessibility пункты выделяются отдельно от визуальных примеров.',
      'Dependency notes показывают, есть ли связки с другими компонентами в registry.',
      'Source/export ссылки помогают быстро перейти к исходникам и публичному import path.',
    ],
  },
]

export const showcasePackageDetailSections: ShowcaseSection[] = [
  {
    id: 'overview',
    title: 'Package overview',
    description: 'Краткий контекст по роли сущности, её месту в пакете и практическому применению.',
    bullets: [
      'Фиксируем, какую задачу решает composable/directive/utility и где она полезна в продукте.',
      'Показываем hand-authored summary и narrative notes, которых недостаточно в generated metadata.',
      'Даём быстрый вход в API и практические integration patterns без переходов по нескольким страницам.',
    ],
  },
  {
    id: 'examples',
    title: 'Live examples',
    description: 'Каждая example-card показывает отдельный integration pattern и остаётся runnable reference.',
    bullets: [
      'Примеры должны объяснять реальный use-case, а не только синтаксис вызова.',
      'Preview и snippet рядом позволяют быстро сравнить happy-path и edge cases.',
      'Плановые сценарии остаются явно отмеченными, чтобы roadmap был виден прямо на detail page.',
    ],
  },
  {
    id: 'api',
    title: 'API',
    description: 'Package-level API документируется вручную и фокусируется на параметрах, return shape и error contract.',
    bullets: [
      'Команды видят не только сигнатуру, но и expected data shape для интеграции в feature-code.',
      'Ошибки, caveats и ограничения держатся рядом с основной API-таблицей.',
      'Структура остаётся совместимой с будущей генерацией metadata для package-level сущностей.',
    ],
  },
  {
    id: 'usage',
    title: 'Usage',
    description: 'Canonical import, практические рекомендации и caveats должны быть доступны в одном месте.',
    bullets: [
      'Copy-ready import и usage snippets сокращают время на старт интеграции.',
      'Caveats показывают, где потребуется дополнительная бизнес-логика или UI-обвязка.',
      'Этот блок остаётся главным bridge между docs и реальным application code.',
    ],
  },
  {
    id: 'integration',
    title: 'Integration notes',
    description: 'Ссылки на исходники, docs и зависимости помогают быстрее разобраться в связанной экосистеме пакета.',
    bullets: [
      'Source links должны вести к реальным package-файлам, а не к абстрактным import paths.',
      'Related docs и registry links ускоряют discoverability для новых участников команды.',
      'Dependencies и integration notes помогают увидеть контекст использования без чтения всего пакета.',
    ],
  },
]

export const showcasePages: ShowcasePage[] = [
  {
    name: 'overview',
    path: '/',
    title: 'Overview',
    shortTitle: 'Overview',
    eyebrow: 'Showcase / Overview',
    status: 'ready',
    description: 'Landing-страница витрины: позиционирование showcase, быстрый старт по интеграции и карта следующих этапов наполнения.',
    sections: [
      {
        id: 'mission',
        title: 'Mission',
        description: 'Объясняет, зачем нужен новый showcase и какой runtime/data-driven фундамент уже собран.',
        bullets: [
          'Позиционирование новой витрины как canonical docs-shell app поверх `@feugene/granularity`.',
          'Ключевые runtime-метрики: public registry, built-in themes и foundation tokens.',
          'Верхний hero сразу показывает, что showcase уже живёт не на legacy, а на новой shell-архитектуре.',
        ],
      },
      {
        id: 'quick-start',
        title: 'Быстрый старт',
        description: 'Показывает рекомендуемые интеграционные path-ы и реальные кодовые entrypoints пакета.',
        bullets: [
          'Quick-start через root API и готовые CSS exports.',
          'Granular component imports для точечного bundle.',
          'Production path через `UnoCSS` preset, если приложение уже собирает стили на своей стороне.',
        ],
      },
      {
        id: 'delivery-checklist',
        title: 'Delivery checklist',
        description: 'Фиксирует, что уже подтверждено текущими этапами плана и какой контент появляется следующим.',
        bullets: [
          'Showcase уже запускается, собирается и использует пакет как основной UI toolkit.',
          'Foundations теперь начинает закрывать onboarding-гайды, narrative docs и quick-start snippets.',
          'Следующий крупный шаг после foundations — живые entity pages для компонентов, директив и utilities.',
        ],
      },
      {
        id: 'roadmap',
        title: 'Roadmap',
        description: 'Показывает ближайшие продуктовые этапы наполнения showcase после foundations.',
        bullets: [
          `Сначала — сценарные страницы для ${featuredComponentTitles.join(', ')}.`,
          `Затем — интерактивные сценарии для ${featuredDirectiveTitles.join(' и ')}.`,
          `Utility coverage начнётся с ${featuredUtilityTitles.join(' и ')}.`,
        ],
      },
    ],
  },
  {
    name: 'foundations',
    path: '/foundations',
    title: 'Foundations',
    shortTitle: 'Foundations',
    eyebrow: 'Showcase / Foundations',
    status: 'ready',
    description: 'Базовая onboarding-документация: installation paths, styling layers, themes, tokens, UnoCSS и localization.',
    sections: [
      {
        id: 'installation',
        title: 'Installation paths',
        description: 'Прогрессия подключения `presetGranularity` (node-вариант `presetGranularNode`) — единственного поддерживаемого способа установки.',
        bullets: [
          'Quick-start snippets прямо в foundations page: от базового конфига до продвинутого `granularContent`.',
          'Narrative guidance подключена из `packages/granularity/docs/installation.md`.',
          'Один экран последовательно показывает, как наращивать опции `components`, `themes`, `layer` и `granularContent`.',
        ],
      },
      {
        id: 'styling',
        title: 'Styling, themes and tokens',
        description: 'Показывает границы между foundation layers, theme files и design tokens.',
        bullets: [
          'Подключены реальные excerpts из `styling.md`, `tokens.css`, `light.css` и `dark.css`.',
          'Есть явное разделение между `tokens`, theme layer и component-level CSS.',
          'Показан runtime-контракт через `initThemeEarly()` и `useTheme()`.',
        ],
      },
      {
        id: 'unocss',
        title: 'UnoCSS and localization',
        description: 'Закрывает production preset path и i18n-контракт пакета для хост-приложения.',
        bullets: [
          '`presetGranularNode` из `@feugene/unocss-preset-granular/node` — единственный поддерживаемый способ подключения.',
          'Подключён narrative doc по localization с package-level i18n entrypoint.',
          'Foundations теперь служит реальной onboarding-базой, а не placeholder-секцией.',
        ],
      },
    ],
  },
  {
    name: 'integration',
    path: '/integration',
    title: 'Интеграция',
    shortTitle: 'Integration',
    eyebrow: 'Showcase / Integration',
    status: 'ready',
    description: 'Два дополнительных способа подключения: runtime-адаптер `@feugene/granularity/vue` (`createGranularity`) и build-time авто-импорт через `@feugene/unplugin-granularity` (резолвер `unplugin-vue-components`).',
    sections: [
      {
        id: 'vue-plugin',
        title: 'Vue-плагин `createGranularity`',
        description: 'Лёгкий runtime-адаптер из `@feugene/granularity/vue`: регистрирует компоненты, директивы, `provide`-ключи и `globalProperties` без потери tree-shaking — сам модуль не импортирует ни одного компонента.',
        bullets: [
          '`createGranularity({ components, directives, provides, globalProperties })` отдаёт стандартный Vue-plugin для `app.use(...)`.',
          'Поддерживает три формы компонентов: чистый SFC, объект с `install`, явное `{ name, component }`.',
          'Основной сценарий — директивы, `provide`, `globalProperties`, SSR/Nuxt-плагины и окружения без сборщика.',
          'Типовые случаи: глобальные директивы (`v-hotkey`, `v-autofocus`), `provide` для i18n/theme, `globalProperties` для Options API.',
        ],
      },
      {
        id: 'unplugin',
        title: 'Авто-импорт `@feugene/unplugin-granularity`',
        description: 'Отдельный build-time пакет-резолвер для `unplugin-vue-components`: вставляет статические `import`-ы на granular subpath-экспорты пакета прямо в SFC.',
        bullets: [
          'Пишете `<DsButton />` и `v-hotkey` в шаблоне — резолвер сам добавит нужные импорты и подтянет component-level CSS.',
          'Опции: `prefix`, `importStyle`, `directives`, `exclude`; директивы разрешаются по явному whitelist.',
          'Рекомендуется для prod-приложений: идеальный tree-shaking и отсутствие ручных `import`-ов.',
          'Типичный сценарий: резолвер вместе с `presetGranularNode` из `@feugene/unocss-preset-granular/node` для авто-импорта компонентов в шаблонах.',
        ],
      },
      {
        id: 'when-to-use',
        title: 'Как выбирать между подходами',
        description: 'Инструменты ортогональны и типично используются вместе: резолвер закрывает шаблоны, плагин — директивы вне шаблонов, `provide` и globals.',
        bullets: [
          '`@feugene/unplugin-granularity` — build-time, охватывает только то, что реально стоит в `<template>`.',
          '`@feugene/granularity/vue` — runtime, охватывает всё остальное: директивы в `render()`/JSX, i18n/theme через `provide`, Options API через `globalProperties`.',
          'SSR / тесты / окружения без `unplugin-vue-components` — только через `createGranularity`.',
          'Установка CSS-части пакета делается исключительно через `presetGranularNode` — см. раздел Foundations / Installation paths.',
        ],
      },
    ],
  },
  {
    name: 'components',
    path: '/components',
    title: 'Components',
    shortTitle: 'Components',
    eyebrow: 'Showcase / Components',
    status: 'ready',
    description: 'Каталог компонентных страниц с поиском, группировкой и отдельной витриной на каждый публичный компонент пакета.',
    sections: [
      {
        id: 'catalog',
        title: 'Component catalog',
        description: 'Здесь будет index-страница со всеми публичными компонентами и быстрой группировкой по категориям.',
        bullets: [
          `Источник правды — \`packages/granularity/src/granular-provider/shared.ts\` с текущим покрытием в ${showcaseComponentEntities.length} компонентных сущностей.`,
          'Навигация по компонентам должна быть мгновенной и search-friendly.',
          'Каждый компонент получит отдельный route и собственную страницу.',
        ],
      },
      {
        id: 'live-demos',
        title: 'Live demos',
        description: 'Каждая компонентная страница будет раскрывать реальные сценарии использования, а не просто набор всех props.',
        bullets: [
          `Первые hand-authored demo-сценарии уже зарезервированы для ${featuredComponentTitles.join(', ')}.`,
          'Отдельное покрытие состояний, composition cases и сложных сценариев.',
          'Код примеров и live preview будут жить рядом.',
        ],
      },
      {
        id: 'api-sync',
        title: 'Generated API',
        description: 'API-таблицы должны собираться из исходного кода пакета и не расходиться с реальными компонентами.',
        bullets: [
          'Props, slots, events и expose/methods уже представлены в unified pending API format.',
          'Fallback metadata только там, где автогенерации недостаточно.',
          'Связка автогенерации с hand-authored demo-описаниями.',
        ],
      },
    ],
  },
  {
    name: 'directives',
    path: '/directives',
    title: 'Directives',
    shortTitle: 'Directives',
    eyebrow: 'Showcase / Directives',
    status: 'next',
    description: 'Раздел под публичные директивы и `createLoading` с реальными интерактивными сценариями.',
    sections: [
      {
        id: 'public-api',
        title: 'Covered directives',
        description: 'В витрину войдут все публичные директивы из package exports, а не только самые очевидные кейсы.',
        bullets: [
          `Из public exports уже подняты ${showcaseDirectiveEntities.map(entity => entity.title).join(', ')}.`,
          'Отдельная документация для `createLoading` рядом с `vLoading`.',
          'Фиксация caveats, параметров и expected behavior.',
        ],
      },
      {
        id: 'interactive-cases',
        title: 'Interactive behavior',
        description: 'Пользователь должен видеть директиву в действии, а не только копировать usage snippet.',
        bullets: [
          `Приоритетные сценарии уже выделены для ${featuredDirectiveTitles.join(' и ')}.`,
          'Пояснения по обработке edge cases и UX-ограничениям.',
          'Готовые примеры для реальной интеграции.',
        ],
      },
      {
        id: 'integration-notes',
        title: 'Integration notes',
        description: 'Каждая директива получит явные примечания по подключению, параметрам и совместимости с компонентами.',
        bullets: [
          'Сигнатуры binding/value и типовые входные данные.',
          'Комбинации с компонентами дизайн-системы.',
          'Ограничения и caveats для embedded/SSR-like сценариев при необходимости.',
        ],
      },
    ],
  },
  {
    name: 'composables',
    path: '/composables',
    title: 'Composables',
    shortTitle: 'Composables',
    eyebrow: 'Showcase / Composables',
    status: 'next',
    description: 'Страницы для `useTheme` и `useToast` с runnable integration recipes.',
    sections: [
      {
        id: 'use-theme',
        title: '`useTheme` scenarios',
        description: 'Showcase уже использует `useTheme()` для глобального переключателя, а дальше эта страница раскроет composable глубже.',
        bullets: [
          'Инициализация и раннее применение темы.',
          'Persist-режим и поведение в интерфейсе.',
          'Связка theme toggle с компонентами showcase.',
        ],
      },
      {
        id: 'use-toast',
        title: '`useToast` scenarios',
        description: 'Здесь появятся интерактивные примеры push/dismiss/clear и варианты уведомлений.',
        bullets: [
          `Текущий реестр composables уже содержит ${showcaseComposableEntities.map(entity => entity.title).join(' и ')}.`,
          'Очистка очереди и управление жизненным циклом toast-сообщений.',
          'Пояснения по expected usage и интеграционным паттернам.',
        ],
      },
      {
        id: 'integration-recipes',
        title: 'Integration recipes',
        description: 'Каждый composable будет оформлен как готовый рецепт встраивания, а не сухой список возвращаемых значений.',
        bullets: [
          'Параметры, возвращаемые значения и code snippets.',
          'Практические схемы интеграции в app shell и feature pages.',
          'Связи с runtime theme, overlay-сценариями и уведомлениями.',
        ],
      },
    ],
  },
  {
    name: 'utilities',
    path: '/utilities',
    title: 'Utilities',
    shortTitle: 'Utilities',
    eyebrow: 'Showcase / Utilities',
    status: 'next',
    description: 'Раздел для package-level утилит, начиная с `fileValidation` и прикладных сценариев использования.',
    sections: [
      {
        id: 'file-validation',
        title: '`fileValidation`',
        description: 'На отдельной странице будут показаны ключевые валидаторы и формат возвращаемых результатов.',
        bullets: [
          `Из public exports уже собраны ${showcaseUtilityEntities.length} utility-сущностей file validation слоя.`,
          'Практические ошибки валидации и ограничения.',
          'Сравнение use-case без UI и вместе с `DsFileUpload`.',
        ],
      },
      {
        id: 'integration',
        title: 'Utility integration',
        description: 'Утилиты должны объяснять не только API, но и реальный способ применения в продукте.',
        bullets: [
          `Приоритетные integration points уже выделены для ${featuredUtilityTitles.join(' и ')}.`,
          'Примеры интеграции в формы и file upload flows.',
          'Документирование ошибок, ограничений и edge cases.',
        ],
      },
      {
        id: 'future-coverage',
        title: 'Future coverage',
        description: 'Раздел останется расширяемым, чтобы безопасно включать новые package-level helpers по мере роста пакета.',
        bullets: [
          'Подготовка структуры под новые utilities.',
          'Единый формат для narrative notes и runnable examples.',
          'Согласованность с поиском и generated metadata в будущих этапах.',
        ],
      },
    ],
  },
]