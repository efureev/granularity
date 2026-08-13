<script setup lang="ts">
import { computed } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import { useGrDashboardContext } from '../GrDashboard/context'
import type { GrDashboardMode } from '../GrDashboard/grDashboardStyles'
import type { GrDashboardToolbarSize } from './grDashboardToolbarStyles'
import { groupClass, spacerClass, toolbarClass } from './grDashboardToolbarStyles'

defineOptions({ name: 'GrDashboardToolbar', inheritAttrs: false })

export interface GrDashboardToolbarProps {
  /** Текущий режим. `v-model:mode`. Не задан — берётся у дашборда, если тулбар внутри него. */
  mode?: GrDashboardMode
  size?: GrDashboardToolbarSize
  /** Показывать кнопку сброса раскладки. */
  resettable?: boolean
  disabled?: boolean
  ariaLabel?: string
}

export interface GrDashboardToolbarEmits {
  (e: 'update:mode', value: GrDashboardMode): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<GrDashboardToolbarProps>(), {
  mode: undefined,
  // `undefined`, а не готовое значение: иначе `componentDefaults` до него не дошли бы.
  size: undefined,
  resettable: false,
  disabled: false,
})

const emit = defineEmits<GrDashboardToolbarEmits>()

defineSlots<{
  start?: () => unknown
  default?: () => unknown
  end?: () => unknown
}>()

const { t } = useGranularityTranslations()
const dashboard = useGrDashboardContext()
const size = useGrComponentSize(() => props.size, { component: 'GrDashboardToolbar' })

/**
 * Режим приходит либо пропом, либо из контекста. Второе — только для показа:
 * менять его тулбар всё равно может лишь эмитом, потому что владелец раскладки
 * и режима — приложение, а не сетка.
 */
const editing = computed(() => (props.mode ?? dashboard?.mode.value ?? 'view') === 'edit')

const label = computed(() => props.ariaLabel ?? t('grDashboard.toolbar.label', 'Dashboard controls'))
const toggleLabel = computed(() => (editing.value
  ? t('grDashboard.toolbar.done', 'Done')
  : t('grDashboard.toolbar.edit', 'Edit layout')))
</script>

<template>
  <div
    v-bind="$attrs"
    data-gr-dashboard-toolbar
    role="toolbar"
    :aria-label="label"
    :class="toolbarClass"
  >
    <span v-if="$slots.start" :class="groupClass">
      <slot name="start" />
    </span>

    <span :class="spacerClass">
      <slot />
    </span>

    <span :class="groupClass">
      <GrButton
        v-if="resettable"
        :size="size"
        variant="ghost"
        :disabled="disabled"
        @click="emit('reset')"
      >
        {{ t('grDashboard.toolbar.reset', 'Reset layout') }}
      </GrButton>

      <GrButton
        :size="size"
        :variant="editing ? 'primary' : 'outline'"
        :aria-pressed="editing ? 'true' : 'false'"
        :disabled="disabled"
        @click="emit('update:mode', editing ? 'view' : 'edit')"
      >
        {{ toggleLabel }}
      </GrButton>

      <slot name="end" />
    </span>
  </div>
</template>
