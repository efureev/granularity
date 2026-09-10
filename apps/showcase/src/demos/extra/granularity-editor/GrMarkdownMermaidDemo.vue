<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { GrMarkdownCode } from '@feugene/granularity-editor/components/GrMarkdownCode'

// `GrMarkdown`, `GrSwitch` подставляются авто-импортом.

/**
 * Диаграммы: пакет ставит приложение, а не библиотека.
 *
 * `mermaid` весит больше всей дизайн-системы, и зависимостью пакета он не
 * станет. Шов для него уже есть: `GrMarkdown` отдаёт в `components.code`
 * содержимое ограды и её язык, а что с этим делать — решает потребитель.
 * Поэтому весь код ниже живёт в приложении, а `@feugene/granularity-editor`
 * про `mermaid` по-прежнему не знает ни строкой.
 */

/**
 * Состояние движка, а не миллисекунды.
 *
 * Время загрузки было бы нагляднее, но оно разное от прогона к прогону, и
 * визуальный эталон страницы стал бы плавающим. Предмет демо — «ничего не
 * грузится, пока не встретилась диаграмма», и это состояние выражает точнее.
 */
const engineLoaded = ref(false)
const drawn = ref(0)

let mermaidPromise: Promise<typeof import('mermaid').default> | null = null
let diagramId = 0

/**
 * Цвет токена в виде `#rrggbb` — единственной форме, которую понимает `mermaid`.
 *
 * Двух шагов не избежать. `getPropertyValue` отдаёт **объявленное** значение
 * токена, а часть палитры объявлена через `color-mix()`, поэтому сперва цвет
 * присваивается пробному элементу и читается уже вычисленным. Но вычисленный
 * Chrome отдаёт как `color(srgb …)` — палитра живёт в широком пространстве, —
 * и разборщик цветов внутри `mermaid` падает уже на этой форме. Канва снимает
 * вопрос совсем: пиксель всегда восьмибитный sRGB.
 */
