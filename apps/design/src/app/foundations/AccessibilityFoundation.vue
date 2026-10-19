<script setup lang="ts">
import { ref } from 'vue'

import IconCheck from '~icons/lucide/check'
import IconX from '~icons/lucide/x'

import DocSection from '../parts/DocSection.vue'
import { contrastRatio, type ModeName, resolveColor, THEMES } from '../tokens'

interface Pair {
  label: string
  fg: string
  bg: string
  /** Порог: 4.5 — текст, 3 — графика и кольцо фокуса. */
  min: number
}

const TONES = ['success', 'warning', 'danger', 'info', 'slate', 'azure']

const pairs: Pair[] = [
  { label: 'Текст на фоне', fg: '--gr-fg', bg: '--gr-bg', min: 4.5 },
  { label: 'Текст на карточке', fg: '--gr-fg', bg: '--gr-card', min: 4.5 },
  { label: 'Вторичный на фоне', fg: '--gr-muted-fg', bg: '--gr-bg', min: 4.5 },
  { label: 'Вторичный на заливке контрола', fg: '--gr-muted-fg', bg: '--gr-secondary', min: 4.5 },
  { label: 'Рамка контрола', fg: '--gr-control-brd', bg: '--gr-bg', min: 3 },
  { label: 'Кольцо фокуса', fg: '--gr-ring', bg: '--gr-bg', min: 3 },
  { label: 'primary: текст на подложке', fg: '--gr-accent-fg', bg: '--gr-accent', min: 4.5 },
  ...TONES.map(tone => ({ label: `${tone}: текст на подложке`, fg: `--gr-${tone}-text`, bg: `--gr-${tone}-light`, min: 4.5 })),
  ...['primary', ...TONES].map(tone => ({ label: `${tone}: подпись на заливке`, fg: `--gr-${tone}-solid-fg`, bg: `--gr-${tone}-solid`, min: 4.5 })),
]

function ratio(pair: Pair, theme: ModeName): number | undefined {
  const fg = resolveColor(pair.fg, theme)
  const bg = resolveColor(pair.bg, theme)
  return fg && bg ? contrastRatio(fg, bg) : undefined
}

const loading = ref(false)
const onlyMine = ref(false)

function save(): void {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1800)
}
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection
      title="Фокус виден с клавиатуры"
      lead="Контур 2px с отступом 2px цветом кольца — только при навигации с клавиатуры, мышь его не вызывает. Контур переживает режим высокой контрастности Windows, а тень — нет."
    >
      <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6">
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Нажмите Tab, чтобы пройти по ряду.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <GrInput placeholder="Поиск" aria-label="Поиск" class="w-[220px]" />
          <GrButton>Найти</GrButton>
          <GrButton variant="secondary" tone="neutral">
            Сбросить
          </GrButton>
          <GrSwitch v-model="onlyMine" aria-label="Только мои" />
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Загрузка — не недоступность"
      lead="Ждущая сервер кнопка остаётся в фокусе, объявляет aria-busy и меняет курсор на progress. Отключённая выпадает из таб-порядка — фокус с неё упал бы в тело документа."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <GrButton class="self-start" :loading="loading" loading-text="Сохраняем отчёт" @click="save">
            Сохранить отчёт
          </GrButton>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            loading: фокус остаётся, повторный клик гасится, скринридер слышит «Сохраняем отчёт».
          </p>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <GrButton class="self-start" disabled>
            Сохранить отчёт
          </GrButton>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            disabled: нативный атрибут, кнопки нет в таб-порядке. Цвета — свои роли, без прозрачности.
          </p>
        </div>
      </div>
    </DocSection>

    <DocSection title="Цвет — не единственный носитель смысла" lead="У статуса есть слово или значок: различие красного и зелёного видят не все.">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="flex items-center gap-1.5 text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-success-text)]">
            <GrIcon size="xs">
