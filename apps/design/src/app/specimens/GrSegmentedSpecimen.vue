<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedSize, GrSegmentedValue, GrSegmentedVariant } from '@feugene/granularity'
import { computed, reactive, ref } from 'vue'

import IconAlignCenter from '~icons/lucide/align-center'
import IconAlignLeft from '~icons/lucide/align-left'
import IconAlignRight from '~icons/lucide/align-right'
import IconChartColumn from '~icons/lucide/chart-column'
import IconChartLine from '~icons/lucide/chart-line'
import IconLayoutGrid from '~icons/lucide/layout-grid'
import IconList from '~icons/lucide/list'
import IconTable from '~icons/lucide/table'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const PERIOD_OPTIONS: GrSegmentedOption[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]
const cardPeriod = ref<GrSegmentedValue>('week')

const SEGMENT_SIZES: readonly GrSegmentedSize[] = ['xs', 'sm', 'md', 'lg']
const RANGE_OPTIONS: GrSegmentedOption[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год', disabled: true },
]
const rangeBySize = reactive<Record<GrSegmentedSize, GrSegmentedValue>>({
  xs: 'week',
  sm: 'week',
  md: 'month',
  lg: 'quarter',
})

const VIEW_OPTIONS: GrSegmentedOption[] = [
  { value: 'list', icon: IconList, ariaLabel: 'Список' },
  { value: 'grid', icon: IconLayoutGrid, ariaLabel: 'Плитка' },
]
const view = ref<GrSegmentedValue>('list')

const CHART_OPTIONS: GrSegmentedOption[] = [
  { value: 'table', label: 'Таблица', icon: IconTable },
  { value: 'line', label: 'График', icon: IconChartLine },
  { value: 'bars', label: 'Столбцы', icon: IconChartColumn },
]
const chart = ref<GrSegmentedValue>('line')

const MAILBOX_OPTIONS: GrSegmentedOption[] = [
  { value: 'inbox', label: 'Входящие' },
  { value: 'sent', label: 'Отправленные' },
]
const mailbox = ref<GrSegmentedValue>('inbox')

const AUDIENCE_OPTIONS: GrSegmentedOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'docs', label: 'С документами' },
  { value: 'waiting', label: 'Ждут ответа' },
]
const audience = ref<GrSegmentedValue>('all')

const VARIANTS: readonly GrSegmentedVariant[] = ['pills', 'button']
const ALIGN_OPTIONS: GrSegmentedOption[] = [
  { value: 'left', label: 'Слева', icon: IconAlignLeft },
  { value: 'center', label: 'По центру', icon: IconAlignCenter },
  { value: 'right', label: 'Справа', icon: IconAlignRight },
]
const alignByVariant = reactive<Record<GrSegmentedVariant, GrSegmentedValue>>({ pills: 'center', button: 'center' })

const SHAPES = ['pill', 'box'] as const
const shapePeriod = reactive<Record<typeof SHAPES[number], GrSegmentedValue>>({ pill: 'week', box: 'week' })

const STATUS_OPTIONS: GrSegmentedOption[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'review', label: 'Проверка', loading: true },
  { value: 'done', label: 'Готово' },
]
const status = ref<GrSegmentedValue>('draft')

const ACCESS_OPTIONS: GrSegmentedOption[] = [
  { value: 'team', label: 'Команда' },
  { value: 'link', label: 'По ссылке' },
]
const CURRENCY_OPTIONS: GrSegmentedOption[] = [
  { value: 'rub', label: 'Рубль' },
  { value: 'usd', label: 'Доллар' },
  { value: 'eur', label: 'Евро' },
]
const PRIORITY_OPTIONS: GrSegmentedOption[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'mid', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
]
const priority = ref<GrSegmentedValue>('')
const priorityError = computed(() => (priority.value ? undefined : 'Выберите приоритет задачи'))

const FILTER_OPTIONS: GrSegmentedOption[] = [
  { value: 'all', label: 'Все задачи' },
  { value: 'mine', label: 'Мои' },
  { value: 'waiting', label: 'Ждут ответа' },
  { value: 'closed', label: 'Закрытые' },
]
const filter = ref<GrSegmentedValue>('mine')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div>
      <GrSegmented v-model="cardPeriod" :options="PERIOD_OPTIONS" aria-label="Период отчёта" />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ступени" note="xs · sm · md · lg — та же шкала, что у кнопок; недоступный «Год» стрелки пропускают.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SEGMENT_SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <div class="min-w-0">
            <GrSegmented
              v-model="rangeBySize[size]"
              :options="RANGE_OPTIONS"
              :size="size"
              :aria-label="`Период, ступень ${size}`"
            />
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Иконки" note="Сегменту без подписи имя даёт ariaLabel; иконка рядом с подписью — подсказка.">
      <div class="flex flex-wrap items-center gap-4">
        <GrSegmented v-model="view" :options="VIEW_OPTIONS" aria-label="Вид списка" />
        <GrSegmented v-model="chart" :options="CHART_OPTIONS" aria-label="Вид отчёта" />
      </div>
    </Specimen>

    <Specimen title="Во всю ширину" note="block — для мобильной формы; item-width=&quot;content&quot; отдаёт место длинным подписям, не влезшее уходит в многоточие с подсказкой.">
      <GrSegmented v-model="mailbox" :options="MAILBOX_OPTIONS" block aria-label="Папка писем" />
      <GrSegmented v-model="audience" :options="AUDIENCE_OPTIONS" block item-width="content" aria-label="Кого показать" />
    </Specimen>

    <Specimen title="Варианты" note="pills — лоток, button — тень у дорожки и индикатора, для панели инструментов; приложению вид задаёт тема.">
      <div v-for="variant in VARIANTS" :key="variant" class="flex flex-col gap-2">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ variant }}
        </span>
        <div>
          <GrSegmented v-model="alignByVariant[variant]" :options="ALIGN_OPTIONS" :variant="variant" :aria-label="`Выравнивание текста, вид ${variant}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Форма рамки" note="pill — дорожка-пилюля, box — скругление полей ввода, чтобы в форме сегменты не выглядели гостем; форму задаёт тема.">
      <div v-for="shape in SHAPES" :key="shape" class="flex flex-col gap-2">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ shape }}
        </span>
        <div>
          <GrSegmented v-model="shapePeriod[shape]" :options="PERIOD_OPTIONS" :shape="shape" :aria-label="`Период, рамка ${shape}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Состояния" note="Занятый сегмент крутит спиннер и не принимает выбор, но недоступным не объявлен; только чтение и недоступность гасятся токеном.">
      <GrFormField label="Статус документа" hint="«Проверка» — идёт синхронизация">
        <GrSegmented v-model="status" :options="STATUS_OPTIONS" />
      </GrFormField>
      <GrFormField label="Доступ" hint="Меняет владелец проекта">
        <GrSegmented model-value="team" :options="ACCESS_OPTIONS" readonly />
      </GrFormField>
      <GrFormField label="Валюта" hint="Задана договором" disabled>
        <GrSegmented model-value="rub" :options="CURRENCY_OPTIONS" />
      </GrFormField>
      <GrFormField label="Приоритет" :error="priorityError" required>
        <GrSegmented v-model="priority" :options="PRIORITY_OPTIONS" />
      </GrFormField>
    </Specimen>

    <Specimen title="Вертикаль" note="Боковые фильтры: содержимое у начала, стрелки обеих осей водят выбор.">
      <div class="w-56">
        <GrSegmented v-model="filter" :options="FILTER_OPTIONS" orientation="vertical" block aria-label="Фильтр задач" />
      </div>
    </Specimen>
  </div>
</template>
