<script setup lang="ts">
import { computed, inject, nextTick, ref, shallowRef, watch } from 'vue'

import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useVirtualList } from '@feugene/granularity/composables/useVirtualList'
import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

import { GR_CODE_HIGHLIGHTER_KEY } from '../../highlight/key'
import { builtInLine } from '../../highlight/builtIn'
import type { GrCodeLine, GrCodeTokenizer } from '../../highlight/palette'
import { codeTokenClass } from '../GrCodeBlock/grCodeBlockStyles'
import { serializeStable } from '../GrCodeBlock/serializeCode'
import { diffLines, GR_DIFF_DEFAULT_BUDGET, type GrDiffLine } from '../../diff/diffLines'
import { diffWords, type GrDiffWord } from '../../diff/diffWords'
import {
  collapseUnchanged,
  expandGap,
  GR_DIFF_DEFAULT_CONTEXT,
  GR_DIFF_DEFAULT_EXPAND_STEP,
  toSplitRows,
  type GrDiffGap,
  type GrDiffGapEdge,
  type GrDiffGapExpansion,
  type GrDiffRow,
  type GrDiffSplitEntry,
} from '../../diff/collapse'
import {
  diffFontClass,
  diffGapClass,
  diffGapCountClass,
  diffGapEdgeClass,
  diffGapRowClass,
  diffGutterClass,
  diffGutterCellClass,
  diffHookClass,
  diffNowrapClass,
  diffRootClass,
  diffRowClass,
  diffRowTone,
  diffScrollClass,
  diffSignClass,
  diffSizeClass,
  diffSplitCellClass,
  diffSummaryClass,
  diffWordTone,
  diffWrapClass,
} from './grDiffStyles'

export type GrDiffMode = 'unified' | 'split'

/** Готовый дифф с бэкенда: участок одного вида. */
export interface GrDiffHunk {
  op: 'equal' | 'add' | 'remove'
  lines: string[]
}

/**
 * Сравнение двух текстов: что изменилось в записи, между ревизиями, между
 * конфигами двух окружений.
 *
 * Не редактирует и не разрешает конфликты: «принять блок» — задача резолвера,
 * другого компонента.
 */
export interface GrDiffProps {
  /** Левая сторона. Не строка — сериализуется устойчивым порядком ключей. */
  before?: unknown
  /** Правая сторона. */
  after?: unknown
  /** Готовый дифф. Сильнее `before`/`after`: считать заново нечего. */
  hunks?: GrDiffHunk[]
  mode?: GrDiffMode
  /**
   * Язык подсветки строк. Тот же словарь, что у блока.
   *
   * Не задан — `json`, если сравнивают значения, и `text`, если строки: объект
   * сериализуем мы сами и точно знаем, что получилось.
   */
  language?: string
  highlighter?: GrCodeTokenizer
  /** Неизменных строк вокруг изменения. `0` — только изменения, `Infinity` — всё. */
  context?: number
  /** Сколько строк открывает одно нажатие на пропуск. */
  expandStep?: number
  /** Предел работы алгоритма. За ним разбор огрубляется, а не вешает вкладку. */
  budget?: number
  lineNumbers?: boolean
  wrap?: boolean
  maxHeight?: string | number
  size?: GrComponentSize
  /** Имя области сравнения. Безымянную скринридер объявляет просто «регион». */
  ariaLabel?: string
}

export interface GrDiffEmits {
  /** Пропуск раскрыт с края: потребитель волен запомнить это между показами. */
  (e: 'expand', gapId: string, edge: GrDiffGapEdge): void
  /** Бюджет исчерпан, разбор огрублён. */
  (e: 'budgetExceeded'): void
}

