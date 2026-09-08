<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import type { GrComponentSize } from '../shared/sizes'
import { useHotkeys } from '../../composables/useHotkeys'
import { formatHotkeyTokens, isAppleDevice, splitHotkeySequence } from '../shared/hotkey'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  grKbdComboClass,
  grKbdInnerKeyClass,
  grKbdKeyClass,
  separatorClass,
  sequenceSeparatorClass,
  type GrKbdVariant,
} from './grKbdStyles'

export interface GrKbdProps {
  size?: GrKbdSize
  /**
   * `merged` (по умолчанию) — сочетание одной плашкой, как его пишут сами
   * системы: `⌘K` на macOS, `Ctrl+K` на прочих. `split` — по плашке на клавишу.
   * `sequence` — аккорд «G затем I»: клавиши нажимают одну за другой.
   */
  variant?: GrKbdVariant
  /**
   * Сочетание: строкой (`"mod+shift+K"`) или набором токенов
   * (`['mod', 'K']`). Токен `mod` — Cmd на macOS, Ctrl на остальных.
   *
   * Пробел в строке делит её на шаги: `"g i"` рисуется как «G затем I», а
   * `"mod+k p"` — как «⌘K затем P». Форма массива остаётся плоским аккордом:
   * что там шаг, а что клавиша, массив не различает.
   */
  keys?: string | string[]
  /**
   * Идентификатор записи в реестре (`granularityHotkeysPlugin`). Сочетание
   * берётся оттуда, поэтому подсказка не может разойтись с привязкой. Сильнее
   * `keys`: если задан и он, побеждает реестр — иначе два источника спорили бы
   * молча.
   */
  hotkey?: string
  /**
   * Разделитель между клавишами. Не задан — авто: в общей плашке символы
   * склеиваются (`⌘K`), а слова разделяются плюсом (`Ctrl+K`); у `split` это
   * плюс, у `sequence` — слово из локали. Пустая строка — только зазор.
   */
  separator?: string
  platform?: GrKbdPlatform
}

/**
 * GrKbd — GR-примитив для отображения клавиш и сочетаний (`<kbd>`).
 *
 * Одна клавиша — слотом: `<GrKbd>Esc</GrKbd>`.
 * Сочетание — пропом: `<GrKbd keys="mod+K" />` (на macOS `⌘ K`, иначе `Ctrl K`).
 */
export type GrKbdSize = GrComponentSize

export type { GrKbdVariant } from './grKbdStyles'

/** Откуда брать платформу для токена `mod`. */
export type GrKbdPlatform = 'auto' | 'apple' | 'other'

const props = withDefaults(
  defineProps<GrKbdProps>(),
  {
    size: undefined,
    variant: 'merged',
    keys: undefined,
    hotkey: undefined,
    separator: undefined,
    platform: 'auto',
  },
)

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrKbd' })
const { t } = useGranularityTranslations()

/**
 * Платформа уточняется только после монтирования: `navigator` в теле `setup`
 * либо роняет серверный рендер, либо расходится с ним и ломает гидрацию.
 * До этого момента показываем не-Apple вариант — он же приходит с сервера.
 */
const detectedApple = ref(false)

onMounted(() => {
  detectedApple.value = isAppleDevice()
})

const isApple = computed(() => {
  if (props.platform === 'apple')
    return true
  if (props.platform === 'other')
    return false
  return detectedApple.value
})

const registry = useHotkeys()

/** Сочетание из реестра сильнее пропа: два источника молча спорить не должны. */
const source = computed<string | string[] | undefined>(() => {
  if (props.hotkey !== undefined)
    return registry.keysOf(props.hotkey)

  return props.keys
})

/**
 * Шаги сочетания. Аккорд — один шаг, `"g i"` — два. Массив токенов остаётся
 * одним шагом: делить его не по чему.
 */