function cssColor(probe: HTMLElement, paint: CanvasRenderingContext2D, expression: string, fallback: string) {
  probe.style.color = fallback
  probe.style.color = expression

  paint.fillStyle = '#000000'
  paint.fillStyle = getComputedStyle(probe).color || fallback
  paint.fillRect(0, 0, 1, 1)

  const [r, g, b] = paint.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map(channel => channel!.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Что предлагаем на выбор.
 *
 * Первые три — свои: `theme: 'base'` плюс `themeVariables`, собранные из токенов
 * дизайн-системы. Две последние встроены в движок и палитру задают сами.
 *
 * `forest` и `dark` не вошли осознанно: первая уводит в оливковый, чужой всей
 * системе, вторая рисует чёрные плашки независимо от темы страницы — а тёмную
 * тему здесь и так закрывают «Токены», они читают текущие значения.
 */
const THEMES = [
  { value: 'tokens', label: 'Токены' },
  { value: 'accent', label: 'Акцент' },
  { value: 'outline', label: 'Контур' },
  { value: 'neutral', label: 'neutral' },
  { value: 'default', label: 'default' },
] as const
type ThemeName = typeof THEMES[number]['value']

const theme = ref<ThemeName>('tokens')

/**
 * Токены дизайн-системы, разложенные в переменные темы `mermaid`.
 *
 * Читается перед каждым показом, а не один раз при инициализации: тема
 * страницы переключается на лету, и диаграмма обязана переключиться с ней.
 */
function themeVariables() {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  document.body.append(probe)
  const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!

  try {
    const color = (name: string, fallback: string) => cssColor(probe, paint, `var(${name}, ${fallback})`, fallback)
    // Мягкий оттенок акцента: сплошной `--gr-primary` даёт нечитаемый текст на плашке.
    const tint = (name: string, percent: number, fallback: string) =>
      cssColor(probe, paint, `color-mix(in srgb, var(${name}) ${percent}%, var(--gr-card, #fff))`, fallback)
    const surface = color('--gr-card', '#ffffff')
    const fill = color('--gr-muted', '#f1f5f9')
    const text = color('--gr-fg', '#0f172a')
    const border = color('--gr-brd', '#cbd5e1')

    return {
      background: surface,
      mainBkg: fill,
      primaryColor: fill,
      primaryTextColor: text,
      primaryBorderColor: border,
      secondaryColor: color('--gr-accent', '#e2e8f0'),
      tertiaryColor: surface,
      lineColor: color('--gr-brd-hover', '#94a3b8'),
      textColor: text,
      fontSize: '14px',
      // Не переменные `mermaid`, а сырьё для вариантов ниже.
      accentFill: tint('--gr-primary', 14, '#eef2ff'),
      accentLine: tint('--gr-primary', 55, '#a5b4fc'),
      accentText: color('--gr-primary-text', '#3730a3'),
    }
  }
  finally {
    probe.remove()
  }
}

/**
 * Что отдать движку на выбранную тему.
 *
 * `themeVariables` слушается только темой `base` — остальные встроенные темы
 * задают палитру сами, и подмешивать к ним токены значит получить смесь двух
 * решений вместо любого из них.
 */
function themeConfig() {
  const vars = themeVariables()

  switch (theme.value) {
    case 'tokens':
      return { theme: 'base' as const, themeVariables: vars }
    case 'accent':
      return {
        theme: 'base' as const,
        themeVariables: {
          ...vars,
          mainBkg: vars.accentFill,
          primaryColor: vars.accentFill,
          primaryBorderColor: vars.accentLine,
          primaryTextColor: vars.accentText,
          lineColor: vars.accentLine,
        },
      }
    case 'outline':
      return {
        theme: 'base' as const,
        themeVariables: { ...vars, mainBkg: vars.background, primaryColor: vars.background, secondaryColor: vars.background, tertiaryColor: vars.background },
      }
    default:
      return { theme: theme.value }
  }
}

async function loadMermaid() {
  // Импорт динамический и один на страницу. Статический означал бы, что вес
  // приезжает всем — включая документы, где ни одной диаграммы нет.
  mermaidPromise ??= import('mermaid').then((module) => {
    engineLoaded.value = true
    return module.default
  })
  return mermaidPromise
}

/**
 * Блок кода, который умеет рисовать диаграмму.
 *
 * Контракт `components.code` — `{ code, language, wrap, onCopy }`. Всё, что не
 * `mermaid`, уходит рендереру по умолчанию: подменять весь блок кода ради
 * одного языка незачем.
 */
const MermaidBlock = defineComponent({
  name: 'MermaidBlock',
  props: {
    code: { type: String, required: true },
    language: { type: String as PropType<string | null>, default: null },
    wrap: { type: Boolean, default: false },
    onCopy: { type: Function as PropType<((language: string | null) => void) | undefined>, default: undefined },
  },
  setup(props) {
    const host = ref<HTMLElement | null>(null)
    const failed = ref<string | null>(null)
    const pending = ref(true)

    async function draw() {
      if (props.language !== 'mermaid' || !host.value)
        return

      pending.value = true
      failed.value = null
      try {
        const mermaid = await loadMermaid()
        mermaid.initialize({
          startOnLoad: false,
          // `strict` вычищает разметку из подписей. Источник документа тут
          // недоверенный по определению — это markdown, пришедший извне.
          securityLevel: 'strict',
          // Ключевая строка: без неё `mermaid` тянет раскладку ELK — 440 КБ
          // gzip на первый же flowchart, при том что рисует его dagre.
          layout: 'dagre',
          ...themeConfig(),
        })

        // Подписи внутри диаграммы движок меряет сам. Пока шрифт страницы не
        // доехал, меряется запасной — и когда доедет настоящий, подписи уже
        // расставлены по чужим метрикам и разъезжаются.
        await document.fonts.ready

        const { svg } = await mermaid.render(`gr-md-mermaid-${diagramId++}`, props.code)

        // Не `v-html`: строка разбирается парсером и вставляется узлами. Тот же
        // уровень доверия, но директивы, которой в этом репозитории нет нигде,
        // не заводится и здесь.
        const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml')
        if (parsed.querySelector('parsererror'))
          throw new Error('движок вернул не SVG')

        host.value?.replaceChildren(document.importNode(parsed.documentElement, true))
        drawn.value += 1
      }
      catch (error) {
        // Показать исходник лучше, чем пустое место: сломанную диаграмму правят
        // по тексту, а не по отсутствию картинки.
        failed.value = error instanceof Error ? error.message : String(error)
      }
      finally {
        pending.value = false
      }
    }

    let themes: MutationObserver | null = null

    onMounted(() => {
      void draw()
      themes = new MutationObserver(() => void draw())
      themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    })
    onBeforeUnmount(() => themes?.disconnect())
    watch(() => [props.code, props.language, theme.value], () => void draw())

    return () => {
      if (props.language !== 'mermaid')
        return h(GrMarkdownCode, { code: props.code, language: props.language, wrap: props.wrap, onCopy: props.onCopy })

      if (failed.value)
        return h(GrMarkdownCode, { code: `${props.code}\n\n# ${failed.value}`, language: 'mermaid', wrap: props.wrap })

      return h('figure', { class: 'gr-demo-diagram' }, [
        h('div', { ref: host, class: 'gr-demo-diagram-canvas' }),
        pending.value
          ? h('figcaption', { class: 'gr-demo-diagram-pending' }, 'Рисуется…')
          : null,
      ])
    }
  },
})

const source = `## Как заявка становится отгрузкой

Диаграмма ниже — обычная ограда с языком \`mermaid\`.

\`\`\`mermaid
flowchart LR
  A[Заявка] --> B{Есть на складе?}
  B -- да --> C[Сборка]
  B -- нет --> D[Заказ поставщику]
  D --> C
  C --> E[Отгрузка]
\`\`\`

Соседняя ограда с другим языком идёт обычным блоком кода — рендерер подменён
только для диаграмм:

\`\`\`ts
const engine = createMarkedEngine()
\`\`\`

\`\`\`mermaid
sequenceDiagram
  Клиент->>Сервис: POST /order
  Сервис->>Склад: резерв
  Склад-->>Сервис: ок
  Сервис-->>Клиент: 201 Created
\`\`\`
`

/** Первоисточники: настройка движка и синтаксис типов диаграмм. */
const docs = [
  { title: 'Синтаксис всех типов', href: 'https://mermaid.js.org/intro/syntax-reference.html' },
  { title: 'Конфигурация', href: 'https://mermaid.js.org/config/schema-docs/config.html' },
  { title: 'Тема и themeVariables', href: 'https://mermaid.js.org/config/theming.html' },
  { title: 'Раскладки и ELK', href: 'https://mermaid.js.org/config/layouts.html' },
  { title: 'API render и initialize', href: 'https://mermaid.js.org/config/usage.html' },
]

const diagrams = ref(true)

/** Выключенный тумблер — рендерера нет, и ограда печатается как код. */
const components = computed(() => (diagrams.value ? { code: MermaidBlock } : {}))
</script>

<template>
  <div class="grid gap-5">
    <!-- Панель — только органы управления: они обязаны стоять вплотную к тому,
         чем управляют. Всё, что читают, а не нажимают, живёт под примером. -->
    <div class="grid gap-2 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] px-4 py-3">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span class="showcase-demo-caption text-[11px]">Диаграммы</span>
        <GrSwitch v-model="diagrams" size="sm">
          mermaid
        </GrSwitch>

        <GrSegmented
          v-model="theme"
          size="sm"
          :options="[...THEMES]"
          aria-label="Тема диаграммы"
        />

        <div class="ms-auto flex flex-wrap items-center gap-2">
          <span class="rounded-full border border-[var(--gr-brd)] bg-[var(--gr-card)] px-2.5 py-0.5 font-mono text-xs text-[var(--gr-muted-fg)]">
            движок: {{ engineLoaded ? 'загружен' : 'не загружен' }}
          </span>
          <span class="rounded-full border border-[var(--gr-brd)] bg-[var(--gr-card)] px-2.5 py-0.5 font-mono text-xs text-[var(--gr-muted-fg)]">
            нарисовано: {{ drawn }}
          </span>
        </div>
      </div>

      <p class="showcase-demo-text text-xs">
        Выключите тумблер — ограда станет обычным блоком кода, и не загрузится
        вообще ничего.
      </p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] shadow-[var(--showcase-shadow-raised)]">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--gr-brd)] px-5 py-2.5 sm:px-8">
        <span class="showcase-demo-caption text-[11px]">Отрендеренный документ</span>
      </div>

      <div class="px-5 py-6 sm:px-8 sm:py-8">
        <GrMarkdown :source="source" id-prefix="mermaid-" :components="components" />
      </div>
    </div>

    <div class="grid gap-3">
      <div class="grid gap-1">
        <span class="showcase-demo-caption text-[11px]">Как подключить</span>
        <p class="showcase-demo-text text-xs">
          <code>mermaid</code> ставит приложение, а не пакет: в
          <code>@feugene/granularity-editor</code> его нет ни в зависимостях, ни в коде.
          Шов — проп <code>components.code</code>, тот же, которым подключают подсветку.
        </p>
      </div>

      <ol class="grid gap-px overflow-hidden rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-brd)] sm:grid-cols-3">
        <li class="grid content-start gap-2 bg-[var(--gr-card)] p-4">
          <span class="demo-step">1 · Поставить движок</span>
          <code class="demo-code">yarn add mermaid</code>
          <p class="demo-note">
            Зависимость приложения, не библиотеки: <code>GrMarkdown</code> весит 11.3 КБ
            gzip, одно ядро <code>mermaid</code> — 179 КБ.
          </p>
        </li>

        <li class="grid content-start gap-2 bg-[var(--gr-card)] p-4">
          <span class="demo-step">2 · Написать рендерер</span>
          <code class="demo-code">import { GrMarkdownCode } from '@feugene/granularity-editor/components/GrMarkdownCode'</code>
          <p class="demo-note">
            Получает <code>{ code, language, wrap, onCopy }</code>. Рисует ограду с языком
            <code>mermaid</code>, прочие языки отдаёт <code>GrMarkdownCode</code>.
          </p>
          <p class="demo-warn">Экспорт именованный: по умолчанию отсюда приезжает сам <code>GrMarkdown</code>.</p>
        </li>

        <li class="grid content-start gap-2 bg-[var(--gr-card)] p-4">
          <span class="demo-step">3 · Отдать документу</span>
          <code class="demo-code">&lt;GrMarkdown :components="{ code: MermaidBlock }" /&gt;</code>
          <p class="demo-note">
            Больше нигде <code>mermaid</code> не упоминается: замена движка диаграмм —
            правка одного компонента.
          </p>
        </li>
      </ol>
    </div>

    <div class="grid gap-3">
      <span class="showcase-demo-caption text-[11px]">Что ещё знать</span>

      <div class="grid gap-px overflow-hidden rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-brd)] sm:grid-cols-3">
        <section class="grid content-start gap-2.5 bg-[var(--gr-card)] p-4">
          <span class="demo-step">Строки конфига</span>
          <dl class="demo-list">
            <dt><code>import('mermaid')</code></dt>
            <dd>только динамический: статический положит движок в общий кусок.</dd>

            <dt><code>layout: 'dagre'</code></dt>
            <dd>отсекает ELK: 231 КБ gzip против 661, 93 мс против 532.</dd>

            <dt><code>securityLevel: 'strict'</code></dt>
            <dd>вычищает разметку из подписей: markdown приходит извне.</dd>
          </dl>
        </section>

        <section class="grid content-start gap-2.5 bg-[var(--gr-card)] p-4">
          <span class="demo-step">Темы</span>
          <dl class="demo-list">
            <dt>Токены · Акцент · Контур</dt>
            <dd>свои: <code>theme: 'base'</code> плюс <code>themeVariables</code> из токенов — идут за темой страницы.</dd>

            <dt><code>neutral</code> · <code>default</code></dt>
            <dd>встроенные в движок, палитру задают сами.</dd>
          </dl>
          <p class="demo-warn"><code>themeVariables</code> слушается только темой <code>base</code>.</p>
        </section>

        <section class="grid content-start gap-2.5 bg-[var(--gr-card)] p-4">
          <span class="demo-step">Типы диаграмм</span>
          <dl class="demo-list">
            <dt>Встроенные</dt>
            <dd>регистрировать не нужно, <code>render()</code> подтягивает сам. Цена по типу: sequence 31 КБ, class 16 КБ, pie 154 КБ.</dd>

            <dt><code>registerExternalDiagrams</code></dt>
            <dd>чужой тип, отдельным пакетом.</dd>

            <dt><code>registerIconPacks</code></dt>
            <dd>иконки, пакеты <code>@iconify-json/*</code>.</dd>

            <dt><code>registerLayoutLoaders</code></dt>
            <dd>своя раскладка вместо dagre.</dd>
          </dl>
        </section>
      </div>

      <div class="flex flex-wrap gap-2">
        <a
          v-for="link in docs"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noreferrer"
          class="showcase-link-chip inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors"
        >{{ link.title }}</a>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Заголовок карточки: он держит колонку, поэтому весом отделён от текста. */
.demo-step {
  font-size: var(--gr-text-xs);
  font-weight: var(--gr-font-semibold);
  color: var(--gr-fg);
  letter-spacing: 0.01em;
}

.demo-code {
  display: block;
  overflow-wrap: anywhere;
  border-radius: var(--gr-radius-sm, 6px);
  background: var(--gr-muted);
  padding: 0.4rem 0.55rem;
  font-family: var(--gr-font-mono, ui-monospace, monospace);
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--gr-fg);
}

