<script setup lang="ts">
import { computed } from 'vue'

import { GrButtonGroup, GrButton, useGrFormControl } from '@feugene/granularity'

/**
 * Свой контрол на три кнопки.
 *
 * Показывает минимум, которого требует контракт форм-контрола: принимает
 * `modelValue`, отдаёт `update:modelValue` и **читает контекст поля** через
 * `useGrFormControl`. Последнее не формальность: `GrFormField` связывает подпись
 * с контролом единственным способом — `<label for>` на его `id`, и контрол,
 * который этот `id` на себя не повесил, оставляет подпись висеть в пустоте.
 * Заодно оттуда приходят `aria-describedby` с текстом ошибки, `aria-invalid`,
 * `aria-required` и поле-уровневые `disabled`/`readonly`.
 *
 * Группа кнопок не лейблируема, поэтому имя ей даёт не `for`, а
 * `aria-labelledby` на подпись поля — правило пакета для виджетов с ролью.
 *
 * Какие `aria-*` контрол вправе нести, решает его роль, а не желание всё
 * прокинуть: `role="group"` берёт глобальные `aria-labelledby` и
 * `aria-describedby`, но не `aria-invalid` и не `aria-required` — те живут у
 * ролей вроде `radiogroup` (см. `GrSegmented`). Повесить их сюда значит
 * получить `aria-allowed-attr` уровня critical; ошибка доезжает текстом через
 * `aria-describedby`, и этого роль позволяет.
 */
const props = defineProps<{
  modelValue?: unknown
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const {
  id: fieldId,
  labelId,
  describedBy,
  invalid: isInvalid,
  disabled: isDisabled,
  readonly: isReadonly,
} = useGrFormControl(() => props)

/** Своё имя сильнее подписи поля — иначе контрол назвался бы дважды. */
const labelledBy = computed(() => (props.ariaLabel ? undefined : labelId.value))

const LEVELS = [
  { value: 'low', label: 'Низкая' },
  { value: 'normal', label: 'Обычная' },
  { value: 'high', label: 'Срочная' },
]

const current = computed(() => String(props.modelValue ?? ''))

function pick(value: string): void {
  if (isDisabled.value || isReadonly.value)
    return

  emit('update:modelValue', value)
}
</script>

<template>
  <GrButtonGroup
    :id="fieldId"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :class="isInvalid ? 'rounded-[var(--gr-radius-md)] ring-1 ring-[var(--gr-danger)]' : undefined"
  >
    <GrButton
      v-for="level in LEVELS"
      :key="level.value"
      size="sm"
      :variant="current === level.value ? 'primary' : 'outline'"
      :disabled="isDisabled || isReadonly"
      :aria-pressed="current === level.value"
      @click="pick(level.value)"
    >
      {{ level.label }}
    </GrButton>
  </GrButtonGroup>
</template>