const steps = computed<string[][]>(() => {
  const value = source.value
  if (value === undefined)
    return []

  if (Array.isArray(value))
    return value.length > 0 ? [value] : []

  return splitHotkeySequence(value)
})

/**
 * Токены плоским списком плюс индексы, с которых начинается новый шаг:
 * `separatorAt` по ним и отличает границу шага от границы клавиш внутри него.
 * Плоский список — потому что на нём стоит вся отрисовка вложенными `<kbd>`.
 */
const tokens = computed(() => steps.value.flat())

const stepStarts = computed(() => {
  const starts = new Set<number>()
  let offset = 0

  for (const step of steps.value) {
    starts.add(offset)
    offset += step.length
  }

  return starts
})

// Сочетание рисуется вложенными `<kbd>` — приём из спецификации HTML, а не
// обёртка-div: сочетание остаётся клавиатурным вводом целиком.
const keyViews = computed(() => formatHotkeyTokens(tokens.value, isApple.value))
const hasCombo = computed(() => keyViews.value.length > 0)

const keyClass = computed(() => grKbdKeyClass(resolvedSize.value))
const innerKeyClass = computed(() => grKbdInnerKeyClass(resolvedSize.value, props.variant))
const comboClass = computed(() => grKbdComboClass(resolvedSize.value, props.variant))

/**
 * Разделитель перед клавишей `index`.
 *
 * Авто-правило одно: в общей плашке символы склеиваются, слова — нет. Внутри
 * одной платформы набор однороден (macOS даёт `⌘⌥⇧`, прочие — `Ctrl`, `Alt`),
 * поэтому «слева символ» и означает «пишем как система».
 */
function separatorAt(index: number): string {
  if (index === 0)
    return ''
  if (props.separator !== undefined)
    return props.separator
  // Граница шага сильнее вида: структуру задаёт сама строка, и «затем» между
  // шагами появляется независимо от того, что просили `variant`ом.
  if (stepStarts.value.has(index))
    return t('gr.kbd.then', 'then')
  if (props.variant === 'sequence')
    return t('gr.kbd.then', 'then')
  if (props.variant === 'split')
    return '+'

  return keyViews.value[index - 1]?.symbol ? '' : '+'
}

const NAME_FALLBACKS: Record<string, string> = {
  command: 'Command',
  option: 'Option',
  shift: 'Shift',
  control: 'Control',
  enter: 'Enter',
  escape: 'Escape',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  pageUp: 'Page Up',
  pageDown: 'Page Down',
  arrowUp: 'Arrow Up',
  arrowDown: 'Arrow Down',
  arrowLeft: 'Arrow Left',
  arrowRight: 'Arrow Right',
}

/** Читаемое имя символьной клавиши: `⌘` без него диктор произносит как знак. */
function readableName(name: string): string {
  return t(`gr.kbd.${name}`, NAME_FALLBACKS[name] ?? name)
}

defineSlots<{
  /** Клавиша или сочетание вместо пропа `keys`. */
  default?: () => any
}>()
</script>

<template>
  <kbd
    v-if="hasCombo"
    data-gr-kbd
    data-gr-kbd-combo
    :data-variant="variant"
    :class="comboClass"
  ><template
    v-for="(key, index) in keyViews"
    :key="`${key.label}-${index}`"
  ><span
    v-if="separatorAt(index)"
    :class="variant === 'sequence' ? sequenceSeparatorClass : separatorClass"
    aria-hidden="true"
  >{{ separatorAt(index) }}</span><kbd
    data-gr-kbd-key
    :class="innerKeyClass"
  ><span :aria-hidden="key.name ? 'true' : undefined">{{ key.label }}</span><span
    v-if="key.name"
    class="sr-only"
  >{{ readableName(key.name) }}</span></kbd></template></kbd>

  <kbd
    v-else
    data-gr-kbd
    data-gr-kbd-key
    :class="keyClass"
  ><slot /></kbd>
</template>
