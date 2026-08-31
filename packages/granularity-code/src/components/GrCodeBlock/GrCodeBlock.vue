<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'

import { checkIconPaths, copyIconPaths } from './icons'

import { serializeCode } from './serializeCode'
import { GR_CODE_HIGHLIGHTER_KEY } from '../../highlight/key'
import { builtInLines } from '../../highlight/builtIn'
import type { GrCodeLine, GrCodeTokenizer } from '../../highlight/palette'
import {
  codeBlockCopyClass,
  codeBlockGutterClass,
  codeBlockHookClass,
  codeBlockNowrapClass,
  codeBlockNumberedClass as numberedClass,
  codeBlockPaddings,
  codeBlockRootClass,
  codeBlockScrollClass,
  codeBlockSurfaceClass,
  codeBlockTextSizes,
  codeBlockWrapClass,
  codeTokenClass,
} from './grCodeBlockStyles'

import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

export type { GrCodeRole, GrCodeToken } from '../../highlight/palette'

/**
 * Язык подсветки.
 *
 * `'json'` и `'text'` разбирает встроенный токенизатор — без единой зависимости.
 * Любая другая строка уходит подключённой подсветке (`highlighter` или
 * провайдер приложения); её нет — строка показывается обычным текстом, и это
 * нормальный режим, а не отказ.
 */
export type GrCodeBlockLanguage = 'json' | 'text' | (string & {})

/**
 * Блок сырого текста или JSON: моноширинный, с подсветкой, номерами строк и
 * копированием в буфер.
 *
 * Показывает, а не редактирует и не сворачивает узлы. Свёртка по узлам — задача
 * `GrJsonViewer`, дерево выбора — `GrTree`.
 */
export interface GrCodeBlockProps {
  /** Строка или значение: объект сериализуется с отступом. */
  code: unknown
  language?: GrCodeBlockLanguage
  /**
   * Подсветка для языков сверх встроенных. Не задана — берётся из
   * `provide`/`inject` приложения (`GR_CODE_HIGHLIGHTER_KEY`).
   */
  highlighter?: GrCodeTokenizer
  /** Высота, после которой включается вертикальный скролл. */
  maxHeight?: string | number
  /** Кнопка копирования. Без защищённого контекста не рисуется вовсе. */
  copyable?: boolean
  /** Переносить длинные строки вместо горизонтальной прокрутки. */
  wrap?: boolean
  lineNumbers?: boolean
  /** Имя области прокрутки. Безымянную скринридер объявляет просто «регион». */
  ariaLabel?: string
  size?: GrComponentSize
}

export interface GrCodeBlockEmits {
  /** Текст скопирован. Тост показывает потребитель: у блока своего места для него нет. */
  (e: 'copy', code: string): void
}

const props = withDefaults(defineProps<GrCodeBlockProps>(), {
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  language: 'json',
  highlighter: undefined,
  maxHeight: undefined,
  copyable: undefined,
  wrap: undefined,
  lineNumbers: undefined,
  ariaLabel: undefined,
  size: undefined,
})

const emit = defineEmits<GrCodeBlockEmits>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCodeBlock' })
const resolvedCopyable = useGrComponentProp('GrCodeBlock', 'copyable', () => props.copyable, true)
const resolvedWrap = useGrComponentProp('GrCodeBlock', 'wrap', () => props.wrap, false)
const resolvedLineNumbers = useGrComponentProp('GrCodeBlock', 'lineNumbers', () => props.lineNumbers, false)

/** Единственный источник текста: он же рендерится, он же уходит в буфер. */
const source = computed(() => serializeCode(props.code))

/** Подсветка приложения; проп сильнее провайдера. */
const providedTokenizer = inject(GR_CODE_HIGHLIGHTER_KEY, null)
const tokenizer = computed(() => props.highlighter ?? providedTokenizer)

/**
 * Результат асинхронной подсветки. `shallowRef` намеренно: массив строк
 * переписывается целиком, и глубокая реактивность на каждом токене — работа
 * впустую на тысяче строк.
 */
const asyncLines = shallowRef<GrCodeLine[] | null>(null)

/**
 * Первый кадр рисуется встроенным разбором всегда.
 *
 * Асинхронная подсветка (воркер, сервер) доезжает позже и подменяет строки без
 * прыжка раскладки: разметка та же, меняются только роли. Прогресс-состояния
 * не заводим — мигание ради двух кадров хуже, чем их отсутствие.
 */
watch(
  () => [source.value, props.language, tokenizer.value] as const,
  ([code, language, tokenize]) => {
    asyncLines.value = null

    if (!tokenize)
      return

    const result = tokenize(code, language)

    if (!(result instanceof Promise)) {
      asyncLines.value = result
      return
    }

    // Гонка: ответ на позапрошлый вход подсветил бы не то. Сверяем вход на
    // момент разрешения — дефект молчаливый, поймать его иначе нечем.
    const requested = { code, language, tokenize }

    void result.then((lines) => {
      if (requested.code === source.value
        && requested.language === props.language
        && requested.tokenize === tokenizer.value) {
        asyncLines.value = lines
      }
    })
  },
  { immediate: true },
)

const lines = computed<GrCodeLine[]>(
  () => asyncLines.value ?? builtInLines(source.value, props.language),
)

