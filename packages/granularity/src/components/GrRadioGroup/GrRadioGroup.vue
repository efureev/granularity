<script setup lang="ts">
import { computed, provide } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'

import type { GrButtonSize } from '../GrButton'
import GrButtonGroup from '../GrButtonGroup/GrButtonGroup.vue'
import GrRadio from '../GrRadio/GrRadio.vue'
import { GR_RADIO_GROUP_CONTEXT } from '../GrRadio'

export type GrRadioGroupVariant = 'radiobox' | 'button'
export interface GrRadioGroupOption { value: string, label: string }

/**
 * GrRadioGroup — контейнер группы `GrRadio`.
 *
 * Может работать как через слот (ручной рендер `GrRadio`), так и через проп `options`.
 * Предоставляет дочерним `GrRadio` общий `modelValue`/`disabled`/`size`/`name` через `inject`.
 */
export interface GrRadioGroupProps {
  modelValue: string
  options?: GrRadioGroupOption[]
  name?: string
  disabled?: boolean
  variant?: GrRadioGroupVariant
  size?: GrButtonSize
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrRadioGroupProps>(), {
  options: undefined,
  name: undefined,
  disabled: false,
  variant: 'radiobox',
  size: undefined,
  ariaLabel: undefined,
})

// Эффективный размер группы: локальный проп → `GrConfigProvider` → `md`.
// Дочерние `GrRadio` получают уже разрешённое значение через контекст, поэтому
// провайдер работает и для них — без второго чтения конфига.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrRadioGroup' })

// Контекст `GrFormField`. Группа — не labelable-элемент, поэтому имя приходит
// через `aria-labelledby` на подпись поля, а не через `<label for>`.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const isInvalid = computed(() => Boolean(field?.invalid.value))
const isRequired = computed(() => Boolean(field?.required.value))
const labelledBy = computed(() => (props.ariaLabel ? undefined : field?.labelId.value))

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function setValue(next: string): void {
  if (props.disabled)
    return
  emit('update:modelValue', next)
}

provide(GR_RADIO_GROUP_CONTEXT, {
  modelValue: computed(() => props.modelValue),
  name: computed(() => props.name),
  disabled: computed(() => props.disabled),
  size: resolvedSize,
  setValue,
})
</script>

<template>
  <div
    :id="fieldId"
    data-gr-radio-group
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-required="isRequired ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <template v-if="$slots.default">
      <GrButtonGroup v-if="variant === 'button'">
        <slot />
      </GrButtonGroup>
      <div v-else class="grid gap-2">
        <slot />
      </div>
    </template>
    <template v-else>
      <GrButtonGroup v-if="variant === 'button'">
        <GrRadio
          v-for="opt in options ?? []"
          :key="opt.value"
          :value="opt.value"
          variant="button"
          :size="resolvedSize"
        >
          {{ opt.label }}
        </GrRadio>
      </GrButtonGroup>
      <div v-else class="grid gap-2">
        <GrRadio v-for="opt in options ?? []" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </GrRadio>
      </div>
    </template>
  </div>
</template>
