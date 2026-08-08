<script setup lang="ts">
import { ref } from 'vue'

import {
  GrInput,
  GrSelect,
  type GrInputEmits,
  type GrInputProps,
  type GrSelectInstance,
} from '@feugene/granularity'

/**
 * Страница-улика для публичных типов.
 *
 * Проверяет её не рантайм, а `vue-tsc`: типы пропсов, эмитов и инстанса обязаны
 * собираться у потребителя ровно так, как обещано в `docs/components.md`.
 * Сломается экспорт — покраснеет `typecheck` этого приложения, а не только
 * гейт состава внутри пакета.
 */

// Обёртка над контролом: свои пропы поверх пакетных.
interface FieldProps extends GrInputProps {
  hint?: string
}

const props = withDefaults(defineProps<FieldProps>(), {
  hint: undefined,
  modelValue: '',
})

// Эмиты пакета переизлучаются один в один — ради этого тип и экспортируется.
const emit = defineEmits<GrInputEmits>()

// Тип инстанса у дженерика: `InstanceType<typeof GrSelect>` здесь не работает.
const selectRef = ref<GrSelectInstance | null>(null)

function focusSelect(): void {
  selectRef.value?.focus()
}

const value = ref('')
const options = [{ label: 'Vue', value: 'vue' }]
</script>

<template>
  <main>
    <p>{{ props.hint }}</p>

    <GrInput
      :model-value="props.modelValue"
      aria-label="Обёрнутое поле"
      @update:model-value="emit('update:modelValue', $event)"
      @focus="emit('focus', $event)"
    />

    <GrSelect ref="selectRef" v-model="value" :options="options" aria-label="Выбор" />

    <button type="button" @click="focusSelect">
      Сфокусировать селект
    </button>
  </main>
</template>