const props = withDefaults(defineProps<GrDiffProps>(), {
  // Настраиваемые через `GrConfigProvider` пропы дефолта здесь не получают:
  // Vue подставил бы свой раньше, чем компонент заглянет в провайдер.
  mode: undefined,
  language: undefined,
  highlighter: undefined,
  context: undefined,
  expandStep: undefined,
  budget: GR_DIFF_DEFAULT_BUDGET,
  lineNumbers: undefined,
  wrap: undefined,
  maxHeight: undefined,
  size: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<GrDiffEmits>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrDiff' })
const resolvedWrap = useGrComponentProp('GrDiff', 'wrap', () => props.wrap, false)
const resolvedLineNumbers = useGrComponentProp('GrDiff', 'lineNumbers', () => props.lineNumbers, true)
const resolvedMode = useGrComponentProp('GrDiff', 'mode', () => props.mode, 'unified')
const resolvedContext = useGrComponentProp('GrDiff', 'context', () => props.context, GR_DIFF_DEFAULT_CONTEXT)

/**
 * Язык по умолчанию выводится из входа, а не берётся `text` на всякий случай.
 *
 * Не-строку сериализует сам компонент — значит это JSON, и разбирать его как
 * обычный текст значило бы показать серым ровно то, что `GrCodeBlock` на
 * соседнем экране красит. Строку выводить не из чего: конфиг, лог и патч
 * приходят строкой одинаково.
 */
const resolvedLanguage = computed(() => {
  if (props.language !== undefined)
    return props.language

  const fromValues = props.hunks === undefined
    && (typeof props.before !== 'string' || typeof props.after !== 'string')

  return fromValues ? 'json' : 'text'
})
const resolvedExpandStep = useGrComponentProp('GrDiff', 'expandStep', () => props.expandStep, GR_DIFF_DEFAULT_EXPAND_STEP)

/** Готовый дифф с бэкенда в наши строки. Нумерация считается здесь же. */
function fromHunks(hunks: GrDiffHunk[]): { lines: GrDiffLine[], added: number, removed: number } {
  const lines: GrDiffLine[] = []
  let beforeNumber = 0
  let afterNumber = 0
  let added = 0
  let removed = 0

  for (const hunk of hunks) {
    for (const text of hunk.lines) {
      if (hunk.op === 'equal') {
        beforeNumber += 1
        afterNumber += 1
        lines.push({ op: 'equal', text, beforeNumber, afterNumber })
        continue
      }

      if (hunk.op === 'remove') {
        beforeNumber += 1
        removed += 1
        lines.push({ op: 'remove', text, beforeNumber, afterNumber: null })
        continue
      }

      afterNumber += 1
      added += 1
      lines.push({ op: 'add', text, beforeNumber: null, afterNumber })
    }
  }

  return { lines, added, removed }
}

/**
 * Дифф считается один раз на смену входа.
 *
 * Не-строка сериализуется **устойчивым порядком ключей**: два объекта с
 * одинаковым содержимым и разным порядком дали бы выдуманные различия, и
 * потребитель увидел бы правку там, где её не было.
 */
const result = computed(() => {
  if (props.hunks)
    return { ...fromHunks(props.hunks), degraded: false }

  const before = typeof props.before === 'string' ? props.before : serializeStable(props.before)
  const after = typeof props.after === 'string' ? props.after : serializeStable(props.after)

  return diffLines(before, after, { budget: props.budget })
})

watch(() => result.value.degraded, (degraded) => {
  if (degraded)
    emit('budgetExceeded')
}, { immediate: true })

/** Скроллер: он же удерживает позицию при раскрытии сверху. */
const scroller = ref<HTMLElement | null>(null)

/** Раскрытые края пропусков. Ключ — позиция, поэтому раскрытие соседа его не сдвигает. */
const expanded = ref(new Map<string, GrDiffGapExpansion>())

watch(result, () => {
  expanded.value = new Map()
})

function expand(gap: GrDiffGap, edge: GrDiffGapEdge): void {
  const next = new Map(expanded.value)
  next.set(gap.id, expandGap(expanded.value.get(gap.id), edge, gap.hidden, resolvedExpandStep.value))
  expanded.value = next

  if (edge === 'top')
    void keepPlaceAfterExpand()

  emit('expand', gap.id, edge)
}

/**
 * Раскрытие сверху удерживает пропуск на месте.
 *
 * Строки встают **над** ним, и без поправки на их высоту содержимое уезжает
 * вниз ровно на столько же: пользователь нажал «показать ещё» и потерял из виду
 * ту самую правку, ради которой смотрел. При пятистах строках разом это выглядит
 * как «строки пропали», при десяти — как прыжок на пол-экрана; поправка нужна в
 * обоих случаях.
 *
 * Прирост берётся замером, а не расчётом `строк × высоту`: высота строки зависит
 * от кегля и переноса, и расчёт разошёлся бы с раскладкой на первом же длинном
 * значении.
 */
async function keepPlaceAfterExpand(): Promise<void> {
  const element = scroller.value

  if (!element)
    return

  const before = element.scrollHeight

  await nextTick()

  const grown = element.scrollHeight - before

  if (grown <= 0)
    return

  // Со своей прокруткой правит себя, без неё — растёт в потоке страницы и
  // сдвигает всё, что ниже; тогда поправку берёт на себя окно.
  if (element.scrollHeight > element.clientHeight)
    element.scrollTop += grown
  else if (typeof window !== 'undefined')
    window.scrollBy(0, grown)
}

const rows = computed<GrDiffRow[]>(() => collapseUnchanged(result.value.lines, {
  context: resolvedContext.value,
  expanded: expanded.value,
}))

const splitRows = computed<GrDiffSplitEntry[]>(() => toSplitRows(rows.value))

/** Что реально рисуется: в `unified` — строки, в `split` — пары. */
const entries = computed<Array<GrDiffRow | GrDiffSplitEntry>>(
  () => resolvedMode.value === 'split' ? splitRows.value : rows.value,
)

// ── Подсветка ───────────────────────────────────────────────────────────────

const providedTokenizer = inject(GR_CODE_HIGHLIGHTER_KEY, null)
const tokenizer = computed(() => props.highlighter ?? providedTokenizer)

/**
 * Подсветка считается по строкам целиком, а не по видимому окну: иначе роль
 * зависела бы от прокрутки, а многострочные конструкции языка рвались бы на
 * границе окна.
 */
const highlighted = shallowRef<Map<string, GrCodeLine> | null>(null)

watch(
  () => [result.value, resolvedLanguage.value, tokenizer.value] as const,
  ([diff, language, tokenize]) => {
    highlighted.value = null

    if (!tokenize)
      return

    const texts = [...new Set(diff.lines.map(line => line.text))]
    const outcome = tokenize(texts.join('\n'), language)

    const apply = (lines: GrCodeLine[]): void => {
      const map = new Map<string, GrCodeLine>()
      texts.forEach((text, index) => {
        const line = lines[index]
        if (line)
          map.set(text, line)
      })
      highlighted.value = map
    }

    if (!(outcome instanceof Promise)) {
      apply(outcome)
      return
    }

    // Гонка: ответ на позапрошлый вход подсветил бы не то.
    const requested = { diff, language, tokenize }

    void outcome.then((lines) => {
      if (requested.diff === result.value
        && requested.language === resolvedLanguage.value
        && requested.tokenize === tokenizer.value) {
        apply(lines)
      }
    })
  },
  { immediate: true },
)

/**
 * Роли строки: подсветка приложения, а без неё — встроенный разбор.
 *
 * Тот же `builtInLine`, что у блока и у редактора. Без него дифф показывал бы
 * JSON серым рядом с `GrCodeBlock`, который тот же JSON красит, — а сравнивают
 * чаще всего именно то, что до этого смотрели блоком.
 */
function tokensOf(text: string): GrCodeLine {
  return highlighted.value?.get(text) ?? builtInLine(text, resolvedLanguage.value)
}

// ── Пословная подсветка ─────────────────────────────────────────────────────

/**
 * Пары «удалено / добавлено» из свёрнутых рядов — по ним считается пословный
 * разбор. Считается лениво и мемоизируется: пересчитывать на каждый кадр
 * прокрутки незачем.
 */
const wordPairs = computed(() => {
  const map = new Map<GrDiffLine, GrDiffWord[]>()

  for (const entry of splitRows.value) {
    if (entry.kind !== 'pair' || !entry.left || !entry.right)
      continue

    // Равная строка в паре стоит по обе стороны одним и тем же объектом.
    // Пословный разбор ей не нужен вовсе, а попади она сюда — перекрыла бы
    // подсветку синтаксиса: ветка со словами в шаблоне идёт первой.
    if (entry.left === entry.right)
      continue

    const { before, after } = diffWords(entry.left.text, entry.right.text)
    map.set(entry.left, before)
    map.set(entry.right, after)
  }

  return map
})

// ── Виртуализация ───────────────────────────────────────────────────────────

/**
 * Окно отрисовки. Схлопывание уже сокращает дифф с одной правкой до десятков
 * рядов, но дифф, где изменилось всё, схлопывать нечего — там в DOM уехали бы
 * тысячи строк.
 *
 * Оценка высоты строки берётся от кегля, а не замеряется: замер на сервере
 * невозможен, а детерминированный первый рендер нужен, чтобы гидрация не
 * разъехалась.
 */
const rowSizeEstimate: Record<GrComponentSize, number> = { xs: 16, sm: 18, md: 20, lg: 24 }

const virtual = useVirtualList({
  container: scroller,
  count: () => entries.value.length,
  itemSize: () => rowSizeEstimate[resolvedSize.value],
  viewportSize: () => typeof props.maxHeight === 'number' ? props.maxHeight : undefined,
  source: () => entries.value,
})

const visible = computed(() => entries.value.slice(virtual.range.value.start, virtual.range.value.end))

// ── Оформление ──────────────────────────────────────────────────────────────

const scrollStyle = computed(() => {
  if (props.maxHeight === undefined)
    return undefined

  return { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight }
})

const wrapClass = computed(() => resolvedWrap.value ? diffWrapClass : diffNowrapClass)

const summary = computed(() => {
  const { added, removed } = result.value

  if (added === 0 && removed === 0)
    return t('grCode.diff.unchanged', 'No changes')

  return t('grCode.diff.summary', 'Lines added: {added}, removed: {removed}', { added, removed })
})

/**
 * Сравнивать нечего.
 *
 * Два случая, а не один: пустые строки на входе дают одну пустую строку, а
 * пустой `hunks` с сервера — вообще ни одной. Проверяй только первый — ответ
 * «ревизия ещё не собрана» рисовался бы пустой рамкой без единого слова.
 */
const isEmpty = computed(() => {
  const { lines } = result.value

  return lines.length === 0 || (lines.length === 1 && lines[0]?.text === '')
})

const signOf = (op: GrDiffLine['op']): string => op === 'add' ? '+' : op === 'remove' ? '−' : ' '

defineExpose({
  /** Прокрутить к ряду по индексу — для «следующее изменение» у потребителя. */
  scrollToRow: virtual.scrollToIndex,
})
</script>

<template>
  <div :class="[diffHookClass, diffRootClass, diffFontClass, diffSizeClass(resolvedSize)]">
    <!--
      Сводка — живой регион: без неё диктор читает поток строк, не понимая,
      что перед ним сравнение.
    -->
    <div :class="diffSummaryClass" role="status">
      <slot name="summary" :added="result.added" :removed="result.removed" :degraded="result.degraded">
        {{ summary }}
        <span v-if="result.degraded">· {{ t('grCode.diff.budgetExceeded', 'The comparison is too large, showing a coarser result') }}</span>
      </slot>
    </div>

    <slot v-if="isEmpty" name="empty">
      <div class="px-3 py-2 text-[var(--gr-muted-fg)]">
        {{ t('grCode.diff.empty', 'Nothing to compare') }}
      </div>
    </slot>

    <div
      v-else
      ref="scroller"
      :class="[diffScrollClass, wrapClass]"
      :style="[scrollStyle, virtual.spacerStyle.value]"
      data-gr-virtual
      tabindex="0"
      role="region"
      :aria-label="ariaLabel ?? t('grCode.diff.label', 'Comparison')"
    >
      <template v-for="(entry, index) in visible" :key="index">
        <!--
          Пропуск. Крупный открывается шагами с обоих краёв — как в обзоре кода:
          нужный кусок ищут рядом с правкой, а не разворачивают весь файл.
          Остаток в один шаг открывать по краям уже незачем — одна кнопка.
        -->
        <div
          v-if="entry.kind === 'gap'"
          :ref="el => virtual.measure(virtual.range.value.start + index, el as Element | null)"
          :class="diffGapRowClass"
        >
          <button
            v-if="entry.hidden <= resolvedExpandStep"
            type="button"
            :class="diffGapClass"
            @click="expand(entry, 'top')"
          >
            {{ t('grCode.diff.expand', 'Show {count} more lines', { n: entry.hidden, count: entry.hidden }) }}
          </button>

          <template v-else>
            <button
              type="button"
              :class="diffGapEdgeClass"
              :aria-label="t('grCode.diff.expandTop', 'Show {count} lines at the top of the gap', { n: resolvedExpandStep, count: resolvedExpandStep })"
              @click="expand(entry, 'top')"
            >
              <span aria-hidden="true">↓ {{ resolvedExpandStep }}</span>
            </button>

            <span :class="diffGapCountClass">
              {{ t('grCode.diff.hidden', '{count} lines hidden', { n: entry.hidden, count: entry.hidden }) }}
            </span>

            <button
              type="button"
              :class="diffGapEdgeClass"
              :aria-label="t('grCode.diff.expandBottom', 'Show {count} lines at the bottom of the gap', { n: resolvedExpandStep, count: resolvedExpandStep })"
              @click="expand(entry, 'bottom')"
            >
              <span aria-hidden="true">↑ {{ resolvedExpandStep }}</span>
            </button>
          </template>
        </div>

        <!-- unified: одна строка на ряд -->
        <div
          v-else-if="entry.kind === 'line'"
          :ref="el => virtual.measure(virtual.range.value.start + index, el as Element | null)"
          class="flex"
          :class="[diffRowClass, diffRowTone[entry.line.op]]"
        >
          <span v-if="resolvedLineNumbers" :class="[diffGutterCellClass, diffGutterClass]">{{ entry.line.beforeNumber ?? '' }}</span>
          <span v-if="resolvedLineNumbers" :class="[diffGutterCellClass, diffGutterClass]">{{ entry.line.afterNumber ?? '' }}</span>
          <span :class="diffSignClass" aria-hidden="true">{{ signOf(entry.line.op) }}</span>
          <span class="flex-1">
            <template v-if="wordPairs.get(entry.line)">
              <span
                v-for="(word, wordIndex) in wordPairs.get(entry.line)"
                :key="wordIndex"
                :class="word.changed && entry.line.op !== 'equal' ? diffWordTone[entry.line.op] : ''"
              >{{ word.text }}</span>
            </template>
            <template v-else>
              <span
                v-for="(token, tokenIndex) in tokensOf(entry.line.text)"
                :key="tokenIndex"
                :class="codeTokenClass[token.role]"
              >{{ token.text }}</span>
            </template>
          </span>
          <slot name="row-actions" :line="entry.line" />
        </div>

        <!-- split: пара колонок -->
        <div
          v-else
          :ref="el => virtual.measure(virtual.range.value.start + index, el as Element | null)"
          class="flex"
          :class="diffRowClass"
        >
          <div class="flex" :class="[diffSplitCellClass, entry.left ? diffRowTone[entry.left.op] : '']">
            <span v-if="resolvedLineNumbers" :class="[diffGutterCellClass, diffGutterClass]">{{ entry.left?.beforeNumber ?? '' }}</span>
            <span :class="diffSignClass" aria-hidden="true">{{ entry.left ? signOf(entry.left.op) : ' ' }}</span>
            <span class="flex-1">
              <template v-if="entry.left && wordPairs.get(entry.left)">
                <span
                  v-for="(word, wordIndex) in wordPairs.get(entry.left)"
                  :key="wordIndex"
                  :class="word.changed ? diffWordTone.remove : ''"
                >{{ word.text }}</span>
              </template>
              <template v-else-if="entry.left">
                <span
                  v-for="(token, tokenIndex) in tokensOf(entry.left.text)"
                  :key="tokenIndex"
                  :class="codeTokenClass[token.role]"
                >{{ token.text }}</span>
              </template>
            </span>
          </div>
          <div class="flex" :class="[diffSplitCellClass, entry.right ? diffRowTone[entry.right.op] : '']">
            <span v-if="resolvedLineNumbers" :class="[diffGutterCellClass, diffGutterClass]">{{ entry.right?.afterNumber ?? '' }}</span>
            <span :class="diffSignClass" aria-hidden="true">{{ entry.right ? signOf(entry.right.op) : ' ' }}</span>
            <span class="flex-1">
              <template v-if="entry.right && wordPairs.get(entry.right)">
                <span
                  v-for="(word, wordIndex) in wordPairs.get(entry.right)"
                  :key="wordIndex"
                  :class="word.changed ? diffWordTone.add : ''"
                >{{ word.text }}</span>
              </template>
              <template v-else-if="entry.right">
                <span
                  v-for="(token, tokenIndex) in tokensOf(entry.right.text)"
                  :key="tokenIndex"
                  :class="codeTokenClass[token.role]"
                >{{ token.text }}</span>
              </template>
            </span>
          </div>
          <slot name="row-actions" :line="(entry.right ?? entry.left)!" />
        </div>
      </template>
    </div>
  </div>
</template>

<style>
/*
 * Распорки виртуального списка — контракт `useVirtualList`.
 *
 * Композабл отдаёт только высоты переменными; сами псевдоэлементы обязан
 * объявить потребитель. Без этого правила переменные некому прочитать:
 * контейнер остаётся высотой в одно окно, прокрутки нет вовсе, и виден лишь
 * первый десяток строк — остальное недостижимо. Разметка при этом валидна,
 * тесты зелёные, и увидеть отказ можно только глазами.
 *
 * Правило дублируется в каждом потребителе, а не лежит в общем файле: единый
 * глобальный стиль пакета потребитель вправе не подключать, и уехавшее туда
 * правило молча ломало бы прокрутку. Копия совпадает с ядерной дословно —
 * сверяет `virtualSpacer.test.ts`.
 */
[data-gr-virtual]::before,
[data-gr-virtual]::after {
    content: '';
    display: block;
    flex: none;
}

[data-gr-virtual]::before {
    height: var(--gr-virtual-before, 0px);
}

[data-gr-virtual]::after {
    height: var(--gr-virtual-after, 0px);
}
</style>
