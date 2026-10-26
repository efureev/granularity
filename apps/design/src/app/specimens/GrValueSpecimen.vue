<script setup lang="ts">
import IconTrendingUp from '~icons/lucide/trending-up'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const money = new Intl.NumberFormat('ru-RU')
const cents = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const metrics: readonly { label: string, value: string, prefix?: string, suffix?: string }[] = [
  { label: 'Время ответа API', value: '320', suffix: 'мс' },
  { label: 'Занято в хранилище', value: '2,4', prefix: '≈', suffix: 'ГБ' },
  { label: 'Длительность звонка', value: '2 ч 15 мин' },
]

const labelClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
const figureClass = 'text-[length:var(--gr-text-2xl)] font-500 leading-[var(--gr-leading-tight)] tabular-nums'
// Рубль стоит справа, но принадлежит сумме: приглушение суффикса снимается его же токенами.
const currencyRightClass = '[--gr-value-suffix-color:currentColor] [--gr-value-suffix-size:1em]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <dl class="flex flex-wrap gap-x-6 gap-y-2">
      <div class="flex flex-col gap-1">
        <dt :class="labelClass">
          Время ответа
        </dt>
        <dd :class="figureClass">
          <GrValue value="320" suffix="мс" />
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt :class="labelClass">
          К оплате
        </dt>
        <dd :class="figureClass">
          <GrValue :value="money.format(48000)" suffix="₽" :class="currencyRightClass" />
        </dd>
      </div>
    </dl>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Значение и единица" note="Единица приглушена и мельче; величина приходит готовой, «2 ч 15 мин» — тоже величина.">
      <dl class="grid grid-cols-2 gap-x-6 gap-y-5">
        <div v-for="metric in metrics" :key="metric.label" class="flex flex-col gap-1">
          <dt :class="labelClass">
            {{ metric.label }}
          </dt>
          <dd :class="figureClass">
            <GrValue :value="metric.value" :prefix="metric.prefix" :suffix="metric.suffix" />
          </dd>
        </div>
        <div class="flex flex-col gap-1">
          <dt :class="labelClass">
            К оплате
          </dt>
          <dd :class="figureClass">
            <GrValue :value="money.format(48000)" suffix="₽" :class="currencyRightClass" />
          </dd>
        </div>
      </dl>
    </Specimen>

    <Specimen title="Приписки по умолчанию" note="Слева — как число: валюта часть суммы. Справа — приглушённо и с отбивкой: единица величине не принадлежит.">
      <div class="flex flex-wrap items-baseline gap-x-10 gap-y-3" :class="figureClass">
        <GrValue :value="cents.format(14.99)" prefix="$" />
        <GrValue value="42" suffix="%" />
        <GrValue :value="money.format(48000)" suffix="₽" />
      </div>
    </Specimen>

    <Specimen title="Валюта справа" note="Дефолт суффикса рублю не подходит: --gr-value-suffix-color: currentColor и --gr-value-suffix-size: 1em.">
      <dl class="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3">
        <dt :class="labelClass">
          по умолчанию
        </dt>
        <dd :class="figureClass">
          <GrValue :value="money.format(1_284_500)" suffix="₽" />
        </dd>
        <dt :class="labelClass">
          токенами
        </dt>
        <dd :class="figureClass">
          <GrValue :value="money.format(1_284_500)" suffix="₽" :class="currencyRightClass" />
        </dd>
      </dl>
    </Specimen>

    <Specimen title="Тон и кегль от места" note="Своей шкалы и тона нет: запись берёт цвет и кегль родителя, и отрицательная сумма краснеет вместе со знаком валюты.">
      <div class="flex flex-col gap-3">
        <p class="text-[length:var(--gr-text-3xl)] font-600 leading-[var(--gr-leading-3xl)] text-[var(--gr-danger-text)]">
          <GrValue :value="cents.format(1240.5)" prefix="$">
            <template #lead>
              <span>−</span>
            </template>
          </GrValue>
        </p>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          Средний чек — <GrValue :value="cents.format(14.99)" prefix="$" /> за заказ.
        </p>
      </div>
    </Specimen>

    <Specimen title="Свои узлы между частями" note="#lead — перед префиксом (знак, стрелка), #trail — между числом и суффиксом.">
      <p :class="figureClass">
        <GrValue :value="money.format(1284)" suffix="заказа">
          <template #lead>
            <GrIcon class="me-1 text-[var(--gr-success-text)]" aria-hidden="true">
              <IconTrendingUp />
            </GrIcon>
          </template>
          <template #trail>
            <sup class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">*</sup>
          </template>
        </GrValue>
      </p>
      <p :class="labelClass">
        * без отменённых в день оформления
      </p>
    </Specimen>
  </div>
</template>
