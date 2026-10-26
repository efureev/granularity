<script setup lang="ts">
import { ref, useId } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const numbers = new Intl.NumberFormat('ru-RU')

const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'] as const

const departments = [
  { name: 'Продажи', values: [1240, 1310, 1520, 1480, 1610, 1700] },
  { name: 'Маркетинг', values: [420, 380, 460, 440, 510, 530] },
  { name: 'Поддержка', values: [210, 205, 230, 225, 240, 250] },
]

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

const monthTotals = months.map((_, index) => sum(departments.map(department => department.values[index]!)))

const people = [
  { name: 'Анна Соколова', role: 'Финансы', city: 'Москва' },
  { name: 'Илья Орлов', role: 'Продажи', city: 'Казань' },
  { name: 'Мария Белова', role: 'Бухгалтерия', city: 'Москва' },
  { name: 'Олег Смирнов', role: 'Поддержка', city: 'Пермь' },
  { name: 'Вера Кузнецова', role: 'Маркетинг', city: 'Самара' },
]

const payments = Array.from({ length: 14 }, (_, index) => ({
  id: `П-${2140 - index}`,
  day: `${24 - index} окт`,
  sum: 4_800 + ((index * 3_710) % 21_000),
}))

const orders = [
  { id: 'order-42', title: 'Заказ 42', client: 'Студия «Лён»', sum: 48_000, lines: 'Фирменный стиль · вёрстка презентации' },
  { id: 'order-41', title: 'Заказ 41', client: 'ООО «Ромашка»', sum: 12_400, lines: 'Поддержка сайта за октябрь' },
  { id: 'order-40', title: 'Заказ 40', client: 'Иван Петров', sum: 7_900, lines: 'Консультация, 2 часа' },
]
const detailsId = useId()
const openOrder = ref<string | null>('order-42')