<IconCheck />
</GrIcon> Так
          </p>
          <div class="flex flex-wrap gap-2">
            <GrBadge tone="success">
              <template #icon>
<IconCheck />
</template>
              Оплачено
            </GrBadge>
            <GrBadge tone="danger">
              <template #icon>
<IconX />
</template>
              Просрочено
            </GrBadge>
          </div>
        </div>
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
          <p class="flex items-center gap-1.5 text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-danger-text)]">
            <GrIcon size="xs">
<IconX />
</GrIcon> Не так
          </p>
          <div class="flex flex-wrap items-center gap-3" aria-label="Пример без подписей">
            <span class="h-3 w-3 rounded-full bg-[var(--gr-success)]" />
            <span class="h-3 w-3 rounded-full bg-[var(--gr-danger)]" />
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">две точки, смысл — только в цвете</span>
          </div>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Цель касания — 44px"
      lead="На тач-экране кнопка ниже 44px добирает зону касания невидимо: вид и плотность ряда прежние, а промахов пальцем нет."
    >
      <div class="flex flex-wrap items-center gap-10 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6">
        <span class="relative inline-flex">
          <span class="absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 rounded-[var(--gr-radius-control)] border border-dashed border-[var(--gr-primary)] bg-[color-mix(in_srgb,var(--gr-primary)_8%,transparent)]" aria-hidden="true" />
          <GrButton size="xs" variant="secondary" tone="neutral">
            Изменить
          </GrButton>
        </span>
        <p class="max-w-[52ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
          Кнопка xs — 28px. Пунктир — область, которая принимает касание на грубом указателе (pointer: coarse).
        </p>
      </div>
    </DocSection>

    <DocSection title="Контраст ролей" lead="Посчитано по значениям токенов пакета для обеих тем. Пары, где значение задано формулой, считаются в тестах темы и здесь пропущены.">
      <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" aria-label="Контраст ролей">
        <table class="w-full min-w-[640px] border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
          <thead>
            <tr class="text-[var(--gr-muted-fg)]">
              <th scope="col" class="px-4 py-3 text-start font-500">
                Пара
              </th>
              <th scope="col" class="px-4 py-3 text-start font-500">
                Порог
              </th>
              <th v-for="theme in THEMES" :key="theme.id" scope="col" class="px-4 py-3 text-start font-500">
                {{ theme.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pair in pairs" :key="pair.label" class="border-t border-[var(--gr-brd)]">
              <th scope="row" class="px-4 py-2.5 text-start font-400">
                <span class="block">{{ pair.label }}</span>
                <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ pair.fg }} / {{ pair.bg }}</code>
              </th>
              <td class="px-4 py-2.5 font-[var(--gr-font-mono)] [font-variant-numeric:tabular-nums]">
                {{ pair.min }}:1
              </td>
              <td v-for="theme in THEMES" :key="theme.id" class="px-4 py-2.5">
                <template v-if="ratio(pair, theme.id) !== undefined">
                  <span class="inline-flex items-center gap-2">
                    <span
                      class="inline-flex h-6 w-9 items-center justify-center rounded-[var(--gr-radius-sm)] text-[length:var(--gr-text-2xs)] font-600 leading-none"
                      :style="{ background: resolveColor(pair.bg, theme.id), color: resolveColor(pair.fg, theme.id) }"
                      aria-hidden="true"
                    >Aa</span>
                    <span class="font-[var(--gr-font-mono)] [font-variant-numeric:tabular-nums]">{{ ratio(pair, theme.id)!.toFixed(2) }}</span>
                    <GrBadge :tone="ratio(pair, theme.id)! >= pair.min ? 'success' : 'danger'" size="xs">
                      {{ ratio(pair, theme.id)! >= pair.min ? 'проходит' : 'ниже порога' }}
                    </GrBadge>
                  </span>
                </template>
                <span v-else class="text-[var(--gr-muted-fg)]">формула</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>
  </div>
</template>
