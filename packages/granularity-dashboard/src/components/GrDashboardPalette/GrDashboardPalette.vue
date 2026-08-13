<script setup lang="ts">
import { computed } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { GrDashboardPaletteItem, GrDashboardPaletteSize } from './grDashboardPaletteStyles'
import {
  descriptionClass,
  emptyClass,
  listClass,
  paletteSizes,
  rowClass,
  textClass,
  titleClass,
} from './grDashboardPaletteStyles'

defineOptions({ name: 'GrDashboardPalette', inheritAttrs: false })

export interface GrDashboardPaletteProps {
  /** Каталог доступных виджетов. */
  items: GrDashboardPaletteItem[]
  size?: GrDashboardPaletteSize
  disabled?: boolean
  ariaLabel?: string
}

export interface GrDashboardPaletteEmits {
  (e: 'add', item: GrDashboardPaletteItem): void
}

const props = withDefaults(defineProps<GrDashboardPaletteProps>(), {
  // `undefined`, а не готовое значение: иначе `componentDefaults` до него не дошли бы.
  size: undefined,
  disabled: false,
})

const emit = defineEmits<GrDashboardPaletteEmits>()

defineSlots<{
  item?: (props: { item: GrDashboardPaletteItem }) => unknown
  empty?: () => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()
const size = useGrComponentSize(() => props.size, { component: 'GrDashboardPalette' })

const label = computed(() => props.ariaLabel ?? t('grDashboard.palette.label', 'Widget catalog'))

/**
 * Добавление — обычная кнопка, а не перетаскивание.
 *
 * Перетаскивание из каталога в сетку было бы усилением поверх этого пути;
 * контрактом оно быть не может — иначе каталогом нельзя пользоваться с
 * клавиатуры, а это ровно тот случай, когда «доступность потом» не наступает.
 */
function add(item: GrDashboardPaletteItem): void {
  if (props.disabled || item.disabled) return

  emit('add', item)
  announce(t('grDashboard.item.added', '{title} added', { title: item.title }))
}
</script>

<template>
  <div v-bind="$attrs" data-gr-dashboard-palette :class="paletteSizes[size]">
    <ul v-if="items.length > 0" :class="listClass" :aria-label="label">
      <li v-for="item in items" :key="item.id" data-gr-dashboard-palette-item>
        <slot name="item" :item="item">
          <span :class="rowClass">
            <span :class="textClass">
              <span :class="titleClass">{{ item.title }}</span>
              <span v-if="item.description" :class="descriptionClass">{{ item.description }}</span>
            </span>
            <GrButton
              :size="size"
              variant="outline"
              :disabled="disabled || item.disabled"
              :aria-label="t('grDashboard.palette.add', 'Add {title}', { title: item.title })"
              @click="add(item)"
            >
              +
            </GrButton>
          </span>
        </slot>
      </li>
    </ul>

    <slot v-else name="empty">
      <p :class="emptyClass">
        {{ t('grDashboard.palette.empty', 'No widgets available') }}
      </p>
    </slot>
  </div>
</template>
