<script setup lang="ts">
import { computed, provide } from 'vue'

import GrCard from '../GrCard'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'

import {
  GR_COLLAPSE_CONTEXT,
  type GrCollapseBeforeChange,
  type GrCollapseContext,
  type GrCollapseHeadingLevel,
  type GrCollapseIconPosition,
  type GrCollapseModelValue,
  type GrCollapseValue,
} from './grCollapseContext'

import type { GrComponentSize } from '../shared/sizes'

import './defaults'

/**
 * GrCollapse — контейнер секций `GrCollapseItem`.
 *
 * @prop modelValue — открытые секции. В `accordion`-режиме — `string|number|undefined`, иначе — массив значений.
 * @prop accordion — режим, когда одновременно может быть открыта только одна секция.
 * @prop disabled — блокирует взаимодействие со всеми секциями.
 * @prop divided — разделители между секциями.
 * @prop borderless — без обёртки в `GrCard`: аккордеон внутри карточки или сайдбара
 *   иначе получает вторую рамку и вторую тень.
 * @prop beforeChange — async-guard: `false` отменяет переключение.
 */
export interface GrCollapseProps {
  modelValue?: GrCollapseModelValue
  accordion?: boolean
  disabled?: boolean
  divided?: boolean
  borderless?: boolean
  /** Уровень заголовков секций (`h2`…`h6`) — под структуру страницы. */
  headingLevel?: GrCollapseHeadingLevel
  /** Сторона шеврона относительно заголовка. */
  expandIconPosition?: GrCollapseIconPosition
  beforeChange?: GrCollapseBeforeChange
  /** Размер секций. Не задан — берётся из `GrConfigProvider`, иначе `md`. */
  size?: GrComponentSize
}

export interface GrCollapseEmits {
  (e: 'update:modelValue', value: GrCollapseModelValue): void
  (e: 'change', value: GrCollapseModelValue): void
}

// Дефолты оформления намеренно `undefined`: «настоящий» дефолт живёт в
// `useGrComponentProp`, иначе `GrConfigProvider` не отличит заданный пользователем
// проп от подставленного Vue.
const props = withDefaults(defineProps<GrCollapseProps>(), {
  modelValue: undefined,
  accordion: false,
  disabled: false,
  divided: undefined,
  borderless: undefined,
  headingLevel: undefined,
  expandIconPosition: undefined,
  beforeChange: undefined,
  size: undefined,
})

const emit = defineEmits<GrCollapseEmits>()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCollapse' })
const divided = useGrComponentProp('GrCollapse', 'divided', () => props.divided, true)
const borderless = useGrComponentProp('GrCollapse', 'borderless', () => props.borderless, false)
const headingLevel = useGrComponentProp('GrCollapse', 'headingLevel', () => props.headingLevel, 3)
const expandIconPosition = useGrComponentProp('GrCollapse', 'expandIconPosition', () => props.expandIconPosition, 'end')

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

function applyToggle(name: GrCollapseValue): void {
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

// Секции, у которых guard ещё не ответил. Без этого повторный клик по заголовку
// уходил бы во второй `beforeChange`, и после двух «да» состояние переключилось
// бы дважды — то есть вернулось бы к исходному.
const awaitingGuard = new Set<GrCollapseValue>()

async function toggle(name: GrCollapseValue): Promise<void> {
  if (props.disabled || awaitingGuard.has(name))
    return

  if (!props.beforeChange) {
    applyToggle(name)
    return
  }

  awaitingGuard.add(name)
  try {
    if (await props.beforeChange(name, !activeSet.value.has(name)) === false)
      return

    applyToggle(name)
  }
  finally {
    awaitingGuard.delete(name)
  }
}

const context: GrCollapseContext = {
  accordion: computed(() => props.accordion),
  disabled: computed(() => props.disabled),
  size: resolvedSize,
  headingLevel,
  expandIconPosition,
  isActive: name => activeSet.value.has(name),
  toggle: (name) => { void toggle(name) },
}

provide(GR_COLLAPSE_CONTEXT, context)
</script>

<template>
  <GrCard v-if="!borderless" data-gr-collapse>
    <div :class="divided ? 'divide-y divide-[var(--gr-brd)]' : ''">
      <slot />
    </div>
  </GrCard>
  <div
    v-else
    data-gr-collapse
    :class="divided ? 'divide-y divide-[var(--gr-brd)]' : ''"
  >
    <slot />
  </div>
</template>
