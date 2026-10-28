<script setup lang="ts">
import type { GrBadgeTone } from '@feugene/granularity'
import type {
  GrDashboardDropEvent,
  GrDashboardItemSize,
  GrDashboardMode,
  GrDashboardPaletteItem,
  GrDashboardPaletteSize,
  GrDashboardResponsiveLayout,
  GrDashboardToolbarSize,
} from '@feugene/granularity-dashboard'
import { addItem, colsFor, layoutFor, removeItem } from '@feugene/granularity-dashboard/layout'
import { computed, reactive, ref } from 'vue'

import IconTrash from '~icons/lucide/trash-2'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

/** Пороги меряют ширину сетки, а не окна: в половине колонки страницы сетка остаётся двенадцатиколоночной. */
const BREAKPOINTS = { lg: 520, md: 360, sm: 0 }
const COLS = { lg: 12, md: 6, sm: 1 }

const PREVIEW_BREAKPOINTS = { lg: 0 }
const previewLayout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'revenue', x: 0, y: 0, w: 2, h: 2 },
    { id: 'orders', x: 2, y: 0, w: 2, h: 2 },
  ],
})

const PERIODS = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
]

const WIDGETS: GrDashboardPaletteItem[] = [
  { id: 'revenue', title: 'Выручка', description: 'Сумма оплат за период', defaultSize: { w: 5, h: 2 } },
  { id: 'orders', title: 'Заказы', description: 'Число и динамика по дням', defaultSize: { w: 7, h: 2 }, minW: 4 },
  { id: 'conversion', title: 'Конверсия', description: 'Доля визитов с покупкой', defaultSize: { w: 5, h: 2 }, minW: 4 },
  { id: 'plan', title: 'План месяца', description: 'Сколько осталось до цели', defaultSize: { w: 6, h: 2 } },
  { id: 'returns', title: 'Возвраты', description: 'Заявки, ждущие решения', defaultSize: { w: 6, h: 3 } },
]
const widgetById = new Map(WIDGETS.map(widget => [widget.id, widget]))

function initialLayout(): GrDashboardResponsiveLayout {
  return {
    lg: [
      { id: 'revenue', x: 0, y: 0, w: 5, h: 2 },
      { id: 'orders', x: 5, y: 0, w: 7, h: 2 },
      { id: 'plan', x: 0, y: 2, w: 6, h: 2 },
      { id: 'returns', x: 6, y: 2, w: 6, h: 3 },
    ],
  }
}

const mode = ref<GrDashboardMode>('edit')
const layout = ref<GrDashboardResponsiveLayout>(initialLayout())
const placed = computed(() => (layout.value.lg ?? []).map(entry => entry.id))
const paletteItems = computed(() => WIDGETS.map(widget => ({ ...widget, disabled: placed.value.includes(widget.id) })))

/**
 * Виджет встаёт во все объявленные брейкпоинты — иначе на соседней ширине его
 * бы не оказалось. Брошенный — ещё и в ячейку под указателем, с опциями сетки:
 * подложка показывала ровно этот расчёт.
 */
function place(widget: GrDashboardPaletteItem, drop?: GrDashboardDropEvent): void {
  if (placed.value.includes(widget.id))
    return
  const size = drop?.transfer.size ?? widget.defaultSize ?? { w: 4, h: 2 }
  const entry = { id: widget.id, x: 0, y: 0, w: size.w, h: size.h }
  const next: GrDashboardResponsiveLayout = {}
  for (const [breakpoint, entries] of Object.entries(layout.value))
    next[breakpoint] = addItem(entries, entry, { cols: colsFor(breakpoint, COLS) })
  if (drop) {
    const base = layoutFor(layout.value, drop.breakpoint, { breakpoints: BREAKPOINTS, cols: COLS })
    next[drop.breakpoint] = addItem(base, entry, drop.options, drop.cell)
  }
  layout.value = next
}

