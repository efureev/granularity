<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import GrDialog from '@feugene/granularity/components/GrDialog'
import GrFormField from '@feugene/granularity/components/GrFormField'
import GrNumberInput from '@feugene/granularity/components/GrNumberInput'
import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { GrDashboardItemLayout, GrDashboardSpan } from '../../layout'
import { maxHeightOf, maxWidthOf, minHeightOf, minWidthOf } from '../../layout'
import { useGrDashboardContext } from '../GrDashboard/context'
import type { GrDashboardItemSettingsSize } from './grDashboardItemSettingsStyles'
import { bodyClass, footerClass, refusalClass, sizeRowClass } from './grDashboardItemSettingsStyles'

defineOptions({ name: 'GrDashboardItemSettings', inheritAttrs: false })

export interface GrDashboardItemSettingsProps {
  /** Окно открыто. `v-model`. */
  modelValue: boolean
  /** Какой виджет настраиваем. `null` — окну нечего читать. */
  itemId: string | null
  /** Заголовок окна. Не задан — строка локали. */
  title?: string
  size?: GrDashboardItemSettingsSize
  /** Убрать встроенный редактор размера: у приложения свои поля и только они. */
  hideSize?: boolean
}

export interface GrDashboardItemSettingsEmits {
  (e: 'update:modelValue', value: boolean): void
  /** Размер уже закоммичен сеткой; приложению остаётся сохранить своё. */
  (e: 'apply', id: string, span: GrDashboardSpan): void
  /** Закрыли без применения: кнопка, `Esc`, клик по подложке. */
  (e: 'cancel', id: string): void
}

const props = withDefaults(defineProps<GrDashboardItemSettingsProps>(), {
  title: undefined,
  // `undefined`, а не готовое значение: иначе `componentDefaults` до него не дошли бы.
  size: undefined,
  hideSize: false,
})

const emit = defineEmits<GrDashboardItemSettingsEmits>()

defineSlots<{
  /**
   * Параметры приложения. Идут **над** размером: продуктовое важнее служебного.
   *
   * `item` не задан, когда окно стоит вне сетки или виджета с таким `itemId` в
   * раскладке нет: свои поля приложение рисует и в этом случае.
   */
  default?: (props: { item: GrDashboardItemLayout | undefined }) => unknown
  /** Замена подвала целиком, когда «Отмена / Применить» не подходят. */
  footer?: (props: { apply: () => void, cancel: () => void }) => unknown
}>()

const { t } = useGranularityTranslations()
const dashboard = useGrDashboardContext()
const size = useGrComponentProp('GrDashboardItemSettings', 'size', () => props.size, 'md')

const item = computed<GrDashboardItemLayout | undefined>(() => (
  props.itemId === null ? undefined : dashboard?.itemFor(props.itemId)
))

const cols = computed(() => dashboard?.cols.value ?? 1)

/**
 * Редактор размера показывается по правилу самой сетки, а не по своему.
 *
 * Спрятать поле мало: тот же запрет обязан отработать и при прямом вызове —
 * защита, которая держится на «поле не отрисовали», снимается первой же правкой
 * шаблона. Здесь это разрешает `canResize`, а коммит всё равно идёт через
 * `resizeItemTo`, который проверяет то же самое ещё раз.
 */
const showSize = computed(() => Boolean(
  !props.hideSize
  && dashboard
  && props.itemId !== null
  && item.value
  && dashboard.mode.value === 'edit'
  && dashboard.canResize(props.itemId),
))

const width = ref<number | null>(null)
const height = ref<number | null>(null)
const refused = ref(false)

const minWidth = computed(() => (item.value ? minWidthOf(item.value) : 1))
const minHeight = computed(() => (item.value ? minHeightOf(item.value) : 1))

/**
 * Верхняя граница ширины — не число колонок и не `maxW`.
 *
 * `resizeItem` дополнительно режет ширину по `cols - x`: виджет растёт вправо,
 * и за правый край он не выйдет. Поле, предлагающее двенадцать при `x = 8`,
 * молча отдало бы четыре.
 */
const maxWidth = computed(() => (
  item.value ? Math.min(maxWidthOf(item.value, cols.value), cols.value - item.value.x) : 1
))

const maxHeight = computed(() => {
  const limit = item.value ? maxHeightOf(item.value) : Number.POSITIVE_INFINITY

  return Number.isFinite(limit) ? limit : undefined
})

/** Черновик набирается заново на каждое открытие: отменённое не должно всплыть в следующий раз. */
watch(
  () => [props.modelValue, props.itemId, item.value?.w, item.value?.h] as const,
  () => {
    if (!props.modelValue) return

    width.value = item.value?.w ?? null
    height.value = item.value?.h ?? null
  },
  { immediate: true },
)

watch(() => props.modelValue, (open) => {
  if (!open) refused.value = false
})

const dialogTitle = computed(() => props.title ?? t('grDashboard.settings.title', 'Widget settings'))

function close(): void {
  emit('update:modelValue', false)
}

function cancel(): void {
  if (props.itemId !== null) emit('cancel', props.itemId)

  close()
}

function apply(): void {
  const id = props.itemId
  const current = item.value
  if (id === null) {
    close()

    return
  }

  const span: GrDashboardSpan = {
    w: width.value ?? current?.w ?? 1,
    h: height.value ?? current?.h ?? 1,
  }

  if (showSize.value && current && (span.w !== current.w || span.h !== current.h)) {
    // Отказ у `resizeItem` молчаливый — он просто отдаёт исходную раскладку.
    // Закрыться над несделанным значило бы соврать, что размер применён.
    if (!dashboard?.resizeItemTo(id, span)) {
      refused.value = true

      return
    }
  }

  refused.value = false
  emit('apply', id, span)
  close()
}
</script>

<template>
  <GrDialog
    :model-value="modelValue"
    :title="dialogTitle"
    :size="size"
    @update:model-value="value => (value ? emit('update:modelValue', true) : cancel())"
  >
    <!-- Атрибуты потребителя садятся на тело, а не на `GrDialog`: его корень —
         телепорт, и туда они не наследуются вовсе (Vue гасит их с предупреждением). -->
    <div v-bind="$attrs" data-gr-dashboard-item-settings :class="bodyClass">
      <slot :item="item" />

      <div v-if="showSize" :class="sizeRowClass">
        <GrFormField :label="t('grDashboard.settings.width', 'Width, columns')">
          <GrNumberInput
            v-model="width"
            data-gr-dashboard-settings-width
            :min="minWidth"
            :max="maxWidth"
            :step="1"
          />
        </GrFormField>

        <GrFormField :label="t('grDashboard.settings.height', 'Height, rows')">
          <GrNumberInput
            v-model="height"
            data-gr-dashboard-settings-height
            :min="minHeight"
            :max="maxHeight"
            :step="1"
          />
        </GrFormField>
      </div>

      <p v-if="refused" data-gr-dashboard-settings-refusal :class="refusalClass" role="status">
        {{ t('grDashboard.settings.noRoom', 'There is no room for this size on the grid') }}
      </p>
    </div>

    <template #footer>
      <slot name="footer" :apply="apply" :cancel="cancel">
        <div :class="footerClass">
          <GrButton variant="ghost" @click="cancel">
            {{ t('grDashboard.settings.cancel', 'Cancel') }}
          </GrButton>
          <GrButton @click="apply">
            {{ t('grDashboard.settings.apply', 'Apply') }}
          </GrButton>
        </div>
      </slot>
    </template>
  </GrDialog>
</template>
