<script setup lang="ts">
import { computed } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGrComponentProp, useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'
import { usePortalTarget } from '@feugene/granularity/composables/usePortalTarget'

import { useDashboardTransfer } from '../../composables/useDashboardTransfer'
import TransferGhost from '../GrDashboardFrame/shared/TransferGhost.vue'

import type { GrDashboardPaletteItem, GrDashboardPaletteSize } from './grDashboardPaletteStyles'
import {
  actionClass,
  descriptionClass,
  emptyClass,
  headingClass,
  listClass,
  measureClass,
  paletteSizes,
  rowClass,
  rowDisabledClass,
  rowDraggableClass,
  rowTransferringClass,
  textClass,
  titleClass,
} from './grDashboardPaletteStyles'

defineOptions({ name: 'GrDashboardPalette', inheritAttrs: false })

export interface GrDashboardPaletteProps {
  /** Каталог доступных виджетов. */
  items: GrDashboardPaletteItem[]
  size?: GrDashboardPaletteSize
  /**
   * Плитку можно перетащить на сетку.
   *
   * Кнопка «Добавить» остаётся при любом значении: она и есть контракт и
   * единственный клавиатурный путь. Сетка, слушающая `itemDrop`, положит
   * брошенное — не слушающая покажет подложку и ничего не сделает.
   */
  draggable?: boolean
  disabled?: boolean
  ariaLabel?: string
}

export interface GrDashboardPaletteEmits {
  (e: 'add', item: GrDashboardPaletteItem): void
}

const props = withDefaults(defineProps<GrDashboardPaletteProps>(), {
  // `undefined`, а не готовые значения: иначе `componentDefaults` до них не дошли бы.
  size: undefined,
  draggable: undefined,
  disabled: false,
})

const emit = defineEmits<GrDashboardPaletteEmits>()

defineSlots<{
  /**
   * Своя плитка. `transferProps` навешивается на её корень (`v-bind`) — без
   * этого перетащить свою разметку нечем, а слот существует ровно ради неё.
   */
  item?: (props: {
    item: GrDashboardPaletteItem
    dragging: boolean
    transferProps: { onPointerdown: (event: PointerEvent) => void }
  }) => unknown
  /** Что рисуется под курсором во время переноса. */
  ghost?: (props: { item: GrDashboardPaletteItem }) => unknown
  empty?: () => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()
const size = useGrComponentSize(() => props.size, { component: 'GrDashboardPalette' })
const draggable = useGrComponentProp('GrDashboardPalette', 'draggable', () => props.draggable, true)

const transfer = useDashboardTransfer()
const portal = usePortalTarget()

const carried = computed(() => (
  transfer.transfer.value?.source === 'palette'
    ? props.items.find(item => item.id === transfer.transfer.value?.id)
    : undefined
))

function canDrag(item: GrDashboardPaletteItem): boolean {
  return draggable.value && !props.disabled && !item.disabled
}

/**
 * Нажатие на кнопку переносом не становится.
 *
 * `preventDefault` на движении клику не мешает, но дёрнувший мышью на пять
 * пикселей во время клика получил бы перенос вместо добавления — а добавление
 * тут контракт.
 */
function startTransfer(item: GrDashboardPaletteItem, event: PointerEvent): void {
  if (!canDrag(item))
    return
  if ((event.target as HTMLElement | null)?.closest('button'))
    return

  transfer.start({
    id: item.id,
    title: item.title,
    size: item.defaultSize ?? { w: 6, h: 2 },
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
    source: 'palette',
    payload: item,
  }, event)
}

function transferPropsFor(item: GrDashboardPaletteItem): { onPointerdown: (event: PointerEvent) => void } {
  return { onPointerdown: (event: PointerEvent) => startTransfer(item, event) }
}

const label = computed(() => props.ariaLabel ?? t('grDashboard.palette.label', 'Widget catalog'))

/**
 * Добавление — обычная кнопка, а не перетаскивание.
 *
 * Перетаскивание из каталога в сетку было бы усилением поверх этого пути;
 * контрактом оно быть не может — иначе каталогом нельзя пользоваться с
 * клавиатуры, а это ровно тот случай, когда «доступность потом» не наступает.
 */
function add(item: GrDashboardPaletteItem): void {
  if (props.disabled || item.disabled)
    return

  emit('add', item)
  announce(t('grDashboard.item.added', '{title} added', { title: item.title }))
}

/** Размер в ячейках — `6×2`. Знак умножения, а не буква `x`. */
function measure(item: GrDashboardPaletteItem): string | undefined {
  return item.defaultSize ? `${item.defaultSize.w}×${item.defaultSize.h}` : undefined
}
</script>

<template>
  <div v-bind="$attrs" data-gr-dashboard-palette :class="paletteSizes[size]">
    <ul v-if="items.length > 0" :class="listClass" :aria-label="label">
      <li v-for="item in items" :key="item.id" data-gr-dashboard-palette-item>
        <slot
          name="item"
          :item="item"
          :dragging="carried?.id === item.id"
          :transfer-props="transferPropsFor(item)"
        >
          <span
            :class="[
              rowClass,
              item.disabled ? rowDisabledClass : '',
              canDrag(item) ? rowDraggableClass : '',
              carried?.id === item.id ? rowTransferringClass : '',
            ]"
            :data-transferring="carried?.id === item.id ? '' : undefined"
            @pointerdown="startTransfer(item, $event)"
          >
            <span :class="textClass">
              <span :class="headingClass">
                <span :class="titleClass">{{ item.title }}</span>
                <span v-if="measure(item)" :class="measureClass">{{ measure(item) }}</span>
              </span>
              <span v-if="item.description" :class="descriptionClass">{{ item.description }}</span>
            </span>

            <GrButton
              :size="size"
              variant="outline"
              :class="actionClass"
              :disabled="disabled || item.disabled"
              :aria-label="t('grDashboard.palette.add', 'Add {title}', { title: item.title })"
              @click="add(item)"
            >
              {{ item.disabled
                ? t('grDashboard.palette.added', 'Added')
                : t('grDashboard.palette.addShort', 'Add') }}
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

    <teleport :to="portal.target.value" :disabled="!portal.enabled.value">
      <TransferGhost
        v-if="carried && transfer.transfer.value"
        :transfer="transfer.transfer.value"
        :point="transfer.point.value"
      >
        <slot name="ghost" :item="carried" />
      </TransferGhost>
    </teleport>
  </div>
</template>
