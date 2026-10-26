<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import type { GrControlShape, GrSelectOption, GrSelectOptionOrGroup, GrSelectSize } from '@feugene/granularity'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const statusOptions: GrSelectOptionOrGroup[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'work', label: 'В работе' },
  { value: 'review', label: 'На проверке' },
  { value: 'done', label: 'Готово' },
]
const status = ref('work')
const nativeStatus = ref('review')

const cityOptions: GrSelectOptionOrGroup[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'mur', label: 'Мурманск' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань' },
  { value: 'nsk', label: 'Новосибирск' },
  { value: 'ekb', label: 'Екатеринбург' },
  { value: 'kgd', label: 'Калининград' },
  { value: 'sam', label: 'Самара' },
]
const city = ref('msk')

const labelOptions: GrSelectOptionOrGroup[] = [
  {
    label: 'Команда',
    options: [
      { value: 'design', label: 'Дизайн' },
      { value: 'code', label: 'Код' },
      { value: 'marketing', label: 'Маркетинг' },
    ],
  },
  {
    label: 'Процесс',
    options: [
      { value: 'research', label: 'Исследование' },
      { value: 'support', label: 'Поддержка' },
      { value: 'release', label: 'Релиз' },
    ],
  },
]
const labels = ref(['design', 'code', 'research', 'release'])

const kindOptions: GrSelectOptionOrGroup[] = [
  { value: 'bug', label: 'Ошибка', tone: 'danger' },
  { value: 'idea', label: 'Идея', tone: 'success' },
  { value: 'question', label: 'Вопрос', tone: 'info' },
  { value: 'urgent', label: 'Срочно', tone: 'danger', dark: true },
]
const kinds = ref(['bug', 'urgent'])

const segmentOptions: GrSelectOptionOrGroup[] = [
  { value: 'Малый бизнес', label: 'Малый бизнес' },
  { value: 'Корпорации', label: 'Корпорации' },
  { value: 'Партнёры', label: 'Партнёры' },
]
const segment = ref('')

const OWNERS: GrSelectOption[] = [
  { value: 'sokolova', label: 'Анна Соколова' },
  { value: 'petrov', label: 'Иван Петров' },
  { value: 'smirnova', label: 'Мария Смирнова' },
  { value: 'kuznetsov', label: 'Олег Кузнецов' },
  { value: 'volkova', label: 'Елена Волкова' },
  { value: 'morozov', label: 'Дмитрий Морозов' },
]
const owner = ref('')
const ownerOptions = ref<GrSelectOption[]>(OWNERS)
const ownerLoading = ref(false)
let ownerTimer: ReturnType<typeof setTimeout> | undefined

// Выбранный остаётся в ответе при любом запросе: без своей опции поле потеряло бы подпись значения.
function searchOwners(query: string): void {
  clearTimeout(ownerTimer)
  ownerLoading.value = true
  ownerTimer = setTimeout(() => {
    const needle = query.trim().toLowerCase()
    ownerOptions.value = OWNERS.filter(option => !needle || option.value === owner.value || option.label.toLowerCase().includes(needle))
    ownerLoading.value = false
  }, 500)
}

onBeforeUnmount(() => clearTimeout(ownerTimer))

const pickupOptions: GrSelectOptionOrGroup[] = Array.from({ length: 300 }, (_, index) => {
  const number = String(index + 1).padStart(3, '0')
  return { value: `p${number}`, label: `Пункт выдачи № ${number}` }
})
const pickup = ref('p128')

const priorityOptions: GrSelectOptionOrGroup[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
]
const priority = ref('high')

const warehouseOptions: GrSelectOptionOrGroup[] = [
  { value: 'msk', label: 'Склад в Москве' },
  { value: 'nsk', label: 'Склад в Новосибирске' },
  { value: 'vvo', label: 'Склад во Владивостоке' },
]
const warehouse = ref('vvo')

const departmentOptions: GrSelectOptionOrGroup[] = [
  { value: 'sales', label: 'Продажи' },
  { value: 'support', label: 'Поддержка' },
  { value: 'finance', label: 'Финансы' },
  { value: 'legal', label: 'Юристы' },
]
const department = ref('')
const departmentError = computed(() => (department.value ? undefined : 'Без отдела заявку не направить'))

const planOptions: GrSelectOptionOrGroup[] = [
  { value: 'start', label: 'Старт' },
  { value: 'team', label: 'Команда' },
  { value: 'corp', label: 'Корпоративный — по запросу', disabled: true },
]
const plan = ref('team')

const SIZES: readonly GrSelectSize[] = ['xs', 'sm', 'md', 'lg']
const SHAPES: readonly GrControlShape[] = ['box', 'pill']
const sizeStatus = ref('review')

const sortOptions: GrSelectOptionOrGroup[] = [
  { value: 'date', label: 'дате изменения' },
  { value: 'title', label: 'названию' },
  { value: 'owner', label: 'ответственному' },
]
const sort = ref('date')

