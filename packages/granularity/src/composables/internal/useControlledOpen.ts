import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

/**
 * Контролируемое состояние открытия оверлея — единый контракт `v-model:open`
 * панельных компонентов (Popover, Select, TreeSelect, Autocomplete, Dropdown).
 *
 * Uncontrolled-состояние; в controlled-режиме перекрывается пропом `open`.
 * Без пропа `v-model` был бы обязателен, а поповер без модели — самый частый
 * случай использования. Гарды компонента (disabled/readonly) остаются на его
 * стороне — примитив ведёт только состояние и эмит.
 */
export function useControlledOpen(
  controlled: () => boolean | undefined,
  onChange: (value: boolean) => void,
): { open: ComputedRef<boolean>, setOpen: (next: boolean) => void } {
  const internalOpen = ref(false)
  const isControlled = computed(() => controlled() !== undefined)
  const open = computed(() => controlled() ?? internalOpen.value)

  function setOpen(next: boolean): void {
    // Сравнение — ДО мутации: в uncontrolled-режиме запись в `internalOpen`
    // немедленно меняет `open`, и проверка после неё всегда была бы ложной,
    // то есть `onChange` не вызывался бы никогда.
    if (next === open.value) return

    if (!isControlled.value) internalOpen.value = next

    onChange(next)
  }

  return { open, setOpen }
}
