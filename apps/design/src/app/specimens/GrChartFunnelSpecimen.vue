<script setup lang="ts">
import type { GrSegmentedOption, GrSegmentedValue } from '@feugene/granularity'
import type { GrChartFunnelStage } from '@feugene/granularity-charts'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'

const PREVIEW_STAGES: GrChartFunnelStage[] = [
  { label: 'Регистрация', value: 1000 },
  { label: 'Активация', value: 400 },
  { label: 'Триал', value: 210 },
  { label: 'Оплата', value: 120 },
]

const ONBOARDING: GrChartFunnelStage[] = [
  { label: 'Зарегистрировались', value: 4820 },
  { label: 'Подтвердили почту', value: 3910 },
  { label: 'Создали проект', value: 1640 },
  { label: 'Пригласили команду', value: 720 },
  { label: 'Оплатили', value: 214 },
]
const LABEL_MODES = ['value', 'share-first', 'share-prev', 'none'] as const
const LABEL_OPTIONS: GrSegmentedOption[] = [
  { value: 'value', label: 'Значение' },
  { value: 'share-first', label: 'От первой' },
  { value: 'share-prev', label: 'От предыдущей' },
  { value: 'none', label: 'Без чисел' },
]
const labelChoice = ref<GrSegmentedValue>('share-prev')
const labels = computed(() => LABEL_MODES.find(item => item === labelChoice.value) ?? 'value')
const labelHint = computed(() => {
  if (labelChoice.value === 'share-first')
    return 'Доля от первой ступени: какая часть всех пришедших добралась досюда.'
  if (labelChoice.value === 'share-prev')
    return 'Доля от предыдущей: конверсия каждого перехода. Самый дорогой шаг — создание проекта.'
  if (labelChoice.value === 'none')
    return 'Числа убраны, имена ступеней остаются: без них полосы не прочитать.'
  return 'Абсолютные величины: сколько человек дошло до каждой ступени.'
})

const SHAPES = ['trapezoid', 'bar'] as const
const SHAPE_OPTIONS: GrSegmentedOption[] = [
  { value: 'trapezoid', label: 'Лента' },
  { value: 'bar', label: 'Полосы' },
]
const shapeChoice = ref<GrSegmentedValue>('bar')
const shape = computed(() => SHAPES.find(item => item === shapeChoice.value) ?? 'trapezoid')

const HIRING: GrChartFunnelStage[] = [
  { label: 'Отклики', value: 640 },
  { label: 'Скрининг', value: 210 },
  { label: 'Интервью', value: 84 },
  { label: 'Тестовое', value: 37 },
  { label: 'Оффер', value: 12 },
]

const APPLICATIONS: GrChartFunnelStage[] = [
  { label: 'Открыли форму', value: 1200 },
  { label: 'Начали заполнять', value: 860 },
  { label: 'Отправили', value: 940 },
  { label: 'Прошли модерацию', value: 610 },
]

const PROMO: GrChartFunnelStage[] = [
  { label: 'Увидели баннер', value: 820 },
  { label: 'Применили промокод', value: 96 },
  { label: 'Оплатили со скидкой', value: 0 },
]

const STATE_OPTIONS: GrSegmentedOption[] = [
  { value: 'data', label: 'Данные' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Нет данных' },
]
const chartState = ref<GrSegmentedValue>('data')

const SHOP: GrChartFunnelStage[] = [
  { label: 'Визиты', value: 48_200 },
  { label: 'Карточка товара', value: 21_600 },
  { label: 'Корзина', value: 5380 },
  { label: 'Оформление', value: 2140 },
  { label: 'Оплата', value: 1398 },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrChartFunnel
      :stages="PREVIEW_STAGES"
      labels="share-prev"
      :height="108"
      aria-label="Конверсия от регистрации до оплаты за октябрь"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Подпись ступени" note="Две доли — два знаменателя, и в одной подписи их не смешивают. У ступени пишется одна, обе — в тултипе, таблице и объявлении.">
      <GrSegmented v-model="labelChoice" :options="LABEL_OPTIONS" size="sm" aria-label="Что писать у ступени" class="self-start" />
      <GrChartFunnel
        :stages="ONBOARDING"
        :labels="labels"
        :height="260"
        aria-label="Воронка онбординга за октябрь"
      />
      <p :class="mutedClass">
        {{ labelHint }}
      </p>
    </Specimen>

    <Specimen title="Лента и полосы" note="trapezoid сужается к следующей ступени, bar рисует прямоугольники. Числа, доли и таблица совпадают до знака — форма тут вопрос вкуса.">
      <GrSegmented v-model="shapeChoice" :options="SHAPE_OPTIONS" size="sm" aria-label="Форма ступеней" class="self-start" />
      <GrChartFunnel
        :stages="ONBOARDING"
        :shape="shape"
        labels="value"
        :height="260"
        aria-label="Воронка онбординга за октябрь"
      />
    </Specimen>

    <Specimen title="Горизонталь" note="Ступени идут слева направо, имена — строкой под ними. Узкая ступень — место главной потери, и её подпись встаёт рядом, а не пропадает." wide>
      <GrChartFunnel
        :stages="HIRING"
        orientation="horizontal"
        labels="share-first"
        :height="220"
        aria-label="Воронка найма на позицию фронтенд-разработчика"
      />
    </Specimen>

    <Specimen title="Ступень шире предыдущей" note="Рост не выпрямляется: ширина идёт за значением, а факт роста попадает в описание графика словами.">
      <GrChartFunnel
        :stages="APPLICATIONS"
        labels="value"
        :height="200"
        data-table="visible"
        aria-label="Заявки: форма и модерация"
      />
      <p :class="mutedClass">
        «Отправили» больше, чем «начали заполнять»: часть заявок пришла из сохранённых черновиков.
      </p>
    </Specimen>

    <Specimen title="Нулевая ступень" note="«Сюда не дошёл никто» — результат, а не пропуск: у ступени остаётся минимальная ширина и подпись «0» рядом.">
      <GrChartFunnel
        :stages="PROMO"
        labels="value"
        :height="160"
        aria-label="Промокод осенней акции"
        aria-description="Ни один заказ с промокодом не оплачен: скидка не применяется к товарам в корзине."
      />
    </Specimen>

    <Specimen title="Загрузка и нет данных" note="Скелет той же высоты; без ступеней — заглушка со своей подписью.">
      <GrSegmented v-model="chartState" :options="STATE_OPTIONS" size="sm" aria-label="Состояние воронки" class="self-start" />
      <GrChartFunnel
        :stages="chartState === 'empty' ? [] : ONBOARDING"
        :loading="chartState === 'loading'"
        labels="share-prev"
        :height="260"
        empty-text="За период регистраций нет"
        aria-label="Воронка онбординга за октябрь"
      />
    </Specimen>

    <Specimen title="В отчёте" note="Итоговая конверсия числом, воронка — где она теряется." wide>
      <GrCard title="Путь покупателя" description="Октябрь, все каналы" :heading-level="5" padding="md">
        <div class="flex flex-col gap-4">
          <GrStatistic title="Конверсия в оплату" :value="2.9" :precision="1" suffix="%" locale="ru-RU">
            <template #trend>
              <GrDelta :value="0.4" :precision="1" suffix="п. п." locale="ru-RU" show-arrow />
              <span>к сентябрю</span>
            </template>
          </GrStatistic>
          <GrChartFunnel
            :stages="SHOP"
            labels="share-prev"
            :height="240"
            aria-label="Путь покупателя за октябрь: от визита до оплаты"
            aria-description="Больше всего теряется переход из карточки товара в корзину."
          />
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
