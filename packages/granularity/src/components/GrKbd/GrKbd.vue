<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import type { GrComponentSize } from '../shared/sizes'
import { formatHotkeyTokens, isAppleDevice, splitHotkeyCombo } from '../shared/hotkey'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import { grKbdComboClass, grKbdKeyClass, separatorClass } from './grKbdStyles'

/**
 * GrKbd — GR-примитив для отображения клавиш и сочетаний (`<kbd>`).
 *
 * Одна клавиша — слотом: `<GrKbd>Esc</GrKbd>`.
 * Сочетание — пропом: `<GrKbd keys="mod+K" />` (на macOS `⌘ K`, иначе `Ctrl K`).
 */
export type GrKbdSize = GrComponentSize

/** Откуда брать платформу для токена `mod`. */
export type GrKbdPlatform = 'auto' | 'apple' | 'other'

const props = withDefaults(
  defineProps<{
    size?: GrKbdSize
    /**
     * Сочетание: строкой (`"mod+shift+K"`) или набором токенов
     * (`['mod', 'K']`). Токен `mod` — Cmd на macOS, Ctrl на остальных.
     */
    keys?: string | string[]
    /** Разделитель между клавишами сочетания. Пустая строка — только зазор. */
    separator?: string
    platform?: GrKbdPlatform
  }>(),
  {
    size: undefined,
    keys: undefined,
    separator: '+',
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
  if (props.platform === 'apple') return true
  if (props.platform === 'other') return false
  return detectedApple.value
})

const tokens = computed(() => {
  if (props.keys === undefined) return []
  return Array.isArray(props.keys) ? props.keys : splitHotkeyCombo(props.keys)
})

// Сочетание рисуется вложенными `<kbd>` — приём из спецификации HTML, а не
// обёртка-div: сочетание остаётся клавиатурным вводом целиком.
const keyViews = computed(() => formatHotkeyTokens(tokens.value, isApple.value))
const hasCombo = computed(() => keyViews.value.length > 0)

const keyClass = computed(() => grKbdKeyClass(resolvedSize.value))
const comboClass = computed(() => grKbdComboClass(resolvedSize.value))

const NAME_FALLBACKS: Record<string, string> = {
  command: 'Command',
  option: 'Option',
  shift: 'Shift',
  control: 'Control',
  enter: 'Enter',
  escape: 'Escape',
}

/** Читаемое имя символьной клавиши: `⌘` без него диктор произносит как знак. */
function readableName(name: string): string {
  return t(`gr.kbd.${name}`, NAME_FALLBACKS[name] ?? name)
}
</script>

<template>
  <kbd
    v-if="hasCombo"
    data-gr-kbd
    data-gr-kbd-combo
    :class="comboClass"
  ><template
    v-for="(key, index) in keyViews"
    :key="`${key.label}-${index}`"
  ><span
    v-if="index > 0 && separator"
    :class="separatorClass"
    aria-hidden="true"
  >{{ separator }}</span><kbd
    data-gr-kbd-key
    :class="keyClass"
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
