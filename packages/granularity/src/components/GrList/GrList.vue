<script setup lang="ts">
import { computed, useSlots } from 'vue'

import GrCard from '../GrCard'
import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'
import { hasMeaningfulSlotContent } from '../shared/slotNodes'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import { dividedClass, emptyClass, loadingRowClass } from './grListStyles'

export interface GrListProps {
  /** Показывать ли горизонтальные разделители между элементами (по умолчанию — да). */
  divided?: boolean
  /** Идёт загрузка: вместо пунктов — строки-скелетоны, контейнер помечен `aria-busy`. */
  loading?: boolean
  /** Сколько строк-заглушек показать при `loading`. */
  loadingRows?: number
  /**
   * Список пуст. По умолчанию определяется сам — по содержимому слота; проп
   * нужен там, где потребитель знает лучше (например, слот заполнен
   * заголовками групп, а данных в них нет).
   */
  empty?: boolean
  /** Текст пустого состояния. Слот `#empty` сильнее. */
  emptyText?: string
}

const props = withDefaults(defineProps<GrListProps>(), {
  divided: true,
  loading: false,
  loadingRows: 3,
  empty: undefined,
  emptyText: undefined,
})

const slots = useSlots()
const { t } = useGranularityTranslations()

const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.list.empty', 'Nothing here yet'))

// Пустоту видно по слоту: `v-for` по пустому массиву оставляет фрагмент без
// узлов, `v-if` — комментарий, и ни то ни другое пунктом списка не является.
const isEmpty = computed(() => {
  if (props.empty !== undefined)
    return props.empty

  return !hasMeaningfulSlotContent(slots.default?.() ?? [])
})

const showItems = computed(() => !props.loading && !isEmpty.value)

// Разделители нужны только между пунктами: в пустой и загрузочной ветках они
// оставили бы висящую линию.
const listClass = computed(() => (props.divided && showItems.value ? dividedClass : undefined))

const loadingRowCount = computed(() => Math.max(1, Math.trunc(props.loadingRows)))
</script>

<template>
  <GrCard>
    <div
      data-gr-list
      role="list"
      :class="listClass"
      :aria-busy="loading ? 'true' : undefined"
    >
      <template v-if="loading">
        <slot name="loading">
          <div
            v-for="row in loadingRowCount"
            :key="row"
            data-gr-list-loading-row
            :class="loadingRowClass"
          >
            <GrSkeleton />
          </div>
        </slot>
      </template>

      <div
        v-else-if="isEmpty"
        data-gr-list-empty
        :class="emptyClass"
      >
        <slot name="empty">
          {{ resolvedEmptyText }}
        </slot>
      </div>

      <slot v-else />
    </div>
  </GrCard>
</template>
