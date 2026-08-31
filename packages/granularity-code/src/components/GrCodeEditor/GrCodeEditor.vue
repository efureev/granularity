<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch } from 'vue'

import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGrFormControl } from '@feugene/granularity/composables/useGrFormControl'
import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

import { clampIssues, minimalChange, type GrCodeIssue } from './editorState'
import { builtInLineTokenizer, builtInLines } from '../../highlight/builtIn'
import { codeTokenClass } from '../GrCodeBlock/grCodeBlockStyles'
import {
  editorDisabledClass,
  editorFocusClass,
  editorFontClass,
  editorHintClass,
  editorHookClass,
  editorInvalidClass,
  editorIssuesClass,
  editorIssueTone,
  editorPaddings,
  editorReadonlyClass,
  editorRootClass,
  editorTextSizes,
} from './grCodeEditorStyles'

export type { GrCodeIssue }

/**
 * Язык редактора.
 *
 * Строка — имя языка для серверной разметки и встроенного разбора. Объект или
 * массив — грамматика CodeMirror. Тик — ленивая её загрузка: редактор рисуется
 * сразу как текст и подсвечивается, когда язык приехал.
 *
 * Тип шире, чем у блока и диффа, и это следствие устройства: до монтирования
 * редактор рисует разметку блока, и ей нужна **строка**, а после монтирования
 * работает CodeMirror, которому нужна **грамматика**.
 */
export type GrCodeEditorLanguage
  = | string
    | object
    | readonly unknown[]
    | (() => Promise<unknown>)

/**
 * Редактор кода: JSON и YAML-конфиги в админке, шаблоны писем.
 *
 * Не IDE: без LSP, без множественных курсоров, без файлового дерева. Показ без
 * правки — `GrCodeBlock`, сравнение — `GrDiff`.
 */
export interface GrCodeEditorProps {
  modelValue?: string
  language?: GrCodeEditorLanguage
  /** Сырые расширения CodeMirror — escape hatch для всего, чего нет в пропах. */
  extensions?: readonly unknown[]
  placeholder?: string
  /**
   * Замечания к коду: подчёркивание в месте и метка в жёлобе.
   *
   * Контракт, а не линтер: тем же пропом отдаётся результат `JSON.parse`, схема
   * YAML или ответ серверной валидации — сценарий, которого у готового линтера
   * нет вовсе.
   */
  validate?: (value: string) => GrCodeIssue[] | Promise<GrCodeIssue[]>
  /**
   * `Tab` вставляет отступ вместо перехода фокуса.
   *
   * По умолчанию **выключено**: редактор в форме, из которого нельзя выйти
   * клавиатурой, — ловушка, и до кнопки «Сохранить» пользователь не доберётся.
   * Включён — освободить фокус можно `Esc`, и об этом сказано под полем.
   */
  tabIndents?: boolean
  lineNumbers?: boolean
  wrap?: boolean
  maxHeight?: string | number
  size?: GrComponentSize
  id?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  ariaLabel?: string
}

