<script setup lang="ts">
import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewSteps = ref([
  { id: 'lead', title: 'Новая заявка' },
  { id: 'offer', title: 'Коммерческое предложение' },
])

const stages = ref([
  { id: 'lead', title: 'Новая заявка', hint: 'Пришла с сайта или от менеджера' },
  { id: 'qualify', title: 'Квалификация', hint: 'Бюджет, сроки и кто принимает решение' },
  { id: 'offer', title: 'Коммерческое предложение', hint: 'Отправлено, ждём ответа' },
  { id: 'invoice', title: 'Счёт выставлен', hint: 'Ждёт оплаты до срока' },
  { id: 'paid', title: 'Оплачено', hint: 'Деньги на счёте, сделка закрыта' },
])
const lastMove = ref<string | null>(null)

function rememberMove(from: number, to: number): void {
  lastMove.value = `Этап перенесён с ${from + 1}-го места на ${to + 1}-е`
}

const priorities = ref([
  { id: 'bug', title: 'Починить выгрузку в 1С' },
  { id: 'vat', title: 'НДС 22 % в счетах' },
  { id: 'dark', title: 'Тёмная тема в кабинете' },
])

const reportColumns = ref([
  { id: 'date', title: 'Дата' },
  { id: 'client', title: 'Клиент' },
  { id: 'sum', title: 'Сумма' },
  { id: 'status', title: 'Статус' },
])

const route = ref([
  { id: 'warehouse', title: 'Склад на Складской, 4' },
  { id: 'office', title: 'Офис клиента, Тверская, 12' },
  { id: 'post', title: 'Почта, Новый Арбат, 2' },
])
const routeLocked = ref(true)

const onboardingSteps = [
  { id: 'invite', title: 'Пригласить команду' },
  { id: 'bank', title: 'Подключить банк' },
]
// Пустой список по умолчанию не открыт: текст пустоты лежит внутри role="list", и axe считает его чужим потомком.
const onboarding = ref([...onboardingSteps])

function toggleOnboarding(): void {
  onboarding.value = onboarding.value.length === 0 ? [...onboardingSteps] : []
}

const textClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrSortableList v-model="previewSteps" item-key="id" aria-label="Этапы воронки">
      <template #item="{ item, index }">
        <span class="font-500">{{ index + 1 }}. {{ item.title }}</span>
      </template>
    </GrSortableList>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="За ручку" note="Тянется ручка — указателем; с клавиатуры: Space берёт строку, стрелки двигают, Space кладёт, Esc отменяет.">
      <div class="flex flex-col gap-2">
        <GrSortableList v-model="stages" item-key="id" aria-label="Этапы воронки продаж" @move="rememberMove">
          <template #item="{ item, index }">
            <div class="flex min-w-0 flex-col gap-0.5">
              <span class="font-500">
                {{ index + 1 }}. {{ item.title }}
              </span>
              <span :class="mutedClass">
                {{ item.hint }}
              </span>
            </div>
          </template>
        </GrSortableList>
        <span :class="mutedClass">{{ lastMove ?? 'Событие move отдаёт пару индексов — удобно послать одну операцию на сервер.' }}</span>
      </div>
    </Specimen>

    <Specimen title="Вся строка — ручка" note="handle-only=false: тянется строка целиком — для коротких списков без ссылок и кнопок внутри.">
      <GrSortableList v-model="priorities" item-key="id" :handle-only="false" aria-label="Приоритеты спринта">
        <template #item="{ item, index }">
          <span class="flex items-center justify-between gap-3">
            <span>{{ item.title }}</span>
            <GrBadge :tone="index === 0 ? 'danger' : 'neutral'" size="sm">
              P{{ index + 1 }}
            </GrBadge>
          </span>
        </template>
      </GrSortableList>
    </Specimen>

    <Specimen title="Горизонтально" note="orientation=horizontal меняет и раскладку, и ось клавиатуры: двигают стрелки влево и вправо." wide>
      <GrSortableList v-model="reportColumns" item-key="id" orientation="horizontal" aria-label="Колонки отчёта">
        <template #item="{ item }">
          {{ item.title }}
        </template>
      </GrSortableList>
    </Specimen>

    <Specimen title="Недоступен" note="disabled запрещает перенос обоими способами, но оставляет список читаемым.">
      <div class="flex flex-col gap-3">
        <GrSwitch v-model="routeLocked">
          Маршрут утверждён
        </GrSwitch>
        <GrSortableList v-model="route" item-key="id" :disabled="routeLocked" aria-label="Точки маршрута курьера">
          <template #item="{ item }">
            <span :class="textClass">{{ item.title }}</span>
          </template>
        </GrSortableList>
      </div>
    </Specimen>

    <Specimen title="Пусто" note="Пустой список не исчезает: строка из empty-text держит место.">
      <div class="flex flex-col gap-3">
        <div>
          <GrButton size="sm" variant="secondary" tone="neutral" @click="toggleOnboarding">
            {{ onboarding.length === 0 ? 'Вернуть этапы' : 'Убрать все этапы' }}
          </GrButton>
        </div>
        <GrSortableList v-model="onboarding" item-key="id" empty-text="Добавьте первый этап — потом их можно будет переставить" aria-label="Этапы онбординга">
          <template #item="{ item }">
            {{ item.title }}
          </template>
        </GrSortableList>
      </div>
    </Specimen>
  </div>
</template>
