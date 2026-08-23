<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch } from 'vue'

import { Editor } from '@tiptap/core'
import { Placeholder } from '@tiptap/extensions'

// Содержимое рисует ProseMirror, поэтому у компонента есть настоящий CSS.
// Импорт здесь, а не `cssFiles` в конфиге: `libInjectCss` вошьёт его в чанк
// компонента, и отдельного файла в `dist` не появится — как у всех спутников.
import './tokens.css'
import './styles.css'

import GrButton from '@feugene/granularity/components/GrButton'
import GrPopover from '@feugene/granularity/components/GrPopover'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGrFormControl } from '@feugene/granularity/composables/useGrFormControl'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { useRovingFocus } from '@feugene/granularity/composables/useRovingFocus'

import type { GrRichTextAction, GrRichTextExtension, GrRichTextSchemaName } from '../../editor/schemas'
import { createSchema } from '../../editor/schemas'

import { iconPathsFor } from './icons'
import type { GrRichTextSize } from './grRichTextStyles'
import {
  bubbleClass,
  contentClass,
  fieldFooterClass,
  fieldHeaderClass,
  iconClass,
  rootClass,
  rootDisabledClass,
  rootFocusClass,
  rootInvalidClass,
  sizeClasses,
  toolbarButtonSize,
  toolbarClass,
  toolbarSeparatorClass,
} from './grRichTextStyles'

/**
 * GrRichText — поле форматированного текста.
 *
 * Разметку хранит и разбирает ProseMirror, и это же **и есть санитайзер**:
 * содержимое разбирается по схеме, узлы и марки вне её отбрасываются, а на
 * выход документ сериализуется из того же дерева. `<script>` не переживает
 * разбора — поэтому отдельного санитайзера в пакете нет.
 *
 * Что вместо него не сделано: пакет не показывает чужой HTML. Он поле ввода, а
 * не публикация, и `v-html` в нём отсутствует намеренно — это была бы
 * единственная XSS-поверхность ровно там, где данные приходят от пользователя.
 */
