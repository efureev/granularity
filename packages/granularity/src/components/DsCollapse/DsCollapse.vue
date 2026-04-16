<script setup lang="ts">
import { computed, provide } from 'vue'

import DsCard from '../DsCard'

import {
  DS_COLLAPSE_CONTEXT,
  type DsCollapseContext,
  type DsCollapseModelValue,
  type DsCollapseValue,
} from './dsCollapseContext'

const props = withDefaults(
  defineProps<{
    modelValue?: DsCollapseModelValue
    accordion?: boolean
    disabled?: boolean
    divided?: boolean
  }>(),
  {
    modelValue: undefined,
    accordion: false,
    disabled: false,
    divided: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DsCollapseModelValue): void
  (e: 'change', value: DsCollapseModelValue): void
}>()

const activeSet = computed(() => {
  const value = props.modelValue

  if (props.accordion) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Set<DsCollapseValue>([value])
    }

    return new Set<DsCollapseValue>()
  }

  if (Array.isArray(value)) {
    return new Set<DsCollapseValue>(value)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Set<DsCollapseValue>([value])
  }

  return new Set<DsCollapseValue>()
})

function setModelValue(next: DsCollapseModelValue): void {
  emit('update:modelValue', next)
  emit('change', next)
}

function toggle(name: DsCollapseValue): void {
  if (props.disabled)
    return

  if (props.accordion) {
    const next = activeSet.value.has(name) ? undefined : name
    setModelValue(next)
    return
  }

  const current = Array.isArray(props.modelValue)
    ? [...props.modelValue]
    : typeof props.modelValue === 'string' || typeof props.modelValue === 'number'
      ? [props.modelValue]
      : []

  const exists = current.includes(name)
  const next = exists
    ? current.filter(x => x !== name)
    : [...current, name]

  setModelValue(next)
}

const context: DsCollapseContext = {
  accordion: computed(() => props.accordion),
  disabled: computed(() => props.disabled),
  isActive: name => activeSet.value.has(name),
  toggle,
}

provide(DS_COLLAPSE_CONTEXT, context)
</script>

<template>
  <DsCard data-ds-collapse>
    <div :class="props.divided ? 'divide-y divide-[var(--brd)]' : ''">
      <slot />
    </div>
  </DsCard>
</template>