const headClass = 'whitespace-nowrap px-3 py-2 text-left font-500'
const cellClass = 'border-t border-[var(--gr-brd)] px-3 py-2'
const numberCellClass = 'border-t border-[var(--gr-brd)] px-3 py-2 text-right tabular-nums'
const previewCellClass = 'border-t border-[var(--gr-brd)] px-3 py-1.5'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTable size="sm" caption="Расходы отделов, тыс. ₽">
      <template #header>
        <tr>
          <th scope="col" class="whitespace-nowrap px-3 py-1.5 text-left font-500">
            Отдел
          </th>
          <th scope="col" class="px-3 py-1.5 text-right font-500">
            Май
          </th>
          <th scope="col" class="px-3 py-1.5 text-right font-500">
            Июн
          </th>
        </tr>
      </template>
      <tr v-for="department in departments.slice(0, 2)" :key="department.name">
        <th scope="row" class="whitespace-nowrap text-left font-400" :class="previewCellClass">
          {{ department.name }}
        </th>
        <td class="text-right tabular-nums" :class="previewCellClass">
          {{ numbers.format(department.values[4]!) }}
        </td>
        <td class="text-right tabular-nums" :class="previewCellClass">
          {{ numbers.format(department.values[5]!) }}
        </td>
      </tr>
    </GrTable>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Итог и закреплённая колонка" note="Плотная, числа справа и одной ширины; отдел остаётся на месте при прокрутке вбок." wide>
      <!-- Таблица шире образца намеренно: без прокрутки закреплённой колонке нечего держать. -->
      <GrTable
        size="sm"
        sticky-column
        hoverable
        :table-min-width="1200"
        caption="Расходы отделов по месяцам, тыс. ₽"
        region-label="Расходы отделов по месяцам"
      >
        <template #header>
          <tr>
            <th scope="col" :class="headClass">
              Отдел
            </th>
            <th v-for="month in months" :key="month" scope="col" class="px-3 py-2 text-right font-500">
              {{ month }}
            </th>
            <th scope="col" class="px-3 py-2 text-right font-500">
              Итого
            </th>
          </tr>
        </template>

        <tr v-for="department in departments" :key="department.name">
          <th scope="row" class="whitespace-nowrap text-left font-400" :class="cellClass">
            {{ department.name }}
          </th>
          <td v-for="(value, index) in department.values" :key="months[index]" :class="numberCellClass">
            {{ numbers.format(value) }}
          </td>
          <td class="whitespace-nowrap font-500" :class="numberCellClass">
            {{ numbers.format(sum(department.values)) }}
          </td>
        </tr>

        <template #footer>
          <tr>
            <th scope="row" class="text-left font-600" :class="cellClass">
              Итого
            </th>
            <td v-for="(total, index) in monthTotals" :key="months[index]" class="whitespace-nowrap font-600" :class="numberCellClass">
              {{ numbers.format(total) }}
            </td>
            <td class="whitespace-nowrap font-600" :class="numberCellClass">
              {{ numbers.format(sum(monthTotals)) }}
            </td>
          </tr>
        </template>
      </GrTable>
    </Specimen>

    <Specimen title="Полосы и подсветка" note="striped и hoverable вешаются на таблицу целиком — классы на строки писать не нужно." wide>
      <GrTable striped hoverable caption="Сотрудники отдела">
        <template #header>
          <tr>
            <th scope="col" :class="headClass">
              Сотрудник
            </th>
            <th scope="col" :class="headClass">
              Отдел
            </th>
            <th scope="col" :class="headClass">
              Город
            </th>
          </tr>
        </template>
        <tr v-for="person in people" :key="person.name">
          <td class="whitespace-nowrap" :class="cellClass">
            {{ person.name }}
          </td>
          <td :class="cellClass">
            {{ person.role }}
          </td>
          <td class="text-[var(--gr-muted-fg)]" :class="cellClass">
            {{ person.city }}
          </td>
        </tr>
      </GrTable>
    </Specimen>

    <Specimen title="Липкий заголовок" note="sticky-header и max-height: шапка остаётся видимой, пока строки едут под ней." wide>
      <GrTable size="sm" sticky-header :max-height="240" caption="Платежи за октябрь" region-label="Платежи за октябрь">
        <template #header>
          <tr>
            <th scope="col" :class="headClass">
              Платёж
            </th>
            <th scope="col" :class="headClass">
              Дата
            </th>
            <th scope="col" class="px-3 py-2 text-right font-500">
              Сумма, ₽
            </th>
          </tr>
        </template>
        <tr v-for="payment in payments" :key="payment.id">
          <td class="font-[var(--gr-font-mono)]" :class="cellClass">
            {{ payment.id }}
          </td>
          <td class="whitespace-nowrap text-[var(--gr-muted-fg)]" :class="cellClass">
            {{ payment.day }}
          </td>
          <td :class="numberCellClass">
            {{ numbers.format(payment.sum) }}
          </td>
        </tr>
      </GrTable>
    </Specimen>

    <Specimen title="Загрузка и пусто" note="Скелетоны вместо строк и служебная строка во всю ширину: column-count растягивает её colspan." wide>
      <div class="grid items-start gap-4 md:grid-cols-2">
        <GrTable loading :loading-rows="2" :column-count="3" size="sm" caption="Сотрудники, загрузка">
          <template #header>
            <tr>
              <th scope="col" :class="headClass">
                Сотрудник
              </th>
              <th scope="col" :class="headClass">
                Отдел
              </th>
              <th scope="col" :class="headClass">
                Город
              </th>
            </tr>
          </template>
        </GrTable>
        <GrTable :column-count="3" size="sm" caption="Сотрудники по фильтру">
          <template #header>
            <tr>
              <th scope="col" :class="headClass">
                Сотрудник
              </th>
              <th scope="col" :class="headClass">
                Отдел
              </th>
              <th scope="col" :class="headClass">
                Город
              </th>
            </tr>
          </template>
          <template #empty>
            Под фильтр «Екатеринбург» никто не подошёл.
          </template>
        </GrTable>
      </div>
    </Specimen>

    <Specimen title="Строка подробностей" note="data-gr-table-off-grid выводит строку из счёта полос и подсветки; связь с кнопкой — aria-expanded и aria-controls." wide>
      <GrTable striped hoverable row-groups caption="Заказы студии">
        <template #header>
          <tr>
            <th scope="col" :class="headClass">
              Заказ
            </th>
            <th scope="col" :class="headClass">
              Клиент
            </th>
            <th scope="col" class="px-3 py-2 text-right font-500">
              Сумма, ₽
            </th>
            <th scope="col" class="px-3 py-2 text-right font-500">
              <span class="sr-only">Подробности</span>
            </th>
          </tr>
        </template>
        <tbody v-for="order in orders" :key="order.id">
          <tr>
            <td class="whitespace-nowrap font-500" :class="cellClass">
              {{ order.title }}
            </td>
            <td class="whitespace-nowrap" :class="cellClass">
              {{ order.client }}
            </td>
            <td :class="numberCellClass">
              {{ numbers.format(order.sum) }}
            </td>
            <td class="text-right" :class="cellClass">
              <GrButton
                size="xs"
                variant="ghost"
                tone="neutral"
                :aria-expanded="openOrder === order.id"
                :aria-controls="openOrder === order.id ? `${detailsId}-${order.id}` : undefined"
                @click="openOrder = openOrder === order.id ? null : order.id"
              >
                {{ openOrder === order.id ? 'Свернуть' : 'Подробнее' }}
              </GrButton>
            </td>
          </tr>
          <tr v-if="openOrder === order.id" :id="`${detailsId}-${order.id}`" data-gr-table-off-grid>
            <td colspan="4" class="text-[var(--gr-muted-fg)]" :class="cellClass">
              {{ order.lines }}
            </td>
          </tr>
        </tbody>
      </GrTable>
    </Specimen>
  </div>
</template>
