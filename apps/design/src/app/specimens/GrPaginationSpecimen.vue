<script setup lang="ts">
import { ref } from 'vue'
import type { GrPaginationPageSizeOption, GrPaginationSize } from '@feugene/granularity/components/GrPagination'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const numbers = new Intl.NumberFormat('ru-RU')

const previewPage = ref(2)

const fullPage = ref(5)
const fullPageSize = ref(25)
const pageSizes: GrPaginationPageSizeOption[] = [
  { value: 10, label: '10 на странице' },
  { value: 25, label: '25 на странице' },
  { value: 50, label: '50 на странице' },
  { value: 100, label: '100 на странице' },
]

const compactPage = ref(5)
const tablePage = ref(3)
const nearPage = ref(10)
const tightPage = ref(10)
const disabledPage = ref(4)

const sizes: readonly GrPaginationSize[] = ['xs', 'sm', 'md', 'lg']
const sizePages = ref<Record<GrPaginationSize, number>>({ xs: 3, sm: 3, md: 3, lg: 3 })

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <!-- Три страницы и xs — чтобы ряд с «Назад» и «Вперёд» уместился в узкую карточку без прокрутки. -->
    <GrPagination v-model:page="previewPage" :page-size="10" :total="30" size="xs" aria-label="Страницы списка" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Полная" note="Итог, размер страницы и переход по номеру; ряд переносится только между группами, навигация — одним куском." wide>
      <GrPagination
        v-model:page="fullPage"
        v-model:page-size="fullPageSize"
        :total="1600"
        :page-sizes="pageSizes"
        show-total
        show-page-size
        show-jumper
        jumper-label="Перейти к"
        aria-label="Страницы журнала, полный вариант"
      >
        <template #total="{ total }">
          Всего {{ numbers.format(total) }} счетов
        </template>
      </GrPagination>
    </Specimen>

    <Specimen title="Компактная" note="«Текущая / всего» вместо номеров — для узкой колонки, тулбара и мобильного.">
      <div class="flex justify-start">
        <GrPagination
          v-model:page="compactPage"
          :page-size="25"
          :total="1600"
          compact
          aria-label="Страницы журнала, компактный вариант"
        />
      </div>
    </Specimen>

    <Specimen title="Под таблицей" note="show-total печатает диапазон показанного: «41–60 из 137» рядом с навигацией.">
      <GrPagination v-model:page="tablePage" :page-size="20" :total="137" size="sm" show-total aria-label="Страницы заказов" />
    </Specimen>

    <Specimen title="Усечение" note="Видны первая, последняя и соседи текущей; sibling-count=0 сужает ряд, одиночный пропуск рисуется номером, а не многоточием." wide>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span :class="mutedClass">sibling-count 1</span>
          <GrPagination v-model:page="nearPage" :page-size="10" :total="200" aria-label="Страницы архива, по соседу с каждой стороны" />
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span :class="mutedClass">sibling-count 0</span>
          <GrPagination v-model:page="tightPage" :page-size="10" :total="200" :sibling-count="0" aria-label="Страницы архива, без соседей" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Коробка номера той же высоты, что GrButton того же размера: 28, 32, 40 и 44 px." wide>
      <div class="flex flex-col gap-4">
        <div v-for="size in sizes" :key="size" class="flex flex-wrap items-center justify-between gap-3">
          <span :class="mutedClass">size {{ size }}</span>
          <GrPagination v-model:page="sizePages[size]" :page-size="10" :total="50" :size="size" :aria-label="`Страницы, размер ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Недоступна" note="disabled гасит всё разом: номера, кнопки, селект и поле перехода." wide>
      <GrPagination
        v-model:page="disabledPage"
        :page-size="10"
        :total="120"
        size="sm"
        show-total
        disabled
        aria-label="Страницы отчёта, недоступно"
      />
    </Specimen>
  </div>
</template>
