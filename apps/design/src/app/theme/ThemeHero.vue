<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useTheme } from '@feugene/granularity'
import IconCheck from '~icons/lucide/check'

import CopyButton from '../parts/CopyButton.vue'
import { THEME_STORAGE_KEY } from '../theme'
import { type DesignTheme, THEME_BUILD_LABEL, themeOrigin, themeTargetList } from '../themes'
import ThemeSpecimen from './ThemeSpecimen.vue'

/**
 * Шапка страницы темы: слева — что это за тема и что с ней сделать, справа —
 * она сама на образце интерфейса; ниже — паспорт одним листом.
 */
const props = defineProps<{
  theme: DesignTheme
  /** Тема всего приложения сейчас — она. */
  applied: boolean
  applying: boolean
}>()

const emit = defineEmits<{ apply: [] }>()

const { mode: documentMode } = useTheme({ storageKey: THEME_STORAGE_KEY })

const entry = computed(() => props.theme.entry)
const origin = computed(() => themeOrigin(entry.value))
const targets = computed(() => themeTargetList(entry.value))
const modeTitles = computed(() => entry.value.modes.map(mode => mode.title ?? mode.name))
const configLine = computed(() => `{ theme: '${entry.value.id}', modes: [${entry.value.modes.map(mode => `'${mode.name}'`).join(', ')}] }`)

/** Режим образца — свой: светлый и тёмный сравниваются, не трогая страницу. Смена режима в шапке его догоняет. */
const specimenMode = ref(documentMode.value)
watch(documentMode, (next) => {
  specimenMode.value = next
})
const modeOptions = computed(() => props.theme.modes.map(mode => ({ value: mode.name, label: mode.title ?? mode.name })))
const specimenPair = computed(() => props.theme.modes.find(mode => mode.name === specimenMode.value)?.value)
</script>

<template>
  <header class="flex flex-col gap-8">
    <div class="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:gap-14">
      <div class="flex flex-col gap-5">
        <p class="hero-eyebrow">
          Тема <span aria-hidden="true">·</span> {{ THEME_BUILD_LABEL[theme.build] }}
        </p>
        <div class="flex flex-col gap-3">
          <!-- Высота строки — как у PageHeader: эталоны островов (`e2e/themes.spec.ts`) сняты при её дробном смещении, другая сдвигает их на долю пикселя. -->
          <h1 class="text-[length:var(--gr-text-4xl)] font-600 leading-[1.15] tracking-[-0.02em]">
            {{ entry.title }}
          </h1>
          <p v-if="entry.description" class="max-w-[54ch] text-[length:var(--gr-text-lg)] leading-[var(--gr-leading-lg)] text-[var(--gr-muted-fg)]">
            {{ entry.description }}
          </p>
        </div>
        <div v-if="theme.build !== 'absent' || entry.docs" class="flex flex-wrap items-center gap-3">
          <template v-if="theme.build !== 'absent'">
            <span v-if="applied" class="hero-applied">
              <GrIcon size="sm"><IconCheck /></GrIcon>
              Включена у всего приложения
            </span>
            <GrButton v-else :loading="applying" @click="emit('apply')">
              Применить ко всему приложению
            </GrButton>
          </template>
          <GrButton v-if="entry.docs" :href="entry.docs" external variant="secondary" tone="neutral">
            Сайт темы
          </GrButton>
        </div>
      </div>

      <figure class="hero-frame">
        <figcaption class="flex items-center justify-between gap-3 border-b border-[var(--gr-brd)] py-2 pe-2 ps-4">
          <span class="flex min-w-0 items-center gap-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Образец
            <code v-if="specimenPair" class="truncate font-[var(--gr-font-mono)]">{{ specimenPair }}</code>
          </span>
          <GrSegmented v-if="modeOptions.length > 1" v-model="specimenMode" size="sm" aria-label="Режим образца" :options="modeOptions" />
        </figcaption>
        <div inert>
          <GrConfigProvider v-if="theme.build !== 'absent'" :theme="entry.id" :mode="specimenMode">
            <ThemeSpecimen />
          </GrConfigProvider>
          <p v-else class="flex min-h-[220px] items-center justify-center p-5 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]">
            Темы нет в сборке — образца нет
          </p>
        </div>
      </figure>
    </div>

    <section class="passport" aria-label="Паспорт темы">
      <dl class="passport-grid">
        <div class="passport-cell">
          <dt class="passport-label">
            Происхождение
          </dt>
          <dd class="passport-value">
            {{ origin.title }}
          </dd>
          <dd class="passport-hint">
            {{ origin.hint }}
          </dd>
        </div>
        <div class="passport-cell">
          <dt class="passport-label">
            Версия
          </dt>
          <dd class="passport-value [font-variant-numeric:tabular-nums]">
            {{ entry.version ?? '—' }}
          </dd>
          <dd class="passport-hint">
            своя, не версия пакета
          </dd>
        </div>
        <div class="passport-cell">
          <dt class="passport-label">
            Режимы
          </dt>
          <dd class="passport-value">
            {{ modeTitles.join(' · ') }}
          </dd>
          <dd class="passport-hint">
            по умолчанию — {{ entry.modes.find(mode => mode.name === entry.defaultMode)?.title ?? entry.defaultMode }}
          </dd>
        </div>
        <div class="passport-cell">
          <dt class="passport-label">
            Написана под
          </dt>
          <dd v-if="targets.length > 0" class="flex flex-col gap-1">
            <span v-for="target in targets" :key="target.packageId" class="flex items-baseline justify-between gap-3 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
              <code class="truncate font-[var(--gr-font-mono)] text-[var(--gr-fg)]">{{ target.packageId }}</code>
              <code class="shrink-0 font-[var(--gr-font-mono)] text-[var(--gr-muted-fg)]">{{ target.range }}</code>
            </span>
          </dd>
          <dd v-else class="passport-value">
            —
          </dd>
        </div>
      </dl>
      <div class="passport-connect flex flex-wrap items-center gap-x-4 gap-y-2 py-2 pe-2 ps-5">
        <span class="passport-label">Подключение</span>
        <code class="min-w-0 flex-1 truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">themes: [{{ configLine }}]</code>
        <CopyButton :text="configLine" label="Скопировать запись темы для granum.config.ts" />
      </div>
    </section>
  </header>
