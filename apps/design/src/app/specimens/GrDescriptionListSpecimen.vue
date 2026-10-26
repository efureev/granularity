<script setup lang="ts">
import type { GrDescriptionItem } from '@feugene/granularity/components/GrDescriptionList'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const money = new Intl.NumberFormat('ru-RU')

function rub(value: number): string {
  return `${money.format(value)}\u00A0₽`
}

const contract: GrDescriptionItem[] = [
  { label: 'Номер договора', value: 'КД-2026/0418', name: 'number' },
  { label: 'Статус', value: 'Подписан', name: 'status' },
  { label: 'Сумма', value: rub(1_240_000) },
  { label: 'Ответственный', value: 'Анна Соколова' },
  { label: 'Дата расторжения', value: null },
]

const previewCard: GrDescriptionItem[] = contract.slice(1, 3)

const quarter: GrDescriptionItem[] = [
  { label: 'Выручка', value: '4,2\u00A0млн\u00A0₽' },
  { label: 'Клиентов', value: 318 },
  { label: 'Средний чек', value: rub(13_200) },
]

const request: GrDescriptionItem[] = [
  { label: 'Метод', value: 'POST' },
  { label: 'Код ответа', value: 201 },
  { label: 'Длительность', value: '184 мс' },
  { label: 'Размер', value: '2,4 КБ' },
  { label: 'Повторов', value: 0 },
  { label: 'Регион', value: 'eu-central' },
  { label: 'Клиент', value: 'web 3.1.1' },
  { label: 'X-Request-Id', value: 'req_01HXQZ7C4M2V8KJ3T9' },
]

const thread: GrDescriptionItem[] = [
  { label: 'Сообщений', value: 3 },
  { label: 'Создана', value: '12 окт' },
  { label: 'Последнее', value: 'вчера' },
]

const balance: GrDescriptionItem[] = [
  { label: 'Оплачено', value: rub(132_500), tone: 'success' },
  { label: 'Ждёт оплаты', value: rub(12_400), tone: 'warning' },
  { label: 'Просрочено', value: rub(7_900), tone: 'danger' },
]

const requisites: GrDescriptionItem[] = [
  { label: 'Получатель', value: 'ООО «Глина»' },
  { label: 'ИНН', value: '7704123456' },
  { label: 'Расчётный счёт', value: '40702810900000012345' },
]

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <!-- Колонку подписи задаёт тема; в узкой карточке пары складываются в столбик. -->
    <GrDescriptionList :items="previewCard" divided :stack-below="320">
      <template #value-status="{ item }">
        <GrBadge tone="success" size="sm">
          {{ item.value }}
        </GrBadge>
      </template>
    </GrDescriptionList>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="В строку с линиями" note="Подписи — колонкой, значения — в общую линию; пустое значение — прочерк, а не пропавшая строка.">
      <GrDescriptionList :items="contract" divided>
        <template #value-number="{ item }">
          <span class="font-[var(--gr-font-mono)]">{{ item.value }}</span>
        </template>
        <template #value-status="{ item }">
          <GrBadge tone="success" size="sm">
            {{ item.value }}
          </GrBadge>
        </template>
      </GrDescriptionList>
    </Specimen>

    <Specimen title="Столбиком" note="Подпись над значением: короткие показатели встают в ряд.">
      <GrDescriptionList :items="quarter" layout="stacked" :columns="3" />
    </Specimen>

    <Specimen title="Колонки — потолок" note="columns=4 значит «до четырёх»: колонок столько, сколько вмещает контейнер, пара не рвётся." wide>
      <GrDescriptionList :items="request" layout="stacked" :columns="4" />
    </Specimen>

    <Specimen title="Строкой" note="flow — метаданные подписью к чему-то другому: пары текут по ширине и переносятся.">
      <div class="flex flex-col gap-1">
        <p class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
          Перенос оплаты по счёту СЧ-1045
        </p>
        <GrDescriptionList :items="thread" layout="flow" size="sm" />
      </div>
    </Specimen>

    <Specimen title="Тон значения" note="Красится только значение: красная подпись читалась бы как сломанное поле.">
      <GrDescriptionList :items="balance" />
    </Specimen>

    <Specimen title="Плотно и мельче" note="density=compact и size=sm — для реквизитов внутри панели.">
      <GrDescriptionList :items="requisites" density="compact" size="sm" />
    </Specimen>

    <Specimen title="Узкий контейнер" note="stackBelow: уже порога контейнер — подписи встают над значениями. Меряется контейнер, а не экран." wide>
      <div class="grid gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div class="flex flex-col gap-2">
          <span :class="mutedClass">колонка 14rem</span>
          <GrDescriptionList :items="requisites" :stack-below="320" />
        </div>
        <div class="flex flex-col gap-2">
          <span :class="mutedClass">остальная ширина</span>
          <GrDescriptionList :items="requisites" :stack-below="320" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
