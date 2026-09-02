<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrCarousel,
  GrCarouselSlide,
  GrFormField,
  GrRadioGroup,
  GrSelect,
  GrSwitch,
  type GrTone,
} from '@feugene/granularity'

import CodeBlock from '../../../components/doc/CodeBlock.vue'

type Indicators = 'dots' | 'thumbnails' | 'none'
type Activation = 'automatic' | 'manual'

const indicators = ref<Indicators>('dots')
const tone = ref<GrTone>('primary')
const arrows = ref(true)
const loop = ref(true)
const swipe = ref(true)
const autoplay = ref(false)
const landmark = ref(false)
const activationMode = ref<Activation>('automatic')

const indicatorOptions = [
  { value: 'dots', label: 'Точки' },
  { value: 'thumbnails', label: 'Миниатюры' },
  { value: 'none', label: 'Нет' },
] satisfies Array<{ value: Indicators, label: string }>

const toneOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
  { value: 'info', label: 'Info' },
  { value: 'slate', label: 'Slate' },
  { value: 'azure', label: 'Azure' },
] satisfies Array<{ value: GrTone, label: string }>

const activationOptions = [
  { value: 'automatic', label: 'automatic' },
  { value: 'manual', label: 'manual' },
] satisfies Array<{ value: Activation, label: string }>

const frames = [
  { id: 'a', title: 'Обзор', tone: 'var(--gr-primary)' },
  { id: 'b', title: 'Детали', tone: 'var(--gr-info)' },
  { id: 'c', title: 'Отзывы', tone: 'var(--gr-success)' },
  { id: 'd', title: 'Доставка', tone: 'var(--gr-warning)' },
]

const previewCode = computed(() => {
  const attrs = [
    'aria-label="Каталог"',
    `indicators="${indicators.value}"`,
    `tone="${tone.value}"`,
    arrows.value ? null : ':arrows="false"',
    loop.value ? null : ':loop="false"',
    swipe.value ? null : ':swipe="false"',
    autoplay.value ? 'autoplay' : null,
    landmark.value ? 'landmark' : null,
    activationMode.value === 'manual' ? 'activation-mode="manual"' : null,
  ].filter(Boolean)

  return `<GrCarousel\n  ${attrs.join('\n  ')}\n>\n  <GrCarouselSlide v-for="frame in frames" :key="frame.id" :label="frame.title">\n    …\n  </GrCarouselSlide>\n</GrCarousel>`
})

const summary = computed(() => {
  if (indicators.value === 'none')
    return 'Без переключателя кадр — `group`, а не `tabpanel`: привязать вкладку не к чему.'

  return activationMode.value === 'manual'
    ? 'В ручном режиме стрелка по переключателям двигает только фокус, кадр подтверждает Enter или Space.'
    : 'Стрелка по переключателям сразу листает ленту.'
})
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
    <div class="grid gap-4">
      <div class="rounded-[24px] border border-dashed border-[var(--preview-brd)] bg-[image:var(--preview-surface)] p-6">
        <GrCarousel
          aria-label="Каталог"
          :indicators="indicators"
          :tone="tone"
          :arrows="arrows"
          :loop="loop"
          :swipe="swipe"
          :autoplay="autoplay"
          :landmark="landmark"
          :activation-mode="activationMode"
        >
          <GrCarouselSlide
            v-for="frame in frames"
            :key="frame.id"
            :label="frame.title"
          >
            <div
              class="flex h-52 items-center justify-center rounded-[var(--gr-radius-md)] text-[length:var(--gr-text-lg)] leading-[var(--gr-leading-lg)] text-[var(--gr-primary-fg)] font-600"
              :style="{ background: frame.tone }"
            >
              {{ frame.title }}
            </div>

            <template #thumbnail>
              <div class="h-full w-full" :style="{ background: frame.tone }" />
            </template>
          </GrCarouselSlide>

          <template #prev>
            <span aria-hidden="true">‹</span>
          </template>
          <template #next>
            <span aria-hidden="true">›</span>
          </template>
        </GrCarousel>

        <p class="showcase-demo-text mt-4 text-sm">
          {{ summary }}
        </p>
      </div>

      <CodeBlock :code="previewCode" language="vue" expanded title="Rendered snippet" />
    </div>

    <div class="showcase-demo-panel grid gap-4 rounded-[28px] border p-4 lg:p-5">
      <div class="showcase-demo-title text-sm font-semibold">
        Properties
      </div>

      <div class="grid gap-4">
        <GrFormField label="Переключатель">
          <GrRadioGroup v-model="indicators" :options="indicatorOptions" variant="button" size="sm" />
        </GrFormField>

        <GrFormField label="Тон">
          <GrSelect v-model="tone" :options="toneOptions" aria-label="Тон" />
        </GrFormField>

        <GrFormField label="Активация переключателей">
          <GrRadioGroup v-model="activationMode" :options="activationOptions" variant="button" size="sm" />
        </GrFormField>

        <GrSwitch v-model="arrows">
          Стрелки
        </GrSwitch>
        <GrSwitch v-model="loop">
          Замкнутая лента
        </GrSwitch>
        <GrSwitch v-model="swipe">
          Свайп указателем
        </GrSwitch>
        <GrSwitch v-model="autoplay">
          Автопрокрутка
        </GrSwitch>
        <GrSwitch v-model="landmark">
          Ориентир страницы
        </GrSwitch>
      </div>
    </div>
  </div>
</template>
