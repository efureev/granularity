<script setup lang="ts">
import ChevronDownIcon from '~icons/lucide/chevron-down'
import { computed, inject, ref, useId } from 'vue'

import GrIcon from '../GrIcon'

import { GR_COLLAPSE_CONTEXT, type GrCollapseValue } from './grCollapseContext'
import {
  collapseChevronSizes,
  grCollapseBodyClass,
  grCollapseChevronClass,
  grCollapseHeaderClass,
  grCollapseTitleClass,
} from './grCollapseStyles'

/**
 * GrCollapseItem — одна секция `GrCollapse`. Должна использоваться строго внутри `GrCollapse`.
 *
 * @prop name — уникальный идентификатор секции (для `v-model` у `GrCollapse`); по умолчанию генерируется из `uid`.
 * @prop title — текст заголовка; можно заменить слотом `#title`.
 * @prop disabled — запрещает раскрытие/сворачивание секции.
 *
 * Слот `#extra` (счётчик, бейдж, кнопка) рендерится **рядом с** триггером, а не
 * внутри него: `<button>` внутри `<button>` — невалидная разметка, а axe ловит
 * это как `nested-interactive`.
 */
export interface GrCollapseItemProps {
  name?: GrCollapseValue
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<GrCollapseItemProps>(), {
  name: undefined,
  title: undefined,
  disabled: false,
})

const collapse = inject(GR_COLLAPSE_CONTEXT)

if (!collapse) {
  throw new Error('GrCollapseItem must be used inside GrCollapse')
}

const collapseContext = collapse

const uid = useId()

const resolvedName = computed<GrCollapseValue>(() => {
  if (typeof props.name === 'string' || typeof props.name === 'number')
    return props.name

  return uid
})

const resolvedDisabled = computed(() => collapseContext.disabled.value || props.disabled)
const expanded = computed(() => collapseContext.isActive(resolvedName.value))

const headingTag = computed(() => `h${collapseContext.headingLevel.value}`)
const iconAtStart = computed(() => collapseContext.expandIconPosition.value === 'start')

const headerClassName = computed(() => grCollapseHeaderClass({
  size: collapseContext.size.value,
  disabled: resolvedDisabled.value,
}))
const titleClassName = computed(() => grCollapseTitleClass(collapseContext.size.value))
const bodyClassName = computed(() => grCollapseBodyClass(collapseContext.size.value))
const chevronClassName = computed(() => grCollapseChevronClass(expanded.value))
const chevronSize = computed(() => collapseChevronSizes[collapseContext.size.value])

// Свёрнутая панель схлопывается визуально (`grid-rows-[0fr]`), но это не
// скрытие: без `inert` ссылки и кнопки внутри неё ловятся Tab'ом, фокус уезжает
// в невидимую область нулевой высоты, а скринридер читает содержимое всех
// закрытых секций подряд — прямо вопреки `aria-expanded="false"` на триггере.
// `inert` убирает поддерево и из таб-порядка, и из дерева доступности, при этом
// (в отличие от `hidden`/`display:none`) не ломает анимацию раскрытия.
const headerId = `gr-collapse-header-${uid}`
const panelId = `gr-collapse-panel-${uid}`

const triggerEl = ref<HTMLElement | null>(null)

function onToggle(): void {
  if (resolvedDisabled.value)
    return

  collapseContext.toggle(resolvedName.value)
}

/**
 * Только заголовки **своего** аккордеона: вложенный `GrCollapse` внутри
 * раскрытой панели тоже помечен `[data-gr-collapse]`, и без фильтра стрелки
 * внешнего аккордеона перескакивали бы на заголовки внутреннего.
 */
function getAllTriggers(): HTMLElement[] {
  const root = triggerEl.value?.closest('[data-gr-collapse]')
  if (!root)
    return []

  const triggers = Array.prototype.slice.call(
    root.querySelectorAll<HTMLElement>('[data-gr-collapse-trigger]'),
  ) as HTMLElement[]

  return triggers.filter(trigger => trigger.closest('[data-gr-collapse]') === root)
}

function focusRelative(direction: 1 | -1): void {
  const current = triggerEl.value
  if (!current)
    return

  const triggers = getAllTriggers()
  const index = triggers.indexOf(current)
  if (index === -1 || triggers.length === 0)
    return

  const nextIndex = (index + direction + triggers.length) % triggers.length
  triggers[nextIndex]?.focus()
}

function focusEdge(edge: 'start' | 'end'): void {
  const triggers = getAllTriggers()
  if (triggers.length === 0)
    return

  ;(edge === 'start' ? triggers[0] : triggers.at(-1))?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusRelative(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusRelative(-1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusEdge('start')
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusEdge('end')
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    onToggle()
  }
}
</script>

<template>
  <div
    data-gr-collapse-item
    class="text-[var(--gr-fg)]"
  >
    <div class="flex items-center">
      <component
        :is="headingTag"
        class="m-0 min-w-0 flex-1"
      >
        <button
          :id="headerId"
          ref="triggerEl"
          data-gr-collapse-trigger
          type="button"
          :aria-expanded="expanded ? 'true' : 'false'"
          :aria-controls="panelId"
          :disabled="resolvedDisabled"
          :class="headerClassName"
          @click="onToggle"
          @keydown="onKeydown"
        >
          <GrIcon
            v-if="iconAtStart"
            :size="chevronSize"
           
            data-gr-collapse-chevron
            :class="chevronClassName"
          >
            <slot name="icon">
              <ChevronDownIcon />
            </slot>
          </GrIcon>

          <span :class="titleClassName">
            <slot name="title">
              <span class="font-600">
                {{ title }}
              </span>
            </slot>
          </span>

          <GrIcon
            v-if="!iconAtStart"
            :size="chevronSize"
           
            data-gr-collapse-chevron
            :class="chevronClassName"
          >
            <slot name="icon">
              <ChevronDownIcon />
            </slot>
          </GrIcon>
        </button>
      </component>

      <div
        v-if="$slots.extra"
        data-gr-collapse-extra
        class="shrink-0 pr-4"
      >
        <slot name="extra" />
      </div>
    </div>

    <div
      :id="panelId"
      role="region"
      :aria-labelledby="headerId"
      :inert="expanded ? undefined : true"
      class="grid transition-[grid-template-rows] duration-[var(--gr-duration-base)]"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <div :class="bodyClassName">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