export interface GrRichTextProps {
  /**
   * Значение: строка HTML либо документ TipTap — по `output`.
   *
   * Форму задаёт проп, а не поведение пользователя: то же решение, что у
   * `valueAdapter` в `granularity-chrono`.
   */
  modelValue?: string | Record<string, unknown> | null
  /** В каком виде значение уходит наружу. */
  output?: 'html' | 'json'
  /** Готовая схема: `minimal` или `article`. */
  schema?: GrRichTextSchemaName
  /**
   * Свои расширения TipTap **в дополнение** к схеме — упоминания, картинки,
   * таблица. Заменять набор схемы они не пытаются: тулбар строится по ней, и
   * подмена оставила бы кнопки без команд.
   */
  extensions?: GrRichTextExtension[]
  /** Подсказка в пустом поле. */
  placeholder?: string
  /**
   * Где живут кнопки форматирования: панель сверху, пузырьковое меню у
   * выделения, оба или ничего.
   */
  toolbar?: boolean | 'bubble' | 'both'
  size?: GrRichTextSize
  /** Собственный `id` области ввода. Не задан — берётся из `GrFormField`. */
  id?: string
  /** Имя для нативной формы: значение уходит скрытым полем. */
  name?: string
  disabled?: boolean
  /** Значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  ariaLabel?: string
}

export interface GrRichTextEmits {
  (e: 'update:modelValue', value: string | Record<string, unknown>): void
  (e: 'change', value: string | Record<string, unknown>): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<GrRichTextProps>(), {
  modelValue: undefined,
  output: 'html',
  schema: 'minimal',
  extensions: undefined,
  placeholder: undefined,
  toolbar: true,
  // `undefined`, а не `md`: настоящий дефолт живёт в `useGrComponentSize`,
  // иначе `GrConfigProvider` до компонента не дотянется.
  size: undefined,
  id: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrRichTextEmits>()

const { t } = useGranularityTranslations()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrRichText' })
const field = useGrFormControl(() => props)

const fallbackId = useId()
const inputId = computed(() => props.id ?? field.id.value ?? fallbackId)

const hostEl = ref<HTMLElement | null>(null)
/** `shallowRef`: у документа ProseMirror своя реактивность, чужая ему вредна. */
const editor = shallowRef<Editor | null>(null)
/** Счётчик правок — им перерисовывается тулбар: сам редактор не реактивен. */
const revision = ref(0)

const schema = computed(() => createSchema(props.schema))

const actions = computed<GrRichTextAction[]>(() => schema.value.actions)

const showToolbar = computed(() => props.toolbar === true || props.toolbar === 'both')
const showBubble = computed(() => props.toolbar === 'bubble' || props.toolbar === 'both')

// ————— Значение.

function readValue(instance: Editor): string | Record<string, unknown> {
  return props.output === 'json' ? instance.getJSON() as Record<string, unknown> : instance.getHTML()
}

/** В форму уходит текст: разметку сериализуем строкой в любом режиме модели. */
const formValue = computed(() => {
  void revision.value

  return editor.value ? editor.value.getHTML() : ''
})

function emitValue(instance: Editor): void {
  const value = readValue(instance)

  emit('update:modelValue', value)
  emit('change', value)
}

/**
 * Форма модели обязана совпадать с `output`.
 *
 * `setContent` принимает и строку, и документ, поэтому чужая форма приезжает
 * молча — а первая же правка отдаёт наружу форму из `output`, и значение
 * меняет тип под потребителем. Ошибкой это не делаем: значение показано, поле
 * работает, — но в разработке об этом надо знать.
 */
let shapeWarned = false

function checkShape(value: unknown): void {
  if (!__GR_DEV__ || shapeWarned || value === undefined || value === null)
    return

  const isObject = typeof value === 'object'
  if (isObject === (props.output === 'json'))
    return

  shapeWarned = true
  console.warn(
    `[granularity-editor] GrRichText: модель ${isObject ? 'объект' : 'строка'}, а \`output\` — `
    + `\`${props.output}\`. Первая правка отдаст наружу другую форму значения.`,
  )
}

// ————— Жизненный цикл.

function editorAttributes(): Record<string, string> {
  const attributes: Record<string, string> = {
    'id': inputId.value,
    'aria-multiline': 'true',
    'class': contentClass,
  }

  if (props.ariaLabel)
    attributes['aria-label'] = props.ariaLabel
  if (field.describedBy.value)
    attributes['aria-describedby'] = field.describedBy.value
  if (field.invalid.value)
    attributes['aria-invalid'] = 'true'
  if (field.required.value)
    attributes['aria-required'] = 'true'
  if (field.labelId.value && !props.ariaLabel)
    attributes['aria-labelledby'] = field.labelId.value

  return attributes
}

/**
 * Редактор поднимается **после монтирования**, а не в `setup`.
 *
 * ProseMirror требует DOM, поэтому на сервере его нет вовсе: серверная разметка
 * — пустая оболочка, а участок помечен `data-allow-mismatch`, иначе гидрация
 * сообщит о расхождении, которого мы и добиваемся сознательно.
 */
function create(content: unknown): void {
  if (!hostEl.value)
    return

  editor.value = new Editor({
    element: hostEl.value,
    extensions: [
      ...schema.value.extensions,
      ...(props.extensions ?? []),
      Placeholder.configure({ placeholder: () => props.placeholder ?? '' }),
    ],
    content: content as string,
    editable: !field.locked.value,
    editorProps: { attributes: editorAttributes() },
    onUpdate: ({ editor: instance }) => {
      revision.value += 1
      emitValue(instance)
    },
    onSelectionUpdate: () => {
      revision.value += 1
      updateBubble()
    },
    onFocus: () => emit('focus'),
    onBlur: () => {
      closeBubble()
      emit('blur')
    },
  })
}

onMounted(() => {
  checkShape(props.modelValue)
  create(props.modelValue ?? '')
})

onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = null
})

/**
 * Схема и набор расширений пересобирают редактор.
 *
 * Заменить их на живом экземпляре нельзя: схема ProseMirror неизменяема, из неё
 * выведены и документ, и команды. Читай их только при монтировании — и смена
 * `schema` меняла бы **тулбар**, не трогая правил документа: кнопка «Заголовок»
 * осталась бы у схемы, которая заголовков не допускает.
 *
 * Текст переносится в новый экземпляр и по дороге проходит разбор: узлы, которых
 * в новой схеме нет, отбрасываются — то же правило, что и при вставке.
 */
watch([() => props.schema, () => props.extensions], () => {
  const previous = editor.value
  if (!previous)
    return

  // Разметкой, а не документом: JSON разбирается строго, и первый же узел,
  // которого нет в новой схеме, уносит с собой весь текст. HTML разбирается
  // терпимо — заголовок станет абзацем, а написанное уцелеет.
  const carried = previous.getHTML()

  previous.destroy()
  create(carried)
  revision.value += 1
})

