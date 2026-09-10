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
function tokenColor(probe: HTMLElement, paint: CanvasRenderingContext2D, name: string, fallback: string) {
  probe.style.color = fallback
  probe.style.color = `var(${name}, ${fallback})`

  paint.fillStyle = '#000000'
  paint.fillStyle = getComputedStyle(probe).color || fallback
  paint.fillRect(0, 0, 1, 1)

  const [r, g, b] = paint.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map(channel => channel!.toString(16).padStart(2, '0')).join('')}`
}

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
    const color = (name: string, fallback: string) => tokenColor(probe, paint, name, fallback)
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
    }
  }
  finally {
    probe.remove()
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
          theme: 'base',
          themeVariables: themeVariables(),
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

    let observer: MutationObserver | null = null

    onMounted(() => {
      void draw()
      observer = new MutationObserver(() => void draw())
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    })
    onBeforeUnmount(() => observer?.disconnect())
    watch(() => [props.code, props.language], () => void draw())

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

const diagrams = ref(true)

/** Выключенный тумблер — рендерера нет, и ограда печатается как код. */
const components = computed(() => (diagrams.value ? { code: MermaidBlock } : {}))
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-3 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] p-4">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <span class="showcase-demo-caption text-[11px]">Рисовать диаграммы</span>
        <GrSwitch v-model="diagrams" size="sm">
          mermaid
        </GrSwitch>

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
        `mermaid` ставит приложение, а не пакет: в `@feugene/granularity-editor`
        его нет ни в зависимостях, ни в коде. Шов — проп `components.code`, тот
        же, которым подключают подсветку. Импорт динамический, поэтому документ
        без диаграмм за движок не платит; выключите тумблер — ограда станет
        обычным блоком кода, и ничего не загрузится вовсе.
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
  </div>
</template>

<style scoped>
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