function onDrop(event: GrDashboardDropEvent): void {
  const widget = widgetById.get(event.transfer.id)
  if (widget)
    place(widget, event)
}

function remove(id: string): void {
  const next: GrDashboardResponsiveLayout = {}
  for (const [breakpoint, entries] of Object.entries(layout.value))
    next[breakpoint] = removeItem(entries, id, { cols: colsFor(breakpoint, COLS) })
  layout.value = next
}

const period = ref<Record<string, string>>({})
const periodLabel = (id: string): string | undefined => PERIODS.find(entry => entry.value === (period.value[id] ?? 'month'))?.label

const settingsOpen = ref(false)
const settingsFor = ref<string | null>(null)
const draftPeriod = ref('month')

function openSettings(id: string): void {
  settingsFor.value = id
  draftPeriod.value = period.value[id] ?? 'month'
  settingsOpen.value = true
}

function applySettings(id: string): void {
  period.value = { ...period.value, [id]: draftPeriod.value }
}

function resetScene(): void {
  layout.value = initialLayout()
  period.value = {}
}

const ORDERS_BY_DAY = [182, 175, 190, 204, 198, 221, 236, 229, 241, 255, 248, 262, 270, 284]
const RETURNS: readonly { id: string, title: string, status: string, tone: GrBadgeTone }[] = [
  { id: 'R-1042', title: 'Кофемолка ручная', status: 'Ждёт решения', tone: 'warning' },
  { id: 'R-1043', title: 'Френч-пресс 0,6 л', status: 'Одобрен', tone: 'success' },
  { id: 'R-1047', title: 'Весы для кофе', status: 'Отклонён', tone: 'danger' },
]

const slotsEditing = ref(true)
const slotsLayout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'report', x: 0, y: 0, w: 5, h: 3 },
    { id: 'uptime', x: 5, y: 0, w: 3, h: 3 },
    { id: 'duty', x: 8, y: 0, w: 4, h: 3 },
  ],
})
const DUTY = [
  { id: 'anna', title: 'Анна Соколова', description: 'Поддержка · до 18:00' },
  { id: 'ilya', title: 'Илья Орлов', description: 'Платежи · до 20:00' },
  { id: 'maria', title: 'Мария Белова', description: 'Склад · до 16:00' },
]

const RATES = [
  { code: 'USD', rate: '92,40 ₽' },
  { code: 'EUR', rate: '99,85 ₽' },
  { code: 'CNY', rate: '12,71 ₽' },
]

const boundsLayout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'chart', x: 0, y: 0, w: 6, h: 2 },
    { id: 'fixed', x: 6, y: 0, w: 6, h: 2 },
    { id: 'maintenance', x: 0, y: 2, w: 12, h: 2 },
  ],
})

const sizesLayout = ref<GrDashboardResponsiveLayout>({
  lg: SIZES.map((size, index) => ({ id: size, x: index * 3, y: 0, w: 3, h: 2 })),
})

const toolbarMode = ref<GrDashboardMode>('view')
const toolbarPeriod = ref('month')
const toolbarResets = ref(0)
const lockedMode = ref<GrDashboardMode>('view')
const toolbarModes = reactive<Record<GrDashboardToolbarSize, GrDashboardMode>>({ xs: 'view', sm: 'view', md: 'edit', lg: 'view' })

const STARTING_ADDED = ['orders']
const added = ref<string[]>([...STARTING_ADDED])

function markAdded(widget: GrDashboardPaletteItem): void {
  added.value = [...added.value, widget.id]
}
const catalogItems = computed(() => WIDGETS.slice(0, 3).map(widget => ({ ...widget, disabled: added.value.includes(widget.id) })))
const catalogTouched = computed(() => added.value.join() !== STARTING_ADDED.join())
const NO_WIDGETS: GrDashboardPaletteItem[] = []
const LOCKED_WIDGETS: GrDashboardPaletteItem[] = WIDGETS.slice(3)
const PALETTE_SIZES: readonly GrDashboardPaletteSize[] = SIZES
const SIZE_WIDGET: GrDashboardPaletteItem[] = [WIDGETS[0]!]

