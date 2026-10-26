<script setup lang="ts">
import type { GrAutocompleteOption, GrAutocompleteOptionOrGroup } from '@feugene/granularity'
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const CITIES: GrAutocompleteOption[] = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань' },
  { value: 'ekb', label: 'Екатеринбург' },
  { value: 'nsk', label: 'Новосибирск' },
  { value: 'nnv', label: 'Нижний Новгород' },
  { value: 'kgd', label: 'Калининград' },
  { value: 'vvo', label: 'Владивосток' },
]
const PEOPLE: GrAutocompleteOption[] = [
  { value: 'ershova', label: 'Анна Ершова' },
  { value: 'kim', label: 'Борис Ким' },
  { value: 'loseva', label: 'Вера Лосева' },
  { value: 'martynov', label: 'Глеб Мартынов' },
  { value: 'orlova', label: 'Дина Орлова' },
]
const ZONES: GrAutocompleteOptionOrGroup[] = [
  { label: 'Европейская часть', options: [
    { value: 'kgd', label: 'Калининград · UTC+2' },
    { value: 'msk', label: 'Москва · UTC+3' },
    { value: 'smr', label: 'Самара · UTC+4' },
  ] },
  { label: 'Урал и Сибирь', options: [
    { value: 'ekb', label: 'Екатеринбург · UTC+5' },
    { value: 'oms', label: 'Омск · UTC+6' },
    { value: 'nsk', label: 'Новосибирск · UTC+7' },
  ] },
  { label: 'Дальний Восток', options: [
    { value: 'vvo', label: 'Владивосток · UTC+10' },
    { value: 'pkc', label: 'Петропавловск-Камчатский · UTC+12' },
  ] },
  { value: 'utc', label: 'Всемирное время · UTC' },
]
const ROLES: GrAutocompleteOption[] = [
  { value: 'Дизайнер', label: 'Дизайнер' },
  { value: 'Редактор', label: 'Редактор' },
  { value: 'Менеджер проекта', label: 'Менеджер проекта' },
  { value: 'Разработчик', label: 'Разработчик' },
]
const CLIENTS = [
  'Мастерская «Лён»',
  'Кофейня «Зерно»',
  'Книжный «Переплёт»',
  'Студия керамики «Глина»',
  'Пекарня «Колос»',
  'Типография «Оттиск»',
  'Цветочная «Пион»',
]

const previewMembers = ref(['kim', 'orlova'])

const city = ref('')
const members = ref(['kim', 'orlova'])
const zone = ref('msk')
const role = ref('')
const client = ref('')
const stepCity = ref('kzn')

const states = reactive({
  invalid: 'spb',
  disabled: 'msk',
  readonly: ['ershova', 'loseva'],
})

// Справочник «на сервере»: ответ приходит с задержкой, а отменённый запрос молчит.
function fetchClients(query: string, signal: AbortSignal): Promise<GrAutocompleteOption[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.toLocaleLowerCase('ru-RU')
      resolve(CLIENTS
        .filter(name => name.toLocaleLowerCase('ru-RU').includes(needle))
        .map(name => ({ value: name, label: name })))
    }, 700)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Поиск отменён', 'AbortError'))
    }, { once: true })
  })
}
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Участники">
      <GrAutocomplete v-model="previewMembers" :options="PEOPLE" multiple placeholder="Добавить" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Поиск по списку" note="Набранный текст — запрос: варианты отбираются на ходу.">
      <GrFormField label="Город доставки" hint="Начните вводить название">
        <GrAutocomplete
          v-model="city"
          :options="CITIES"
          placeholder="Например, Казань"
          clearable
          clear-label="Очистить город"
          no-results-text="Такого города в списке нет"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Несколько значений" note="Выбранное — чипами; ← из пустого запроса переходит на чипы, Backspace снимает последний.">
      <GrFormField label="Участники">
        <GrAutocomplete
          v-model="members"
          :options="PEOPLE"
          multiple
          placeholder="Добавить участника"
          no-results-text="Никого не нашли"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Группы" note="Группа без совпадений прячется целиком; стрелки ходят только по вариантам.">
      <GrFormField label="Часовой пояс">
        <GrAutocomplete v-model="zone" :options="ZONES" placeholder="Город или UTC" />
      </GrFormField>
    </Specimen>

    <Specimen title="Поиск на сервере" note="Запрос уходит со второй буквы; пока ждём ответа — строка загрузки, устаревший ответ отбрасывается.">
      <GrFormField label="Клиент" hint="Например, «студ» или «ка»">
        <GrAutocomplete
          v-model="client"
          :fetch-options="fetchClients"
          :min-query-length="2"
          placeholder="Название клиента"
          no-results-text="Такого клиента в базе нет"
          clearable
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Своё значение" note="Если подходящего нет, в списке появляется строка «Добавить …» — до неё доходят стрелками.">
      <GrFormField label="Должность" hint="Выберите или впишите свою">
        <GrAutocomplete v-model="role" :options="ROLES" allow-custom-value placeholder="Например, иллюстратор" />
      </GrFormField>
    </Specimen>

    <Specimen title="Состояния" note="Недоступно и только чтение одинаково запирают список; второе отдаёт значение в форму.">
      <GrFormField label="Склад отгрузки" error="Склад в Санкт-Петербурге на инвентаризации до пятницы">
        <GrAutocomplete v-model="states.invalid" :options="CITIES" />
      </GrFormField>
      <GrFormField label="Город офиса" hint="Меняет администратор" disabled>
        <GrAutocomplete v-model="states.disabled" :options="CITIES" />
      </GrFormField>
      <GrFormField label="Ответственные" readonly>
        <GrAutocomplete v-model="states.readonly" :options="PEOPLE" multiple />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Поле, список и чипы идут за ступенью." wide>
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex items-center gap-3">
          <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
          <div class="min-w-0 flex-1">
            <GrAutocomplete v-model="stepCity" :options="CITIES" :size="size" :aria-label="`Город, ступень ${size}`" />
          </div>
        </div>
      </div>
    </Specimen>
  </div>
</template>
