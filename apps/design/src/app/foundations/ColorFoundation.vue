<script setup lang="ts">
import { grDerivedTokens } from '@feugene/granularity-tokens'
import { computed } from 'vue'

import ColorSwatch from '../parts/ColorSwatch.vue'
import DocSection from '../parts/DocSection.vue'
import ThemeIslands from '../parts/ThemeIslands.vue'
import { foundationSection, hasThemeToken, modeValue, themeSection } from '../tokens'
import { useViewedTheme } from '../viewedTheme'

const theme = useViewedTheme()
const surfaces = themeSection('Surface roles')
const states = themeSection('State roles')
const charts = themeSection('Data visualization roles')
const neutral = computed(() => foundationSection(theme.value, 'Foundations: neutral palette'))

const roleGroups = [
  {
    title: 'Поверхности',
    text: 'Фон страницы, карточки и всё приподнятое, выпадающие слои, приглушённые плашки, нейтральная заливка контролов.',
    names: ['--gr-bg', '--gr-card', '--gr-popover', '--gr-muted', '--gr-secondary', '--gr-overlay-bg'],
  },
  {
    title: 'Текст',
    text: 'Основной — на фоне и карточке. Вторичный держит AA даже на самом тёмном своём фоне, поэтому годится и в чипах, и в таблицах.',
    names: ['--gr-fg', '--gr-card-fg', '--gr-muted-fg', '--gr-secondary-fg'],
  },
  {
    title: 'Рамки и фокус',
    text: 'Разделители и рамки полей; рамка переключаемого контрола обязана читаться на 3:1; кольцо фокуса — только для фокуса.',
    names: ['--gr-brd', '--gr-input', '--gr-control-brd', '--gr-ring'],
  },
]

const surfaceDescriptions = new Map(surfaces.map(token => [token.name, token.description ?? '']))

const TONES = ['primary', 'success', 'warning', 'danger', 'info', 'slate', 'azure'] as const

const toneRows = TONES.map(tone => ({
  tone,
  base: `--gr-${tone}`,
  light: tone === 'primary' ? '--gr-accent' : `--gr-${tone}-light`,
  text: `--gr-${tone}-text`,
  solid: `--gr-${tone}-solid`,
  solidFg: `--gr-${tone}-solid-fg`,
})).filter(row => [row.base, row.light, row.text, row.solid, row.solidFg].every(hasThemeToken))

