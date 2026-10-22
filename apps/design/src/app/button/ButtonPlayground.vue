<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

import { useTheme } from '@feugene/granularity'
import type { GrButtonLoadingIndicator } from '@feugene/granularity/components/GrButton'
import themeManifest from 'virtual:granum/themes'
import IconPlus from '~icons/lucide/plus'
import IconRotateCcw from '~icons/lucide/rotate-ccw'

import { componentDefaultsOf } from '../componentTokens'
import CodeBlock from '../parts/CodeBlock.vue'
import { THEME_STORAGE_KEY } from '../theme'
import { themeModes } from '../themes'
import { useViewedTheme } from '../viewedTheme'
import { buttonSnippet, COMPONENT_LOADING_INDICATOR, initialPlayground, loadingIndicators, sizes, tones, variants } from './model'

const theme = useViewedTheme()
const { mode: documentMode } = useTheme({ storageKey: THEME_STORAGE_KEY })

const state = reactive(initialPlayground())
const snippet = computed(() => buttonSnippet(state))

const modes = computed(() => themeModes(themeManifest, theme.value.id))
const modeOptions = computed(() => modes.value.map(mode => ({ value: mode.name, label: mode.title ?? mode.name })))

/** Режим превью — свой: светлый и тёмный сравниваются, не трогая страницу. Смена режима в шапке его догоняет. */
const stageMode = ref(documentMode.value)
watch(documentMode, (next) => {
  stageMode.value = next
})
const stagePair = computed(() => modes.value.find(mode => mode.name === stageMode.value)?.value)

const themeIndicator = computed(() => componentDefaultsOf(theme.value.data, 'GrButton').loadingIndicator as GrButtonLoadingIndicator | undefined)
const effectiveIndicator = computed(() => (state.indicator === 'theme' ? themeIndicator.value ?? COMPONENT_LOADING_INDICATOR : state.indicator))
const indicatorNote = computed(() => loadingIndicators.find(item => item.id === effectiveIndicator.value)!.note)
const indicatorTitle = (id: GrButtonLoadingIndicator): string => loadingIndicators.find(item => item.id === id)!.title
const indicatorOptions = computed(() => [
  { value: 'theme', label: `как в теме — ${indicatorTitle(themeIndicator.value ?? COMPONENT_LOADING_INDICATOR)}` },
  ...loadingIndicators.map(item => ({ value: item.id, label: item.title })),
])

const variantOptions = variants.map(item => ({ value: item.id, label: item.id }))
const toneOptions = tones.map(item => ({ value: item.id, label: item.id }))
const sizeOptions = sizes.map(size => ({ value: size, label: size }))
const iconOptions = [
  { value: 'none', label: 'нет' },
  { value: 'prefix', label: 'слева' },
  { value: 'suffix', label: 'справа' },
  { value: 'only', label: 'только' },
]

const labelMissing = computed(() => state.label.trim() === '')

/** Нажатие в превью — действие на 1.8 с: загрузку видно на настоящей кнопке. */
let busy: ReturnType<typeof setTimeout> | undefined
function act(): void {
  state.loading = true
  clearTimeout(busy)
  busy = setTimeout(() => {
    state.loading = false
  }, 1800)
}
onBeforeUnmount(() => clearTimeout(busy))

function reset(): void {
  clearTimeout(busy)
  Object.assign(state, initialPlayground())
}
</script>

