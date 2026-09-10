<script setup lang="ts">
import type { VNodeChild } from 'vue'
import { computed, h, shallowRef, useSlots, watch } from 'vue'

// Документ рисует рендер-функция, поэтому у компонента есть настоящий CSS.
// Импорт здесь, а не `cssFiles` в конфиге: `libInjectCss` вошьёт его в чанк.
import './tokens.css'
import './styles.css'

import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import { createMarkdownDocument } from '../../markdown/document'
import { markdownHeadings } from '../../markdown/headings'
import { markdownPlainText } from '../../markdown/plainText'
import type {
  GrMarkdownEngine,
  GrMdBlock,
  GrMdHeading,
  GrMdHtmlMode,
} from '../../markdown/types'

import { GrMarkdownBody } from './body'
import type { GrMarkdownDensity, GrMarkdownSize } from './grMarkdownStyles'
import { rootClass, sizeClasses } from './grMarkdownStyles'
import type { GrMarkdownRenderContext, GrMarkdownRenderers } from './renderNodes'
import { renderTopBlock } from './renderNodes'

/**
 * GrMarkdown — показать markdown.
 *
 * Три несущих решения, и все три видно только в устройстве, а не на экране:
 *
 * 1. дерево рисуется **VNode**, а не строкой HTML. Экранирование делает Vue,
 *    поэтому санитайзера в пакете нет за ненадобностью, а `v-html` не появится;
 * 2. неизменившийся блок отдаёт **тот же объект VNode**, и `patch` замыкается
 *    на `n1 === n2`, не трогая его DOM. Отсюда цена правки — один блок;
 * 3. длинный документ живёт в DOM целиком, а раскладка снимается
 *    `content-visibility`. Виртуализация убрала бы вместе с узлами поиск по
 *    странице, якоря и печать — для документа это не размен, а поломка.
 */

export interface GrMarkdownProps {
  source?: string
  /** `gfm` — таблицы, задачи, зачёркивание; `commonmark` — без них; `minimal` — ещё и без картинок. */
  preset?: 'gfm' | 'commonmark' | 'minimal'
  /** Что делать с сырым HTML. Рендера в разметку нет ни при каком значении. */
  html?: GrMdHtmlMode
  /** Сдвиг уровней заголовков: документ внутри страницы, где `h1` уже занят. */
  headingOffset?: number
  /** Ссылка-якорь у заголовка. */
  anchors?: boolean
  /** Префикс `id` заголовков и сносок — когда документов на странице несколько. */
  idPrefix?: string
  /** Ограничивать ширину текстовых блоков мерой строки. */
  measure?: boolean
  /** Плотность: `comfortable` — статья, `compact` — комментарий. */
  density?: GrMarkdownDensity
  size?: GrMarkdownSize
  linkTarget?: string | null
  linkRel?: string
  allowedProtocols?: readonly string[]
  /** Чекбоксы задач кликабельны и эмитят `taskToggle` с офсетом в исходнике. */
  interactiveTasks?: boolean
  /** Переносить длинные строки кода вместо горизонтальной прокрутки. */
  wrapCode?: boolean
  /** Источник дописывается в конец: разбирается только хвост. */
  streaming?: boolean
  /** Подмена рендерера узла: `{ code, link, image, heading, table }`. */
  components?: GrMarkdownRenderers
  engine?: GrMarkdownEngine
  /** Имя области. Не задан — ориентиром документ не объявляется. */
  ariaLabel?: string
}

export interface GrMarkdownEmits {
  (e: 'parsed', headings: GrMdHeading[], blocks: number): void
  (e: 'linkClick', event: MouseEvent, href: string | null): void
  (e: 'taskToggle', offset: number, checked: boolean): void
  (e: 'copy', language: string | null): void
  (e: 'error', error: unknown): void
}

