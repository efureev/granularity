<script setup lang="ts">
import { ref } from 'vue'

import DocSection from '../parts/DocSection.vue'
import { foundationSection, foundationValue } from '../tokens'

const families = foundationSection('Typography: font families')
const contentSizes = foundationSection('Typography: font sizes')
const controlSizes = foundationSection('Typography: control scale')
const weights = foundationSection('Typography: font weights')

function step(name: string, prefix: string): string {
  return name.replace(prefix, '')
}

/** Межстрочный той же ступени, если он объявлен. */
function contentLeading(name: string): string | undefined {
  const leading = `--gr-leading-${step(name, '--gr-text-')}`
  return foundationValue(leading) ? leading : undefined
}

function controlLeading(name: string): string | undefined {
  const leading = `--gr-control-leading-${step(name, '--gr-control-text-')}`
  return foundationValue(leading) ? leading : undefined
}

const controlUsers: Record<string, string> = {
  '3xs': 'подсказка xs',
  'xs': 'поле xs',
  'sm': 'поле sm',
  'md': 'поле md',
  'lg': 'поле lg',
}

const weightUse: Record<string, string> = {
  '--gr-font-regular': 'текст',
  '--gr-font-medium': 'подписи действий',
  '--gr-font-semibold': 'заголовки',
  '--gr-font-bold': 'акценты в цифрах',
}

const alignSize = ref<'sm' | 'md' | 'lg'>('md')
const alignOptions = [
  { value: 'sm', label: 'sm' },
  { value: 'md', label: 'md' },
  { value: 'lg', label: 'lg' },
]
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection title="Семейства" lead="Гротеск — весь интерфейс. Моноширинный — код, клавиши и цифры, которые выравниваются в столбик.">
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="family in families"
          :key="family.name"
          class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6"
        >
          <p class="text-[length:var(--gr-text-4xl)] leading-[1.15]" :style="{ fontFamily: `var(${family.name})` }">
            Аа Бб 0123
          </p>
          <p class="text-[length:var(--gr-text-base)] leading-[var(--gr-leading-lg)]" :style="{ fontFamily: `var(${family.name})` }">
            Съешь же ещё этих мягких французских булок, да выпей чаю.
          </p>
          <div class="flex flex-col gap-0.5">
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ family.name }}</code>
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ family.value }}</code>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Две шкалы, и смешивать их нельзя"
      lead="Контент — статьи, заголовки, описания. Контролы — поля, селекты, таблицы, ссылки рядом с ними: строка формы и таблица обязаны совпадать, а плотность контролов настраивается темой отдельно. Кегль всегда идёт парой с межстрочным той же ступени."
    >
      <div class="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]">
          <h3 class="border-b border-[var(--gr-brd)] px-5 py-3 text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Контент · <code class="font-[var(--gr-font-mono)] font-400">--gr-text-*</code>
          </h3>
          <ul>
            <li
              v-for="size in contentSizes"
              :key="size.name"
              class="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-4 border-b border-[var(--gr-brd)] px-5 py-3 last:border-b-0"
            >
              <span class="flex flex-col">
                <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ step(size.name, '--gr-text-') }}</code>
                <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
                  {{ size.value }}<template v-if="contentLeading(size.name)"> / {{ foundationValue(contentLeading(size.name)!) }}</template>
                </span>
              </span>
              <span
                class="truncate"
                :style="{ fontSize: `var(${size.name})`, lineHeight: contentLeading(size.name) ? `var(${contentLeading(size.name)})` : 1.2 }"
              >Отчёт за квартал готов</span>
            </li>
          </ul>
        </div>

        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]">
          <h3 class="border-b border-[var(--gr-brd)] px-5 py-3 text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Контролы · <code class="font-[var(--gr-font-mono)] font-400">--gr-control-text-*</code>
          </h3>
          <ul>
            <li
              v-for="size in controlSizes"
              :key="size.name"
              class="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--gr-brd)] px-5 py-3 last:border-b-0"
            >
              <span class="flex flex-col">
                <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ step(size.name, '--gr-control-text-') }}</code>
                <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
                  {{ size.value }}<template v-if="controlLeading(size.name)"> / {{ foundationValue(controlLeading(size.name)!) }}</template>
                </span>
              </span>
              <span class="flex items-center justify-between gap-3">
                <span
                  class="font-500"
                  :style="{ fontSize: `var(${size.name})`, lineHeight: controlLeading(size.name) ? `var(${controlLeading(size.name)})` : undefined }"
                >Сохранить отчёт</span>
                <span v-if="controlUsers[step(size.name, '--gr-control-text-')]" class="text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
                  {{ controlUsers[step(size.name, '--gr-control-text-')] }}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Одна ступень — одна высота"
      lead="Кнопка и поле одной ступени одной высоты — 28, 32, 40 и 44px, — поэтому в ряду формы они стоят вровень без подгонки."
    >
      <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6">
        <GrSegmented v-model="alignSize" size="sm" aria-label="Ступень ряда" :options="alignOptions" class="self-start" />
        <div class="flex flex-wrap items-center gap-2">
          <GrInput :size="alignSize" placeholder="Название отчёта" aria-label="Название отчёта" class="w-[260px]" />
          <GrButton :size="alignSize">
            Сохранить
          </GrButton>
          <GrButton :size="alignSize" variant="secondary" tone="neutral">
            Отмена
          </GrButton>
        </div>
      </div>
    </DocSection>

    <DocSection title="Начертания">
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li
          v-for="weight in weights"
          :key="weight.name"
          class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5"
        >
          <span class="text-[length:var(--gr-text-3xl)] leading-[var(--gr-leading-3xl)]" :style="{ fontWeight: `var(${weight.name})` }">Аа</span>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ weight.name }} · {{ weight.value }}</code>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ weightUse[weight.name] }}</span>
        </li>
      </ul>
    </DocSection>

    <DocSection title="Цифры в столбик" lead="Цифры, которые выравниваются по разрядам, — табличные.">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="mb-3 text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-success-text)]">
            Так — tabular-nums
          </p>
          <p class="text-end text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)] [font-variant-numeric:tabular-nums]">
            1 111,10 ₽<br>98 404,99 ₽<br>7 777,71 ₽
          </p>
        </div>
        <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="mb-3 text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-danger-text)]">
            Не так — пропорциональные
          </p>
          <p class="text-end text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)] [font-variant-numeric:proportional-nums]">
            1 111,10 ₽<br>98 404,99 ₽<br>7 777,71 ₽
          </p>
        </div>
      </div>
    </DocSection>
  </div>
</template>
