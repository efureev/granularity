<script setup lang="ts">
import { computed, provide } from 'vue'

import GrCard from '../GrCard'

import {
  GR_COLLAPSE_CONTEXT,
  type GrCollapseContext,
  type GrCollapseModelValue,
  type GrCollapseValue,
} from './grCollapseContext'

/**
 * GrCollapse — контейнер секций `GrCollapseItem`.
 *
 * @prop modelValue — открытые секции. В `accordion`-режиме — `string|number|undefined`, иначе — массив значений.
 * @prop accordion — режим, когда одновременно может быть открыта только одна секция.
 * @prop disabled — блокирует взаимодействие со всеми секциями.
 * @prop divided — разделители между секциями.
 */
export interface GrCollapseProps {
  modelValue?: GrCollapseModelValue
  accordion?: boolean
  disabled?: boolean
  divided?: boolean
}

const props = withDefaults(defineProps<GrCollapseProps>(), {
  modelValue: undefined,
  accordion: false,
  disabled: false,
  divided: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrCollapseModelValue): void
  (e: 'change', value: GrCollapseModelValue): void
}>()

const activeSet = computed(() => {
  const value = props.modelValue

  if (props.accordion) {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Set<GrCollapseValue>([value])
    }

    return new Set<GrCollapseValue>()
  }

  if (Array.isArray(value)) {
    return new Set<GrCollapseValue>(value)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Set<GrCollapseValue>([value])
  }

  return new Set<GrCollapseValue>()
})

function setModelValue(next: GrCollapseModelValue): void {
  emit('update:modelValue', next)
  emit('change', next)
}

function toggle(name: GrCollapseValue): void {
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

const context: GrCollapseContext = {
  accordion: computed(() => props.accordion),
  disabled: computed(() => props.disabled),
  isActive: name => activeSet.value.has(name),
  toggle,
}

provide(GR_COLLAPSE_CONTEXT, context)
</script>

<template>
  <GrCard data-ds-collapse>
    <div :class="divided ? 'divide-y divide-[var(--brd)]' : ''">
      <slot />
    </div>
  </GrCard>
</template>