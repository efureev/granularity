<script setup lang="ts">
import { computed, provide } from 'vue'

import DsCard from '../DsCard'

import {
  DS_COLLAPSE_CONTEXT,
  type DsCollapseContext,
  type DsCollapseModelValue,
  type DsCollapseValue,
} from './dsCollapseContext'

/**
 * DsCollapse — контейнер секций `DsCollapseItem`.
 *
 * @prop modelValue — открытые секции. В `accordion`-режиме — `string|number|undefined`, иначе — массив значений.
 * @prop accordion — режим, когда одновременно может быть открыта только одна секция.
 * @prop disabled — блокирует взаимодействие со всеми секциями.
 * @prop divided — разделители между секциями.
 */
export interface DsCollapseProps {
  modelValue?: DsCollapseModelValue
  accordion?: boolean
  disabled?: boolean
  divided?: boolean
}

const props = withDefaults(defineProps<DsCollapseProps>(), {
  modelValue: undefined,
  accordion: false,
  disabled: false,
  divided: true,
})

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
    <div :class="divided ? 'divide-y divide-[var(--brd)]' : ''">
      <slot />
    </div>
  </DsCard>
</template>