<template>
  <section class="overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] shadow-[var(--gr-shadow-1)]" aria-labelledby="playground-title">
    <div class="grid lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="flex min-w-0 flex-col">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--gr-brd)] px-4 py-2.5">
          <div class="flex min-w-0 flex-col">
            <h2 id="playground-title" class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
              Песочница
            </h2>
            <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              Настоящая кнопка в теме «{{ theme.data.title }}»
              <code v-if="stagePair" class="ms-1 font-[var(--gr-font-mono)]">{{ stagePair }}</code>
            </p>
          </div>
          <GrSegmented v-model="stageMode" size="sm" aria-label="Режим превью" :options="modeOptions" />
        </div>

        <GrConfigProvider :theme="theme.id" :mode="stageMode" class="flex flex-1">
          <div class="playground-stage">
            <div :class="state.block ? 'w-full max-w-[360px]' : ''">
              <GrButton
                :variant="state.variant"
                :tone="state.tone"
                :size="state.size"
                :square="state.icon === 'only'"
                :aria-label="state.icon === 'only' ? state.label : undefined"
                :block="state.block"
                :disabled="state.disabled"
                :loading="state.loading"
                :loading-indicator="state.indicator === 'theme' ? undefined : state.indicator"
                @click="act"
              >
                <template v-if="state.icon === 'prefix'" #prefix>
                  <GrIcon><IconPlus /></GrIcon>
                </template>
                <GrIcon v-if="state.icon === 'only'">
                  <IconPlus />
                </GrIcon>
                <template v-else>
                  {{ state.label }}
                </template>
                <template v-if="state.icon === 'suffix'" #suffix>
                  <GrIcon><IconPlus /></GrIcon>
                </template>
              </GrButton>
            </div>
          </div>
        </GrConfigProvider>

        <div class="border-t border-[var(--gr-brd)] p-3">
          <CodeBlock :code="snippet" caption="Шаблон" />
        </div>
      </div>

      <form class="flex flex-col gap-4 border-t border-[var(--gr-brd)] p-4 lg:border-s lg:border-t-0" aria-label="Пропсы кнопки" @submit.prevent>
        <GrFormField label="Подпись" size="sm" :error="labelMissing ? 'Нужна и квадратной кнопке: она станет её именем' : undefined">
          <GrInput v-model="state.label" size="sm" :invalid="labelMissing" />
        </GrFormField>
        <div class="grid grid-cols-2 gap-3">
          <GrFormField label="Вес" size="sm">
            <GrSelect v-model="state.variant" size="sm" :options="variantOptions" />
          </GrFormField>
          <GrFormField label="Тон" size="sm">
            <GrSelect v-model="state.tone" size="sm" :options="toneOptions" />
          </GrFormField>
        </div>
        <GrFormField label="Ступень" size="sm">
          <GrSegmented v-model="state.size" size="sm" block aria-label="Ступень" :options="sizeOptions" />
        </GrFormField>
        <GrFormField label="Иконка" size="sm">
          <GrSegmented v-model="state.icon" size="sm" block aria-label="Иконка" :options="iconOptions" />
        </GrFormField>
        <div class="flex flex-col gap-1.5">
          <GrFormField label="Вид загрузки" size="sm">
            <GrSelect v-model="state.indicator" size="sm" :options="indicatorOptions" />
          </GrFormField>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ indicatorNote }}
          </p>
        </div>
        <div class="flex flex-col gap-2.5 border-t border-[var(--gr-brd)] pt-4">
          <GrSwitch v-model="state.loading" size="sm">
            Загрузка
          </GrSwitch>
          <GrSwitch v-model="state.disabled" size="sm">
            Недоступна
          </GrSwitch>
          <GrSwitch v-model="state.block" size="sm">
            Во всю ширину
          </GrSwitch>
        </div>
        <GrButton class="mt-auto self-start" variant="ghost" tone="neutral" size="sm" @click="reset">
          <template #prefix>
            <GrIcon><IconRotateCcw /></GrIcon>
          </template>
          Сбросить
        </GrButton>
      </form>
    </div>
  </section>
</template>

<style scoped>
.playground-stage {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: var(--gr-space-8);
  background-color: var(--gr-bg);
  background-image: radial-gradient(color-mix(in srgb, var(--gr-fg) 14%, transparent) 1px, transparent 1px);
  background-size: 16px 16px;
  color: var(--gr-fg);
}
</style>
