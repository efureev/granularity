<script setup lang="ts">
/**
 * GrSidebarGroup — секция пунктов `GrSidebar` с заголовком.
 *
 * В свёрнутой панели заголовку негде поместиться: он скрывается, а секции
 * разделяет линия — без неё иконки соседних секций сливаются в один столбец.
 */
import { computed, inject, useId } from 'vue'

import { groupCollapsedClass, groupLabelClass } from './grSidebarStyles'
import { GR_SIDEBAR_KEY } from './sidebarContext'

export interface GrSidebarGroupProps {
  /** Заголовок секции. Слот `#label` сильнее. */
  label?: string
}

const props = withDefaults(defineProps<GrSidebarGroupProps>(), {
  label: undefined,
})

const slots = defineSlots<{
  /** Пункты секции. */
  default?: () => unknown
  /** Заголовок целиком — вместо строки `label`. */
  label?: () => unknown
}>()

const sidebar = inject(GR_SIDEBAR_KEY, null)
const collapsed = computed(() => sidebar?.collapsed.value ?? false)

const labelId = useId()
const hasLabel = computed(() => Boolean(props.label || slots.label))

// Имя группе даёт только видимый заголовок: в свёрнутом виде его нет, и
// `aria-labelledby` указывал бы в пустоту.
const showLabel = computed(() => hasLabel.value && !collapsed.value)
</script>

<template>
  <div
    data-gr-sidebar-group
    role="group"
    :aria-labelledby="showLabel ? labelId : undefined"
    :class="collapsed ? groupCollapsedClass : undefined"
  >
    <div
      v-if="showLabel"
      :id="labelId"
      data-gr-sidebar-group-label
      :class="groupLabelClass"
    >
      <slot name="label">
        {{ label }}
      </slot>
    </div>

    <slot />
  </div>
</template>