export interface GrCodeEditorEmits {
  (e: 'update:modelValue', value: string): void
  /** Правка завершена — на потере фокуса. Для форм, где сохранять на букву не надо. */
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrCodeEditorProps>(), {
  modelValue: '',
  language: 'text',
  placeholder: undefined,
  tabIndents: undefined,
  lineNumbers: undefined,
  wrap: undefined,
  maxHeight: undefined,
  size: undefined,
  id: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrCodeEditorEmits>()

const { t } = useGranularityTranslations()

const control = useGrFormControl(() => ({
  disabled: props.disabled,
  readonly: props.readonly,
  invalid: props.invalid,
  required: props.required,
  ariaLabel: props.ariaLabel,
}))

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCodeEditor' })
const resolvedWrap = useGrComponentProp('GrCodeEditor', 'wrap', () => props.wrap, false)
const resolvedLineNumbers = useGrComponentProp('GrCodeEditor', 'lineNumbers', () => props.lineNumbers, true)
const resolvedTabIndents = useGrComponentProp('GrCodeEditor', 'tabIndents', () => props.tabIndents, false)

const fallbackId = useId()
const inputId = computed(() => props.id ?? control.id.value ?? fallbackId)
const issuesId = computed(() => `${inputId.value}-issues`)

const host = ref<HTMLElement | null>(null)
/** Живой `EditorView`. `shallowRef`: у него своя реактивность, Vue туда не нужен. */
const view = shallowRef<unknown>(null)
const isMounted = ref(false)

// ── Замечания ───────────────────────────────────────────────────────────────

const issues = shallowRef<GrCodeIssue[]>([])

watch(
  () => [props.modelValue, props.validate] as const,
  ([value, validate]) => {
    if (!validate) {
      issues.value = []
      return
    }

    const outcome = validate(value)

    if (!(outcome instanceof Promise)) {
      issues.value = clampIssues(outcome, value.length)
      return
    }

    // Гонка: ответ на позапрошлый текст подчеркнул бы не то место.
    const requested = value

    void outcome.then((found) => {
      if (requested === props.modelValue)
        issues.value = clampIssues(found, props.modelValue.length)
    })
  },
  { immediate: true },
)

/**
 * Подписи важности — статической картой.
 *
 * Ключ, собранный строкой (`grCode.editor.severity.${severity}`), не виден
 * гейту полноты локалей: словарь молча разошёлся бы с кодом.
 */
const severityLabel = computed<Record<GrCodeIssue['severity'], string>>(() => ({
  error: t('grCode.editor.severity.error', 'Error'),
  warning: t('grCode.editor.severity.warning', 'Warning'),
  info: t('grCode.editor.severity.info', 'Note'),
}))

const describedBy = computed(() => {
  const parts = [control.describedBy.value, issues.value.length > 0 ? issuesId.value : undefined]

  return parts.filter(Boolean).join(' ') || undefined
})

/**
 * ARIA едет **внутрь** CodeMirror, а не остаётся на обёртке.
 *
 * Роль `textbox` и `contenteditable` живут на `.cm-content`; имя и описание,
 * оставленные на родителе, доступному дереву не достаются — виджет читается
 * безымянным. `EditorView.contentAttributes` — штатный способ положить их туда,
 * где роль.
 */
const contentAttributes = computed<Record<string, string>>(() => {
  const labelledBy = props.ariaLabel ? undefined : control.labelId.value
  const attributes: Record<string, string> = labelledBy
    ? { 'aria-labelledby': labelledBy }
    : { 'aria-label': props.ariaLabel ?? t('grCode.editor.label', 'Code editor') }

  if (describedBy.value)
    attributes['aria-describedby'] = describedBy.value

  if (control.invalid.value)
    attributes['aria-invalid'] = 'true'

  if (control.required.value)
    attributes['aria-required'] = 'true'

  return attributes
})

// ── Серверная разметка ──────────────────────────────────────────────────────

/**
 * Имя языка, если грамматики нет.
 *
 * Не-строка в `language` — это грамматика (`LanguageSupport`, массив расширений
 * или тик с промисом), и разбирать текст самим тогда нельзя: получилось бы две
 * подсветки поверх одного текста.
 */
const languageName = computed(() => typeof props.language === 'string' ? props.language : 'text')

/**
 * До монтирования рисуется та же разметка, что у блока: `<pre>` с текстом.
 *
 * На сервере CodeMirror не инстанцируется вовсе — ему нужен DOM. Первый экран
 * остаётся осмысленным без JS, а гидрация не расходится, потому что подмена
 * происходит после неё.
 */
const staticLines = computed(() => builtInLines(props.modelValue, languageName.value))

/**
 * Разбор для моста в декорации CodeMirror.
 *
 * Тот же источник, что у серверной разметки выше, — иначе цвет менялся бы в
 * момент гидрации. `null` означает «красить нечем»: либо приехала грамматика,
 * либо для языка встроенного разбора нет.
 */
const tokenizeLine = computed(() => props.language && typeof props.language !== 'string'
  ? null
  : builtInLineTokenizer(languageName.value))

// ── CodeMirror ──────────────────────────────────────────────────────────────

/** Метка нашей транзакции: изменение, рождённое редактором, обратно не применяется. */
let applyingFromProp = false

async function createView(): Promise<void> {
  if (!host.value)
    return

  let cm: typeof import('./codemirror')

  try {
    cm = await import('./codemirror')
  }
  catch (error) {
    if (__GR_DEV__) {
      console.warn(
        '[granularity-code] GrCodeEditor не нашёл CodeMirror. Он объявлен опциональным peer\'ом: '
        + 'поставьте @codemirror/state, @codemirror/view, @codemirror/language и @codemirror/commands. '
        + 'Пока их нет, показан код без возможности правки.',
        error,
      )
    }

    return
  }

  view.value = await cm.createEditor({
    parent: host.value,
    doc: props.modelValue,
    language: props.language,
    extensions: props.extensions,
    placeholder: props.placeholder,
    readonly: control.readonly.value || control.disabled.value,
    tabIndents: resolvedTabIndents.value,
    lineNumbers: resolvedLineNumbers.value,
    wrap: resolvedWrap.value,
    contentAttributes: contentAttributes.value,
    tokenizeLine: tokenizeLine.value,
    onChange: (value) => {
      if (applyingFromProp)
        return

      emit('update:modelValue', value)
    },
    onFocus: event => emit('focus', event),
    onBlur: (event) => {
      emit('blur', event)
      emit('change', props.modelValue)
    },
  })
}

onMounted(() => {
  isMounted.value = true
  void createView()
})

onBeforeUnmount(() => {
  const current = view.value as { destroy?: () => void } | null
  current?.destroy?.()
  view.value = null
})

/**
 * Входящее изменение применяется **транзакцией с минимальной заменой**.
 *
 * Пересоздание документа сбрасывало бы курсор, выделение и историю undo — на
 * каждом раунд-трипе `v-model`, то есть на каждой букве.
 */
watch(() => props.modelValue, async (next) => {
  const current = view.value

  if (!current)
    return

  const cm = await import('./codemirror')
  const doc = cm.docOf(current)

  if (doc === next)
    return

  const change = minimalChange(doc, next)

  if (!change)
    return

  applyingFromProp = true
  cm.applyChange(current, change)
  applyingFromProp = false
})

/** Пересоздание — только на смене языка или расширений, с сохранением документа. */
watch(() => [props.language, props.extensions] as const, async () => {
  const current = view.value as { destroy?: () => void } | null

  if (!current)
    return

  current.destroy?.()
  view.value = null
  await createView()
})

/** Остальное — реконфигурацией на живом состоянии, без пересоздания. */
watch(
  () => [
    control.readonly.value,
    control.disabled.value,
    resolvedWrap.value,
    resolvedLineNumbers.value,
    resolvedTabIndents.value,
    contentAttributes.value,
    tokenizeLine.value,
  ] as const,
  async () => {
    const current = view.value

    if (!current)
      return

    const cm = await import('./codemirror')

    cm.reconfigure(current, {
      readonly: control.readonly.value || control.disabled.value,
      wrap: resolvedWrap.value,
      lineNumbers: resolvedLineNumbers.value,
      tabIndents: resolvedTabIndents.value,
      contentAttributes: contentAttributes.value,
      tokenizeLine: tokenizeLine.value,
    })
  },
)

// ── Оформление ──────────────────────────────────────────────────────────────

const scrollStyle = computed(() => {
  if (props.maxHeight === undefined)
    return undefined

  return { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight }
})

const rootClass = computed(() => [
  editorHookClass,
  editorRootClass,
  editorFocusClass,
  editorFontClass,
  editorTextSizes[resolvedSize.value],
  control.invalid.value ? editorInvalidClass : '',
  control.disabled.value ? editorDisabledClass : '',
  control.readonly.value && !control.disabled.value ? editorReadonlyClass : '',
])

async function focus(): Promise<void> {
  const current = view.value

  if (!current)
    return

  const cm = await import('./codemirror')
  cm.focusEditor(current)
}

async function blur(): Promise<void> {
  const current = view.value

  if (!current)
    return

  const cm = await import('./codemirror')
  cm.blurEditor(current)
}

defineExpose({
  focus,
  blur,
  /**
   * Живой `EditorView` — **escape hatch без контракта**. Всё, чего пакет не
   * покрыл пропами, делается через него; на этот случай гарантий у нас нет.
   */
  getView: () => view.value,
})
</script>

<template>
  <div :class="rootClass">
    <div
      v-show="isMounted && view"
      :id="inputId"
      ref="host"
      :style="scrollStyle"
    />

    <!--
      Серверная разметка и режим без CodeMirror: тот же `<pre>`, что у блока.
      Первый экран осмыслен без JS, а подмена происходит после гидрации.
    -->
    <pre
      v-if="!isMounted || !view"
      :class="editorPaddings[resolvedSize]"
      :style="scrollStyle"
    ><code><span v-for="(tokens, index) in staticLines" :key="index" class="gr-code-editor__line"><span v-for="(token, tokenIndex) in tokens" :key="tokenIndex" :class="codeTokenClass[token.role]">{{ token.text }}</span></span></code></pre>

    <p v-if="resolvedTabIndents" :class="editorHintClass">
      {{ t('grCode.editor.escHint', 'Press Escape, then Tab, to leave the editor') }}
    </p>

    <!--
      Замечания под полем и связаны с ним через `aria-describedby`: ошибка
      остаётся доступной без зрения, а не только цветной волной под текстом.
    -->
    <ul v-if="issues.length > 0" :id="issuesId" :class="editorIssuesClass">
      <li v-for="(issue, index) in issues" :key="index" :class="editorIssueTone[issue.severity]">
        {{ severityLabel[issue.severity] }}: {{ issue.message }}
      </li>
    </ul>
  </div>
</template>

<style>
:where(.gr-code-editor__line) {
  display: block;
}

/*
 * Цвет ролей для CodeMirror.
 *
 * `HighlightStyle` умеет только вешать класс на диапазон, а не подставлять
 * утилиту UnoCSS: классы `gr-code-<role>` рождаются в рантайме из тегов Lezer,
 * и в сканируемых пресетом файлах их нет ни одной строкой. Поэтому цвет
 * объявляется здесь, обычным CSS, и берётся из тех же токенов, что у блока, —
 * иначе редактор с подключённой грамматикой оставался бы одноцветным.
 */
:where(.gr-code-editor) .gr-code-key { color: var(--gr-code-block-key, var(--gr-primary-text)); }
:where(.gr-code-editor) .gr-code-string { color: var(--gr-code-block-string, var(--gr-success-text)); }
:where(.gr-code-editor) .gr-code-number { color: var(--gr-code-block-number, var(--gr-azure-text)); }
:where(.gr-code-editor) .gr-code-literal { color: var(--gr-code-block-literal, var(--gr-warning-text)); }
:where(.gr-code-editor) .gr-code-punctuation { color: var(--gr-code-block-punctuation, var(--gr-fg)); }
:where(.gr-code-editor) .gr-code-keyword { color: var(--gr-code-block-keyword, var(--gr-danger-text)); }
:where(.gr-code-editor) .gr-code-comment { color: var(--gr-code-block-comment, var(--gr-muted-fg)); }
:where(.gr-code-editor) .gr-code-type { color: var(--gr-code-block-type, var(--gr-primary-text)); }
:where(.gr-code-editor) .gr-code-function { color: var(--gr-code-block-function, var(--gr-primary-text)); }
:where(.gr-code-editor) .gr-code-variable { color: var(--gr-code-block-variable, var(--gr-fg)); }
</style>