const pageSizeOptions: GrSelectOptionOrGroup[] = [
  { value: '20', label: 'по 20' },
  { value: '50', label: 'по 50' },
  { value: '100', label: 'по 100' },
]
const pageSize = ref('20')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Статус">
      <GrSelect v-model="status" :options="statusOptions" options-view="panel" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Панель и системный список" note="Своя панель пакета — с подсветкой и клавиатурой; native отдаёт выбор колесу системы, на телефоне это лучше.">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Статус · панель">
          <GrSelect v-model="status" :options="statusOptions" options-view="panel" />
        </GrFormField>
        <GrFormField label="Статус · native">
          <GrSelect v-model="nativeStatus" :options="statusOptions" />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Поиск внутри панели" note="filterable сужает загруженный список, пустой результат говорит своими словами; крестик снимает значение.">
      <GrFormField label="Город">
        <GrSelect
          v-model="city"
          :options="cityOptions"
          options-view="panel"
          filterable
          clearable
          placeholder="Выберите город"
          filter-placeholder="Найти город"
          no-results-text="Такого города нет — проверьте написание"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Несколько значений" note="Группы в панели, выбранное — тегами с хвостом «+2»; панель не закрывается после каждого выбора.">
      <GrFormField label="Метки">
        <GrSelect v-model="labels" :options="labelOptions" multiple tags :max-tag-count="2" :close-on-select="false" />
      </GrFormField>
    </Specimen>

    <Specimen title="Свой цвет у тега" note="tone и dark приходят с опцией: метки и категории несут свой цвет, а крестик и «+N» остаются за полем.">
      <GrFormField label="Тип обращения">
        <GrSelect v-model="kinds" :options="kindOptions" multiple tags :close-on-select="false" />
      </GrFormField>
    </Specimen>

    <Specimen title="Своё значение" note="Нет в списке — впишите своё прямо в панели, и оно станет значением поля.">
      <GrFormField label="Сегмент клиентов">
        <GrSelect
          v-model="segment"
          :options="segmentOptions"
          options-view="panel"
          allow-custom-value
          placeholder="Выберите или впишите"
          custom-value-placeholder="Свой сегмент"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Подгрузка с сервера" note="Запрос уходит событием search, пока ждём ответа — индикатор вместо списка.">
      <GrFormField label="Ответственный">
        <GrSelect
          v-model="owner"
          :options="ownerOptions"
          :loading="ownerLoading"
          options-view="panel"
          filterable
          placeholder="Кто ведёт задачу"
          filter-placeholder="Имя сотрудника"
          loading-text="Ищем сотрудников…"
          no-results-text="Никого не нашли"
          @search="searchOwners"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Длинный список" note="Триста пунктов, а в DOM — только окно вокруг видимых; открытая панель сразу прокручена к выбранному.">
      <GrFormField label="Пункт выдачи">
        <GrSelect
          v-model="pickup"
          :options="pickupOptions"
          options-view="panel"
          filterable
          virtual
          :dropdown-max-height="240"
          filter-placeholder="Номер пункта"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Подсветка и ошибка" note="Рамка успеха и предупреждения — подсказка, ошибка сильнее любой подсветки и объявляет aria-invalid.">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Приоритет" hint="Попадёт в первую линию">
          <GrSelect v-model="priority" :options="priorityOptions" options-view="panel" state="success" />
        </GrFormField>
        <GrFormField label="Склад" hint="Отгрузка — через четыре дня">
          <GrSelect v-model="warehouse" :options="warehouseOptions" options-view="panel" state="warning" />
        </GrFormField>
        <GrFormField label="Отдел" :error="departmentError" required>
          <GrSelect
            v-model="department"
            :options="departmentOptions"
            options-view="panel"
            placeholder="Выберите отдел"
            :invalid="Boolean(departmentError)"
          />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Недоступно и только чтение" note="Выключенное поле гаснет целиком, readonly показывает значение и не открывается; недоступная опция видна, но не выбирается.">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Статус · выключено" disabled>
          <GrSelect v-model="status" :options="statusOptions" options-view="panel" />
        </GrFormField>
        <GrFormField label="Статус · только чтение" readonly>
          <GrSelect v-model="status" :options="statusOptions" options-view="panel" readonly />
        </GrFormField>
        <GrFormField label="Тариф">
          <GrSelect v-model="plan" :options="planOptions" options-view="panel" />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Ступени и форма" note="xs · sm · md · lg по шкале контролов; pill — пилюля, как у сегментов.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <span />
        <code
          v-for="shape in SHAPES"
          :key="shape"
          class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]"
        >{{ shape }}</code>
        <template v-for="size in SIZES" :key="size">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</code>
          <GrSelect
            v-for="shape in SHAPES"
            :key="shape"
            v-model="sizeStatus"
            :options="statusOptions"
            options-view="panel"
            :size="size"
            :shape="shape"
            :aria-label="`Статус, ступень ${size}, форма ${shape}`"
          />
        </template>
      </div>
    </Specimen>

    <Specimen title="Строчная ссылка" note="Вид link встаёт в строку текста без рамки — для сортировки и настроек вида над списком.">
      <div class="flex flex-col gap-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <div class="flex flex-wrap items-baseline gap-1">
          <span>Сортировать по</span>
          <GrSelect v-model="sort" :options="sortOptions" view="link" options-view="panel" aria-label="Сортировка" />
        </div>
        <div class="flex flex-wrap items-baseline gap-1 text-[var(--gr-muted-fg)]">
          <span>Показывать</span>
          <GrSelect v-model="pageSize" :options="pageSizeOptions" view="link" variant="muted" options-view="panel" aria-label="Строк на странице" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