// Значение сменилось снаружи — документ пересобирается. Сравнение обязательно:
// без него каждый собственный `onUpdate` возвращался бы сюда и сбрасывал
// курсор в начало на каждом нажатии клавиши.
watch(() => props.modelValue, (next) => {
  const instance = editor.value
  if (!instance)
    return

  checkShape(next)

  const current = readValue(instance)
  if (JSON.stringify(current) === JSON.stringify(next ?? ''))
    return

  instance.commands.setContent((next ?? '') as string, { emitUpdate: false })
})

watch(field.locked, (locked) => {
  editor.value?.setEditable(!locked)
})

// ————— Тулбар.

function isActive(action: GrRichTextAction): boolean {
  void revision.value
  const instance = editor.value
  if (!instance || !action.active)
    return false

  return action.activeAttrs
    ? instance.isActive(action.active, action.activeAttrs)
    : instance.isActive(action.active)
}

/**
 * Выполнить команду действия.
 *
 * `focus()` в цепочке — не косметика: клик по кнопке уводит фокус из
 * редактируемой области, и без возврата команда применилась бы к пустому
 * выделению. Выделение при этом восстанавливает сам TipTap — оно живёт в его
 * состоянии, а не в DOM.
 */
function run(action: GrRichTextAction): void {
  const instance = editor.value
  if (!instance || field.locked.value)
    return

  const chain = instance.chain().focus() as unknown as Record<string, (args?: unknown) => { run: () => void }>
  const command = chain[action.command]
  if (typeof command !== 'function')
    return

  command.call(chain, action.commandArgs).run()
}

const toolbarKeys = computed(() => actions.value.map(action => action.key))

const toolbarButtons = ref(new Map<string, HTMLElement>())

function setButtonEl(key: string, element: unknown): void {
  if (element instanceof HTMLElement)
    toolbarButtons.value.set(key, element)
  else toolbarButtons.value.delete(key)
}

/**
 * Тулбар — одна остановка `Tab`, стрелки внутри.
 *
 * Без роверной навигации до самого текста пришлось бы добираться десятком
 * табов: кнопок форматирования у «статьи» десять.
 */
const roving = useRovingFocus<string>({
  items: () => toolbarKeys.value,
  elementFor: key => toolbarButtons.value.get(key) ?? null,
  orientation: () => 'horizontal',
})

/** Разделитель ставится там, где меняется группа: панель читается блоками. */
function startsGroup(index: number): boolean {
  return index > 0 && actions.value[index]?.group !== actions.value[index - 1]?.group
}

// ————— Пузырьковое меню.

const bubbleRect = ref<{ x: number, y: number, width: number, height: number } | null>(null)

const bubbleOpen = computed(() => showBubble.value && !field.locked.value && bubbleRect.value !== null)

function closeBubble(): void {
  bubbleRect.value = null
}

/**
 * Пузырёк живёт при выделении, а не сам по себе, поэтому закрытие с той стороны
 * (Esc) обязано погасить якорь: иначе `open` тут же вернулся бы в `true`.
 *
 * Клик вне у него отключён намеренно. Слушать пришлось бы `click`, а именно им
 * заканчивается протяжка выделения — пузырёк закрывался бы ровно в тот момент,
 * когда должен появиться. Источник истины один: выделение и фокус в поле.
 */
function onBubbleOpen(next: boolean): void {
  if (!next)
    closeBubble()
}

/**
 * Якорь пузырька — прямоугольник выделения в координатах вьюпорта: у выделения
 * нет своего элемента, и `GrPopover` для такого случая принимает `anchor`.
 */
function updateBubble(): void {
  const instance = editor.value
  if (!showBubble.value || !instance || field.locked.value)
    return closeBubble()

  const { from, to, empty } = instance.state.selection
  if (empty)
    return closeBubble()

  try {
    const start = instance.view.coordsAtPos(from)
    const end = instance.view.coordsAtPos(to)
    const left = Math.min(start.left, end.left)
    const right = Math.max(start.right, end.right)

    bubbleRect.value = {
      x: left,
      y: Math.min(start.top, end.top),
      width: Math.max(right - left, 1),
      height: Math.max(end.bottom - start.top, 1),
    }
  }
  catch {
    // Позиция вне отрисованного документа — показывать нечего.
    closeBubble()
  }
}