const emptyLayout = ref<GrDashboardResponsiveLayout>({ lg: [] })

const ITEM_SIZES: readonly GrDashboardItemSize[] = SIZES
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrDashboard
      v-model:layout="previewLayout"
      mode="edit"
      :breakpoints="PREVIEW_BREAKPOINTS"
      :cols="4"
      :row-height="40"
      :gap="8"
      aria-label="Сводка продаж"
    >
      <GrDashboardItem item-id="revenue" title="Доход" size="xs" overflow="hidden">
        <p class="whitespace-nowrap text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
          4,2 млн ₽
        </p>
      </GrDashboardItem>
      <GrDashboardItem item-id="orders" title="Заказы" size="xs" overflow="hidden">
        <p class="whitespace-nowrap text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
          1 284
        </p>
      </GrDashboardItem>
    </GrDashboard>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen
      title="Сборка дашборда"
      note="Тулбар переключает режим, каталог добавляет кнопкой или переносом, шестерёнка открывает окно настроек. Подложка и призрак — токены рамы — видны только пока виджет несут."
      wide
    >
      <GrDashboardToolbar v-model:mode="mode" resettable aria-label="Управление дашбордом продаж" @reset="resetScene">
        <template #start>
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Продажи · октябрь
          </span>
        </template>
      </GrDashboardToolbar>

      <div class="grid gap-4" :class="mode === 'edit' ? 'lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start' : ''">
        <GrDashboardPalette v-if="mode === 'edit'" :items="paletteItems" aria-label="Виджеты продаж" @add="place" />

        <GrDashboard
          v-model:layout="layout"
          :mode="mode"
          :breakpoints="BREAKPOINTS"
          :cols="COLS"
          :row-height="72"
          aria-label="Продажи за октябрь"
          @item-drop="onDrop"
          @item-settings="openSettings"
        >
          <GrDashboardItem
            v-for="id in placed"
            :key="id"
            :item-id="id"
            :title="widgetById.get(id)?.title"
            :min-w="widgetById.get(id)?.minW"
            show-settings
            overflow="hidden"
          >
            <template #actions>
              <GrBadge size="sm" tone="neutral">
                {{ periodLabel(id) }}
              </GrBadge>
            </template>
            <template #editActions>
              <GrButton
                size="xs"
                variant="ghost"
                tone="danger"
                square
                :aria-label="`Убрать «${widgetById.get(id)?.title}»`"
                @click="remove(id)"
              >
                <GrIcon><IconTrash /></GrIcon>
              </GrButton>
            </template>

            <GrStatistic
              v-if="id === 'revenue'"
              :value="4.2"
              :precision="1"
              suffix="млн ₽"
              locale="ru-RU"
              tone="success"
              trend="up"
              trend-text="+12 % к сентябрю"
            />
            <div v-else-if="id === 'orders'" class="flex h-full items-center gap-6">
              <p class="flex shrink-0 flex-col">
                <span class="text-[length:var(--gr-text-2xl)] font-600 leading-[var(--gr-leading-tight)]">1 284</span>
                <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заказа за две недели</span>
              </p>
              <div class="min-w-0 flex-1">
                <GrSparkline :data="ORDERS_BY_DAY" aria-label="Заказы по дням: от 182 до 284" />
              </div>
            </div>
            <div v-else-if="id === 'plan'" class="flex flex-col gap-2">
              <GrProgressBar :value="68" show-value aria-label="Выполнение плана месяца" />
              <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
                2,9 из 4,2 млн ₽ · осталось 9 дней
              </p>
            </div>
            <ul v-else-if="id === 'returns'" class="flex flex-col gap-2">
              <li v-for="item in RETURNS" :key="item.id" class="flex items-center justify-between gap-3">
                <span class="flex min-w-0 flex-col">
                  <span class="truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">{{ item.title }}</span>
                  <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.id }}</span>
                </span>
                <GrBadge size="sm" :tone="item.tone">
                  {{ item.status }}
                </GrBadge>
              </li>
            </ul>
            <GrStatistic v-else :value="3.8" :precision="1" suffix="%" locale="ru-RU" />
          </GrDashboardItem>

          <GrDashboardItemSettings v-model="settingsOpen" :item-id="settingsFor" @apply="applySettings">
            <GrFormField label="Период">
              <GrSelect v-model="draftPeriod" :options="PERIODS" />
            </GrFormField>
          </GrDashboardItemSettings>

          <template #empty>
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              Все виджеты убраны — верните их из каталога или сбросьте раскладку.
            </p>
          </template>
        </GrDashboard>
      </div>
    </Specimen>

    <Specimen
      title="Виджет: шапка, действия, подвал"
      note="Шапка появляется только с title, #header или #actions; у безголового виджета ручка ложится панелью поверх содержимого и место не сдвигает. padding=&quot;none&quot; отдаёт тело списку край в край."
      wide
    >
      <div>
        <GrSwitch v-model="slotsEditing">
          Режим правки
        </GrSwitch>
      </div>
      <GrDashboard
        v-model:layout="slotsLayout"
        :mode="slotsEditing ? 'edit' : 'view'"
        :breakpoints="BREAKPOINTS"
        :cols="COLS"
        :row-height="72"
        aria-label="Виджеты со слотами"
      >
        <GrDashboardItem item-id="report" title="Отчёт за квартал" overflow="hidden">
          <template #actions>
            <GrBadge size="sm" tone="info">
              черновик
            </GrBadge>
          </template>
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            Выручка выросла на треть, расходы на привлечение — на 8&nbsp;%.
          </p>
          <template #footer>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              Обновлён 14 октября, 09:40
            </span>
          </template>
        </GrDashboardItem>

        <GrDashboardItem item-id="uptime" aria-label="Доступность сервиса" overflow="hidden">
          <div class="flex h-full flex-col justify-center gap-1">
            <span class="text-[length:var(--gr-text-2xl)] font-600 leading-[var(--gr-leading-tight)]">99,95 %</span>
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">доступность за 30 дней</span>
          </div>
        </GrDashboardItem>

        <GrDashboardItem item-id="duty" title="Дежурные" padding="none" overflow="hidden">
          <GrList variant="ghost">
            <GrListItem v-for="person in DUTY" :key="person.id" :title="person.title" :description="person.description" density="compact" />
          </GrList>
        </GrDashboardItem>
      </GrDashboard>
    </Specimen>

    <Specimen
      title="Что можно двигать"
      note="min-w — граница самого виджета; :resizable=&quot;false&quot; снимает уголок, перенос остаётся; static не двигается ни сам, ни соседями, и упёршийся в него перенос отменяется целиком."
      wide
    >
      <GrDashboard
        v-model:layout="boundsLayout"
        mode="edit"
        :breakpoints="BREAKPOINTS"
        :cols="COLS"
        :row-height="72"
        aria-label="Виджеты с ограничениями"
      >
        <GrDashboardItem item-id="chart" title="Выручка по дням" :min-w="4" :min-h="2" overflow="hidden">
          <GrSparkline :data="ORDERS_BY_DAY" variant="area" aria-label="Выручка по дням за две недели" />
        </GrDashboardItem>
        <GrDashboardItem item-id="fixed" title="Курс валют" :resizable="false" overflow="hidden">
          <dl class="flex flex-col gap-1">
            <div v-for="item in RATES" :key="item.code" class="flex items-center justify-between gap-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              <dt class="font-[var(--gr-font-mono)] text-[var(--gr-muted-fg)]">
                {{ item.code }}
              </dt>
              <dd>{{ item.rate }}</dd>
            </div>
          </dl>
        </GrDashboardItem>
        <GrDashboardItem item-id="maintenance" title="Плановые работы" static overflow="hidden">
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            Платежи недоступны в ночь на 2 ноября, с 02:00 до 04:00.
          </p>
        </GrDashboardItem>
      </GrDashboard>
    </Specimen>

    <Specimen
      title="Ступени виджета"
      note="size — плотность шапки и кегль заголовка, а не место в сетке: ширину и высоту в ячейках держит раскладка."
      wide
    >
      <GrDashboard
        v-model:layout="sizesLayout"
        mode="view"
        :breakpoints="BREAKPOINTS"
        :cols="COLS"
        :row-height="56"
        aria-label="Виджеты по ступеням"
      >
        <GrDashboardItem
          v-for="size in ITEM_SIZES"
          :key="size"
          :item-id="size"
          title="Выручка"
          :size="size"
          overflow="hidden"
        >
          <template #actions>
            <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ size }}
            </span>
          </template>
          <p class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">
            4,2 млн ₽
          </p>
        </GrDashboardItem>
      </GrDashboard>
    </Specimen>

    <Specimen
      title="Тулбар"
      note="Свои контролы встают в слоты #start и #end — здесь период. Сброс подтверждения не спрашивает: диалог, если нужен, ставит приложение. disabled гасит только встроенные кнопки."
    >
      <GrDashboardToolbar v-model:mode="toolbarMode" resettable aria-label="Управление дашбордом" @reset="toolbarResets++">
        <template #start>
          <GrSelect v-model="toolbarPeriod" :options="PERIODS" size="sm" class="w-32" aria-label="Период дашборда" />
        </template>
      </GrDashboardToolbar>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Режим: {{ toolbarMode === 'edit' ? 'правка' : 'просмотр' }} · сбросов: {{ toolbarResets }}
      </p>
      <GrDashboardToolbar v-model:mode="lockedMode" resettable disabled aria-label="Управление архивным дашбордом">
        <template #start>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            Архив
          </span>
        </template>
      </GrDashboardToolbar>
    </Specimen>

    <Specimen title="Ступени тулбара" note="xs · sm · md · lg — ступень встроенных кнопок; нажатая кнопка режима — aria-pressed и заливка.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrDashboardToolbar v-model:mode="toolbarModes[size]" :size="size" :aria-label="`Управление дашбордом, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen
      title="Каталог"
      note="Поставленный виджет остаётся в списке выключенным — список не прыгает. Без сетки рядом перенос выключен: бросить плитку здесь некуда."
    >
      <GrDashboardPalette :items="catalogItems" :draggable="false" aria-label="Виджеты для добавления" @add="markAdded" />
      <div>
        <GrButton size="sm" variant="ghost" tone="neutral" :disabled="!catalogTouched" @click="added = [...STARTING_ADDED]">
          Вернуть каталог
        </GrButton>
      </div>
      <GrDashboardPalette :items="LOCKED_WIDGETS" :draggable="false" disabled aria-label="Виджеты, недоступные на тарифе" />
      <GrDashboardPalette :items="NO_WIDGETS" aria-label="Пустой каталог" />
    </Specimen>

    <Specimen title="Ступени каталога" note="Ступень — кегль плитки и кнопки «Добавить»; размер виджета в ячейках виден рядом с названием.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in PALETTE_SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrDashboardPalette :items="SIZE_WIDGET" :size="size" :draggable="false" :aria-label="`Каталог, ступень ${size}`" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Пустая сетка" note="Пока в раскладке нет виджетов, сетка говорит об этом строкой локали; свой текст — слот #empty.">
      <GrDashboard
        v-model:layout="emptyLayout"
        mode="edit"
        :breakpoints="BREAKPOINTS"
        :cols="COLS"
        :row-height="72"
        aria-label="Новый дашборд"
      />
    </Specimen>
  </div>
</template>