const props = withDefaults(defineProps<GrMarkdownProps>(), {
  source: '',
  preset: 'gfm',
  html: 'escape',
  headingOffset: 0,
  anchors: true,
  idPrefix: '',
  measure: true,
  // `undefined` у настраиваемых пропов: дефолт живёт в `GrConfigProvider`.
  density: undefined,
  // `undefined`, а не `md`: настоящий дефолт живёт в `useGrComponentSize`,
  // иначе `GrConfigProvider` до компонента не дотянется.
  size: undefined,
  linkTarget: null,
  linkRel: 'nofollow noopener noreferrer',
  allowedProtocols: undefined,
  interactiveTasks: false,
  wrapCode: false,
  streaming: false,
  components: undefined,
  engine: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<GrMarkdownEmits>()

defineSlots<{
  /** Пустой источник. По умолчанию не рисуется ничего. */
  empty?: () => unknown
  /** Курсор в конце потока — режим `streaming`. */
  caret?: () => unknown
}>()

const { t } = useGranularityTranslations()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrMarkdown' })
const resolvedDensity = useGrComponentProp('GrMarkdown', 'density', () => props.density, 'comfortable')

/**
 * Документ пересоздаётся, когда меняется то, что влияет на сам разбор.
 * Источник в этот список не входит: ради него документ и существует.
 */
const document = computed(() => createMarkdownDocument({
  engine: props.engine,
  html: props.html,
  allowedProtocols: props.allowedProtocols,
  idPrefix: props.idPrefix,
  preset: props.preset,
  streaming: props.streaming,
}))

const blocks = shallowRef<GrMdBlock[]>([])

watch(
  [document, () => props.source],
  ([doc, source]) => {
    try {
      blocks.value = doc.update(source)
      emit('parsed', markdownHeadings(blocks.value), blocks.value.length)
    }
    catch (error) {
      // Штатно markdown не падает. Но движок подменяем, и чужой вправе
      // бросить: пустой документ и эмит честнее необъяснённого белого места.
      blocks.value = []
      emit('error', error)
    }
  },
  { immediate: true },
)

const renderContext = computed<GrMarkdownRenderContext>(() => ({
  t,
  components: props.components ?? {},
  anchors: props.anchors,
  headingOffset: props.headingOffset,
  linkTarget: props.linkTarget,
  linkRel: props.linkRel,
  interactiveTasks: props.interactiveTasks,
  idPrefix: props.idPrefix,
  wrapCode: props.wrapCode,
  onLinkClick: (event, href) => emit('linkClick', event, href),
  onTaskToggle: (offset, checked) => emit('taskToggle', offset, checked),
  onCopy: language => emit('copy', language),
}))

/**
 * Кэш VNode по ключу блока — главный механизм перфоманса.
 *
 * Сбрасывается целиком при смене контекста рендера: иначе на экране остался бы
 * прошлый вариант — старый сдвиг заголовков, старая политика ссылок.
 */
const cache = new Map<string, VNodeChild>()
watch(renderContext, () => cache.clear())

const slots = useSlots()

const rendered = computed<VNodeChild[]>(() => {
  const ctx = renderContext.value
  const occurrences = new Map<string, number>()
  const fresh = new Map<string, VNodeChild>()
  const last = blocks.value.length - 1

  const nodes = blocks.value.map((block, index) => {
    // Два одинаковых абзаца дают один ключ, а Vue требует уникальных и один и
    // тот же VNode дважды в дерево не пустит. Номер повторения решает оба
    // вопроса и не зависит от позиции блока в документе.
    const seen = occurrences.get(block.key) ?? 0
    occurrences.set(block.key, seen + 1)
    const key = seen === 0 ? block.key : `${block.key}#${seen}`

    // Курсор потока живёт в последнем блоке, и потому этот блок не кэшируется:
    // он и так пересобирается на каждом куске, а кэш вернул бы его с курсором
    // уже после остановки потока.
    const caret = props.streaming && index === last && slots.caret
      ? h('span', { class: 'gr-md-caret' }, slots.caret())
      : undefined

    if (caret)
      return renderTopBlock(block, ctx, key, caret)

    const node = cache.get(key) ?? renderTopBlock(block, ctx, key)
    fresh.set(key, node)
    return node
  })

  cache.clear()
  for (const [key, node] of fresh) cache.set(key, node)

  return nodes
})

const headings = computed(() => markdownHeadings(blocks.value))
const isEmpty = computed(() => blocks.value.length === 0)

/** `id` заголовка уже несёт `idPrefix` — его проставил разбор. */
function scrollToHeading(id: string): void {
  if (typeof window === 'undefined')
    return

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.document.getElementById(id)?.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'start',
  })
}

defineExpose({
  headings,
  scrollToHeading,
  plainText: () => markdownPlainText(blocks.value),
})
</script>

<template>
  <div
    :class="[rootClass, sizeClasses[resolvedSize]]"
    :data-density="resolvedDensity"
    :data-measure="measure ? 'on' : 'off'"
    :role="ariaLabel ? 'region' : undefined"
    :aria-label="ariaLabel"
    data-gr-markdown
  >
    <slot v-if="isEmpty" name="empty" />
    <template v-else>
      <GrMarkdownBody :nodes="rendered" />
    </template>
  </div>
</template>
