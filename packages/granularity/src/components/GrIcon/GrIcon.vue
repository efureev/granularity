<script setup lang="ts">
import { computed } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import {
  grIconToneClass,
  iconBaseClass,
  iconSizeVarBySize,
  iconSpinClass,
  type GrIconSize,
  type GrIconTone,
} from './grIconStyles'

export type { GrIconSize, GrIconTone } from './grIconStyles'

export interface GrIconProps {
  /** Размер по шкале пакета либо произвольный в пикселях. */
  size?: GrIconSize | number
  /**
   * Имя значимой иконки. Задан — иконка объявляется `role="img"` и перестаёт
   * быть скрытой. Не задан — иконка декоративна.
   */
  label?: string
  /** Цвет из палитры. `current` — наследовать цвет текста родителя. */
  tone?: GrIconTone
  /** Вращение — для спиннеров. */
  spin?: boolean
}

const props = withDefaults(
  defineProps<GrIconProps>(),
  {
    size: undefined,
    label: undefined,
    tone: 'current',
    spin: false,
  },
)

// Число — «локальный» escape-hatch мимо конфига; шкала идёт через провайдер.
const resolvedScaleSize = useGrComponentSize(
  () => (typeof props.size === 'number' ? undefined : props.size),
  { component: 'GrIcon' },
)

const iconStyle = computed(() => ({
  '--gr-icon-size': typeof props.size === 'number'
    ? `${props.size}px`
    : iconSizeVarBySize[resolvedScaleSize.value],
} as Record<string, string>))

const iconClass = computed(() => [
  iconBaseClass,
  grIconToneClass(props.tone),
  props.spin ? iconSpinClass : '',
].filter(Boolean))

/**
 * Иконка декоративна по умолчанию.
 *
 * В библиотеке она почти всегда сопровождает текст, и каждое место вызова
 * ставило `aria-hidden` вручную. Достаточно забыть один раз — и диктор
 * прочитает `<title>` из SVG вместо ничего. Значимой иконку делает `label`:
 * тогда у неё появляются роль и имя, а скрытие снимается.
 *
 * Переопределить это потребитель по-прежнему может: fallthrough-атрибут
 * сильнее собственной привязки.
 */
const ariaHidden = computed(() => (props.label ? undefined : 'true'))

defineSlots<{
  /** Своя разметка иконки вместо имени из набора. */
  default?: () => any
}>()

</script>

<template>
  <span
    data-gr-icon
    :class="iconClass"
    :style="iconStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="ariaHidden"
  >
    <slot />
  </span>
</template>

<style>
/*
 * Стиль намеренно глобальный, а не scoped: иконка приходит слотом (SVG
 * потребителя), и scoped-правило до него не достаёт — пришлось бы писать
 * `:deep` в каждом месте вызова.
 *
 * Размер живёт в одной переменной: и обёртка, и вложенный SVG считают себя от
 * неё, поэтому шкала настраивается темой, а не пропами разметки.
 */
:where(.gr-icon) {
  --gr-icon-size: var(--gr-icon-size-md, 18px);
  width: var(--gr-icon-size);
  min-width: var(--gr-icon-size);
  height: var(--gr-icon-size);
  line-height: 0;
  flex: none;
}

:where(.gr-icon svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