.demo-note,
.demo-warn {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.55;
  color: var(--gr-muted-fg);
}

/* Оговорка, а не пояснение: её пропускают именно тогда, когда она нужна. */
.demo-warn {
  border-inline-start: 2px solid var(--gr-brd-hover);
  padding-inline-start: 0.6rem;
  color: var(--gr-fg);
}

/*
 * Термин и пояснение отдельными строками.
 * Одной строкой они сливаются в поток, в котором не видно, что здесь список.
 */
.demo-list {
  display: grid;
  gap: 0.7rem;
  margin: 0;
}

.demo-list dt {
  font-family: var(--gr-font-mono, ui-monospace, monospace);
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--gr-fg);
  overflow-wrap: anywhere;
}

.demo-list dd {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  line-height: 1.55;
  color: var(--gr-muted-fg);
}

.demo-note :deep(code),
.demo-warn :deep(code),
.demo-list :deep(code) {
  font-family: var(--gr-font-mono, ui-monospace, monospace);
  font-size: 0.95em;
  color: inherit;
}

.gr-demo-diagram {
  margin: var(--gr-markdown-flow, 1em) 0;
  display: grid;
  gap: 0.5rem;
  justify-items: center;
}

/* Диаграмма шире колонки текста — она такая же «широкая» вставка, как таблица. */
.gr-demo-diagram-canvas {
  width: 100%;
  overflow-x: auto;
}

.gr-demo-diagram-canvas :deep(svg) {
  max-width: 100%;
  height: auto;
}

.gr-demo-diagram-pending {
  font-size: var(--gr-text-xs);
  color: var(--gr-muted-fg);
}
</style>