</template>

<style scoped>
.hero-eyebrow {
  color: var(--gr-muted-fg);
  font-size: var(--gr-text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: var(--gr-leading-xs);
  text-transform: uppercase;
}

.hero-applied {
  display: inline-flex;
  align-items: center;
  gap: var(--gr-space-2);
  min-height: 40px;
  padding-inline: var(--gr-space-4);
  border: 1px solid color-mix(in srgb, var(--gr-success) 35%, transparent);
  border-radius: var(--gr-radius-control);
  background: var(--gr-success-light);
  color: var(--gr-success-text);
  font-size: var(--gr-text-sm);
  font-weight: 500;
  line-height: var(--gr-leading-sm);
}

.hero-frame {
  overflow: hidden;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
  box-shadow: var(--gr-shadow-2);
}

.passport {
  overflow: hidden;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-lg);
  background: var(--gr-card);
}

.passport-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .passport-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .passport-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1.5fr);
  }
}

.passport-cell {
  display: flex;
  flex-direction: column;
  gap: var(--gr-space-1);
  padding: var(--gr-space-4) var(--gr-space-5);
  border-block-end: 1px solid var(--gr-brd);
}

@media (min-width: 1024px) {
  .passport-cell {
    border-block-end: 0;
  }

  .passport-cell + .passport-cell {
    border-inline-start: 1px solid var(--gr-brd);
  }
}

/* Ниже `lg` ячейки отделены снизу сами — у строки подключения своя линия только в одну строку паспорта. */
@media (min-width: 1024px) {
  .passport-connect {
    border-block-start: 1px solid var(--gr-brd);
  }
}

.passport-label {
  color: var(--gr-muted-fg);
  font-size: var(--gr-text-2xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: var(--gr-leading-2xs);
  text-transform: uppercase;
}

.passport-value {
  font-size: var(--gr-text-sm);
  font-weight: 600;
  line-height: var(--gr-leading-sm);
}

.passport-hint {
  color: var(--gr-muted-fg);
  font-size: var(--gr-text-xs);
  line-height: var(--gr-leading-xs);
}
</style>