/**
 * Блок — скроллер по конструкции, а не по замеру. Замер здесь означал бы
 * мигающую остановку `Tab` на каждой смене данных и загрузке шрифта; ни один
 * компонент пакета так не делает.
 */
const isScroller = computed(() => props.maxHeight !== undefined || !resolvedWrap.value)

const scrollStyle = computed(() => {
  if (props.maxHeight === undefined)
    return undefined

  return { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight }
})

const preClass = computed(() => [
  codeBlockHookClass,
  codeBlockSurfaceClass,
  codeBlockPaddings[resolvedSize.value],
  codeBlockTextSizes[resolvedSize.value],
  resolvedWrap.value ? codeBlockWrapClass : codeBlockNowrapClass,
  isScroller.value ? codeBlockScrollClass : '',
].filter(Boolean).join(' '))

/**
 * Наличие буфера уточняется после монтирования: `navigator` в теле `setup` либо
 * роняет серверный рендер, либо расходится с ним. До этого момента кнопки нет —
 * ровно то же, что отдаёт сервер, поэтому гидрация совпадает.
 */
const canCopy = ref(false)

onMounted(() => {
  canCopy.value = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function'
})

const showCopy = computed(() => resolvedCopyable.value && canCopy.value)

const copied = ref(false)
let copiedTimer: number | null = null

function resetCopiedTimer(): void {
  if (copiedTimer !== null) {
    clearTimeout(copiedTimer)
    copiedTimer = null
  }
}

onBeforeUnmount(resetCopiedTimer)

async function copy(): Promise<void> {
  try {
    // Копируется исходный текст, а не разметка: номера строк — CSS-счётчик,
    // а мягкие переносы принадлежат показу, и вставить их обратно нельзя.
    await navigator.clipboard.writeText(source.value)
  }
  catch {
    announce(t('grCode.block.copyFailed', 'Could not copy code'))
    return
  }

  copied.value = true
  resetCopiedTimer()
  copiedTimer = window.setTimeout(() => {
    copied.value = false
    copiedTimer = null
  }, 1200)

  announce(t('grCode.block.copied', 'Code copied'))
  emit('copy', source.value)
}

const copyLabel = computed(() => (
  copied.value ? t('grCode.block.copied', 'Code copied') : t('grCode.block.copy', 'Copy code')
))
</script>

<template>
  <div data-gr-code-block :class="[codeBlockRootClass, showCopy ? codeBlockGutterClass : '']">
    <GrButton
      v-if="showCopy"
      data-gr-code-block-copy
      variant="ghost"
      size="xs"
      square
      :class="codeBlockCopyClass"
      :aria-label="copyLabel"
      :title="copyLabel"
      @click="copy"
    >
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      ><path v-for="(d, index) in (copied ? checkIconPaths : copyIconPaths)" :key="index" :d="d" /></svg>
    </GrButton>

    <!--
      Внутри `<pre>` пробелы значимы, и компилятор Vue их здесь не схлопывает:
      любой перенос между тегами стал бы пустой строкой в коде. Поэтому
      содержимое блока записано без переносов — строки разделяет `display: block`
      у `.gr-code-block__line`, а не текстовый `\n`.
    -->
    <pre
      data-gr-code-block-scroll
      :class="[preClass, resolvedLineNumbers ? numberedClass : '']"
      :style="scrollStyle"
      :tabindex="isScroller ? 0 : undefined"
      :role="ariaLabel ? 'region' : undefined"
      :aria-label="ariaLabel"
    ><code data-gr-code-block-code><span v-for="(tokens, index) in lines" :key="index" data-gr-code-block-line class="gr-code-block__line"><span v-for="(token, tokenIndex) in tokens" :key="tokenIndex" :class="codeTokenClass[token.role]">{{ token.text }}</span></span></code></pre>
  </div>
</template>

<style>
/*
 * Номер строки — CSS-счётчик, а не текст в разметке. Разница не косметическая:
 * узел со `<span>2</span>` попадает в выделение мышью, и в буфер уезжает то,
 * что нельзя вставить обратно как код. У `::before` содержимого в DOM нет.
 *
 * Стиль глобальный, а не scoped: правило адресует псевдоэлемент строки, и
 * scoped-атрибут пришлось бы вешать на каждый из них.
 */
:where(.gr-code-block__line) {
  display: block;
}

:where(.gr-code-block--numbered) {
  counter-reset: gr-code-line;
}

/*
 * Висячий отступ: строка сдвинута на ширину колонки номеров, а первая строка
 * возвращена назад отрицательным `text-indent` — туда и встаёт номер. Без этого
 * перенесённая при `wrap` строка начиналась бы под номером, а не под кодом.
 */
:where(.gr-code-block--numbered .gr-code-block__line) {
  padding-left: calc(var(--gr-code-block-line-number-width, 2.5em) + 1em);
  text-indent: calc(-1 * (var(--gr-code-block-line-number-width, 2.5em) + 1em));
}

:where(.gr-code-block--numbered .gr-code-block__line)::before {
  counter-increment: gr-code-line;
  content: counter(gr-code-line);
  display: inline-block;
  width: var(--gr-code-block-line-number-width, 2.5em);
  margin-right: 1em;
  text-align: right;
  text-indent: 0;
  color: var(--gr-code-block-line-number, var(--gr-muted-fg));
  user-select: none;
}
</style>