defineSlots<{
  /**
   * Полоса над областью ввода: подпись, счётчик, переключатель режима.
   *
   * Отдельная зона, а не место в тулбаре: тулбар строится по схеме и водит
   * фокус ровером, а тут содержимое потребителя со своей клавиатурой.
   */
  header?: () => any
  /** Полоса под областью ввода: счётчик символов, подсказка, кнопки отправки. */
  footer?: () => any
  /** Подмена кнопки тулбара по ключу действия. */
  [key: `action-${string}`]: ((props: { action: unknown, active: boolean }) => any) | undefined
}>()

defineExpose({
  /** Инстанс TipTap: своя команда, своё расширение, свой плагин. */
  editor: computed(() => editor.value),
  focus: () => editor.value?.commands.focus(),
  blur: () => editor.value?.commands.blur(),
})

const rootClasses = computed(() => [
  rootClass,
  sizeClasses[resolvedSize.value],
  field.disabled.value ? rootDisabledClass : rootFocusClass,
  field.invalid.value ? rootInvalidClass : '',
])
</script>

<template>
  <div data-gr-rich-text :class="rootClasses">
    <!-- Форме уходит разметка строкой: скрытое поле не умеет объектов. -->
    <input v-if="name" type="hidden" :name="name" :value="formValue">

    <div
      v-if="showToolbar"
      data-gr-rich-text-toolbar
      role="toolbar"
      :aria-label="t('grEditor.richText.toolbar', 'Formatting')"
      :aria-controls="inputId"
      :class="toolbarClass"
      @keydown="roving.handleNavigationKeys"
    >
      <template v-for="(action, index) in actions" :key="action.key">
        <span v-if="startsGroup(index)" :class="toolbarSeparatorClass" aria-hidden="true" />

        <GrButton
          :ref="element => setButtonEl(action.key, (element as { $el?: unknown } | null)?.$el ?? element)"
          data-gr-rich-text-action
          :data-key="action.key"
          :size="toolbarButtonSize[resolvedSize]"
          variant="ghost"
          square
          :disabled="field.locked.value"
          :aria-pressed="isActive(action)"
          :aria-label="t(action.labelKey, action.labelFallback)"
          :tabindex="roving.tabindexFor(action.key)"
          :title="t(action.labelKey, action.labelFallback)"
          @click="run(action)"
          @focus="roving.setActive(action.key)"
        >
          <slot :name="`action-${action.key}`" :action="action" :active="isActive(action)">
            <svg
              :class="iconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-for="(d, path) in iconPathsFor(action.key)" :key="path" :d="d" />
            </svg>
          </slot>
        </GrButton>
      </template>
    </div>

    <div v-if="$slots.header" data-gr-rich-text-header :class="fieldHeaderClass">
      <slot name="header" />
    </div>

    <!-- Содержимое приезжает после монтирования: ProseMirror требует DOM, и на
         сервере области ввода не существует. -->
    <div ref="hostEl" data-gr-rich-text-content data-allow-mismatch="children" />

    <div v-if="$slots.footer" data-gr-rich-text-footer :class="fieldFooterClass">
      <slot name="footer" />
    </div>

    <GrPopover
      v-if="showBubble"
      trigger="manual"
      :open="bubbleOpen"
      :anchor="bubbleRect"
      placement="top"
      size="sm"
      :close-on-content-click="false"
      :auto-focus="false"
      :close-on-click-outside="false"
      @update:open="onBubbleOpen"
    >
      <template #content>
        <div data-gr-rich-text-bubble :class="bubbleClass">
          <!-- `mousedown.prevent` здесь обязателен, в отличие от панели сверху:
               пузырёк держится на фокусе в тексте, и уход фокуса на кнопку гасит
               его блюром прямо под курсором — второй формат подряд применить уже
               нечем. Панель сверху от фокуса не зависит и обходится без этого. -->
          <GrButton
            v-for="action in actions"
            :key="action.key"
            data-gr-rich-text-bubble-action
            :data-key="action.key"
            :size="toolbarButtonSize[resolvedSize]"
            variant="ghost"
            square
            :aria-pressed="isActive(action)"
            :aria-label="t(action.labelKey, action.labelFallback)"
            :title="t(action.labelKey, action.labelFallback)"
            @mousedown.prevent
            @click="run(action)"
          >
            <svg
              :class="iconClass"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-for="(d, path) in iconPathsFor(action.key)" :key="path" :d="d" />
            </svg>
          </GrButton>
        </div>
      </template>
    </GrPopover>
  </div>
</template>