const derived = grDerivedTokens.filter(token => /^--gr-(?:primary|danger|success)-(?:hover|active)$/.test(token.name))
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection
      title="Роли, а не оттенки"
      lead="Цвет пишется через роль, никогда — через шкалу напрямую: роль перекрашивается темой, оттенок шкалы — нет. Имя токена совпадает с CSS-переменной пакета."
    >
      <div class="grid gap-4 lg:grid-cols-3">
        <div
          v-for="group in roleGroups"
          :key="group.title"
          class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
              {{ group.title }}
            </h3>
            <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ group.text }}
            </p>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="name in group.names" :key="name" :title="surfaceDescriptions.get(name)">
              <ColorSwatch :name="name" />
            </li>
          </ul>
        </div>
      </div>
    </DocSection>

    <DocSection
      title="Восемь тонов"
      lead="primary, neutral, success, warning, danger, info, slate, azure. Тон выбирают по смыслу: danger — только необратимое, neutral — второстепенное рядом с главным. У каждого тона один и тот же набор ролей; neutral набирается поверхностями."
    >
      <ThemeIslands>
        <div class="overflow-x-auto" tabindex="0" role="region" aria-label="Роли тонов">
          <table class="w-full min-w-[560px] border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
            <thead>
              <tr class="text-[var(--gr-muted-fg)]">
                <th scope="col" class="py-2 pe-3 text-start font-500">
                  тон
                </th>
                <th scope="col" class="px-2 py-2 text-start font-500">
                  метка
                </th>
                <th scope="col" class="px-2 py-2 text-start font-500">
                  подложка + текст
                </th>
                <th scope="col" class="px-2 py-2 text-start font-500">
                  заливка + подпись
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in toneRows" :key="row.tone" class="border-t border-[var(--gr-brd)]">
                <th scope="row" class="py-2.5 pe-3 text-start font-[var(--gr-font-mono)] font-500">
                  {{ row.tone }}
                </th>
                <td class="px-2 py-2.5">
                  <span class="block h-6 w-10 rounded-[var(--gr-radius-sm)]" :style="{ background: `var(${row.base})` }" />
                </td>
                <td class="px-2 py-2.5">
                  <span
                    class="inline-flex h-7 items-center rounded-[var(--gr-radius-control)] px-2.5 font-500"
                    :style="{ background: `var(${row.light})`, color: `var(${row.text})` }"
                  >Статус {{ row.tone }}</span>
                </td>
                <td class="px-2 py-2.5">
                  <span
                    class="inline-flex h-7 items-center rounded-[var(--gr-radius-control)] px-2.5 font-500"
                    :style="{ background: `var(${row.solid})`, color: `var(${row.solidFg})` }"
                  >Действие</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeIslands>
      <div class="grid gap-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] md:grid-cols-2">
        <p><code class="font-[var(--gr-font-mono)]">--gr-{tone}</code> — метка, рамка, график, но не текст: насыщенный success на белом даёт 2.3:1.</p>
        <p><code class="font-[var(--gr-font-mono)]">-light</code> + <code class="font-[var(--gr-font-mono)]">-text</code> — мягкая подложка и текст тона на ней; <code class="font-[var(--gr-font-mono)]">-solid</code> + <code class="font-[var(--gr-font-mono)]">-solid-fg</code> — насыщенная заливка под светлую подпись.</p>
      </div>
    </DocSection>

    <DocSection
      title="Состояния"
      lead="Недоступное гасится своими ролями, никогда не прозрачностью. Ошибка валидации — свои роли, а не danger: декоративный тон и вердикт формы — разные сообщения. Наведение и нажатие — тон с подмесом цвета текста темы."
    >
      <ThemeIslands v-slot="{ mode }">
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="token in states" :key="token.name">
            <ColorSwatch :name="token.name" />
          </li>
          <!-- Своё значение режима, если тема его задала, иначе формула -->
          <li v-for="token in derived" :key="token.name">
            <ColorSwatch :name="token.name" :value="modeValue(theme, mode.name, token.name) ?? token.formula" />
          </li>
        </ul>
      </ThemeIslands>
    </DocSection>

    <DocSection
      title="Тёмная тема — не инверсия"
      lead="Глобальные тоны в ней пастельные и несут тёмный -fg, а заливки кнопок остаются насыщенными со светлой подписью. Пару «текст на фоне» проверяют в обеих темах: -text и -light в тёмной свои."
    >
      <ThemeIslands>
        <div class="flex flex-wrap items-center gap-2">
          <GrButton>Сохранить</GrButton>
          <GrButton variant="secondary">
Дублировать
</GrButton>
          <GrButton variant="outline" tone="danger">
Удалить
</GrButton>
          <GrBadge tone="success">
Оплачено
</GrBadge>
          <GrBadge tone="warning">
Ждёт
</GrBadge>
        </div>
      </ThemeIslands>
    </DocSection>

    <DocSection title="Графики" lead="Серии берут цвета по порядку: первая серия — первый цвет.">
      <ThemeIslands>
        <div class="flex gap-2">
          <div v-for="token in charts" :key="token.name" class="flex flex-1 flex-col gap-1.5">
            <span class="h-12 rounded-[var(--gr-radius-md)]" :style="{ background: `var(${token.name})` }" />
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ token.name.replace('--gr-', '') }}</code>
          </div>
        </div>
      </ThemeIslands>
    </DocSection>

    <DocSection title="Нейтральная шкала" lead="Сырьё для ролей. В компонентах шкала напрямую не встречается.">
      <div class="flex overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)]">
        <div v-for="token in neutral" :key="token.name" class="flex min-w-0 flex-1 flex-col">
          <span class="h-16" :style="{ background: token.value }" />
          <span class="flex flex-col bg-[var(--gr-card)] px-1.5 py-2">
            <code class="truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]">{{ token.name.replace('--gr-slate-', '') }}</code>
            <code class="truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ token.value }}</code>
          </span>
        </div>
      </div>
    </DocSection>
  </div>
</template>
