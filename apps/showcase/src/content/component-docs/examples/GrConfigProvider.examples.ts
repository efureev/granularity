import type { ShowcaseComponentExampleDoc } from '../types'

export const grConfigProviderExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'config-provider-size',
    title: 'Default size for nested controls',
    description: '`GrConfigProvider` задаёт дефолтный `size` для всех вложенных контролов, которые его поддерживают (сейчас — `GrButton` и `GrInput`). У самих контролов проп `size` не указан — он приходит из провайдера. Локальный `size` на компоненте всегда побеждает.',
    status: 'ready',
    previewKey: 'gr-config-provider-size',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider, GrInput, type GrComponentSize } from '@feugene/granularity'

const size = ref<GrComponentSize>('md')
const value = ref('Config-driven size')

const sizes: GrComponentSize[] = ['xs', 'sm', 'md', 'lg']
</script>

<template>
  <div class="grid gap-4">
    <!-- Переключатель размера — сами кнопки вне провайдера (фиксированный sm). -->
    <div class="flex gap-2">
      <GrButton
        v-for="s in sizes"
        :key="s"
        size="sm"
        :variant="size === s ? 'primary' : 'outline'"
        @click="size = s"
      >
        {{ s }}
      </GrButton>
    </div>

    <!-- Ни у одного контрола ниже нет пропа \`size\` — он приходит из провайдера. -->
    <GrConfigProvider :size="size">
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrInput v-model="value" class="max-w-[16rem]" />
        <GrButton>Save</GrButton>
        <GrButton variant="outline">Cancel</GrButton>
      </div>
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Активный размер: <code>{{ size }}</code>. Проп <code>size</code> на контролах не задан.
    </p>
  </div>
</template>`,
    note: 'Провайдер рендерится прозрачно (`display: contents`) и не влияет на layout. Поддержку конфига компонент включает через `useGrComponentSize()` / `useGrConfig()`.',
  },
  {
    id: 'config-provider-nested',
    title: 'Nested providers merge',
    description: 'Провайдеры можно вкладывать: дочерний мержится поверх родительского. Здесь внешний задаёт `size="lg"`, а внутренний переопределяет его на `sm` только для своего поддерева — остальные значения (`zIndexBase`, `componentDefaults`, i18n) наследуются.',
    status: 'ready',
    previewKey: 'gr-config-provider-nested',
    code: `<script setup lang="ts">
import { GrButton, GrConfigProvider, GrInput } from '@feugene/granularity'
</script>

<template>
  <!-- Внешний провайдер: size = lg. -->
  <GrConfigProvider size="lg">
    <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Outer provider — <code>size="lg"</code>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <GrInput model-value="Large" class="max-w-[14rem]" aria-label="Large input" />
        <GrButton>Large</GrButton>
      </div>

      <!-- Вложенный провайдер переопределяет только size; остальное наследуется. -->
      <GrConfigProvider size="sm">
        <div class="grid gap-3 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3">
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Inner provider — <code>size="sm"</code>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <GrInput model-value="Small" class="max-w-[14rem]" aria-label="Small input" />
            <GrButton>Small</GrButton>
          </div>
        </div>
      </GrConfigProvider>
    </div>
  </GrConfigProvider>
</template>`,
  },
  {
    id: 'config-provider-read',
    title: 'Read the config in your own component',
    description: 'Любой компонент читает конфиг ближайшего провайдера через `useGrConfig()` — так подключаются собственные контролы. Провайдер отдаёт `size`, `zIndexBase` и `componentDefaults` (per-component дефолтные пропсы); вне провайдера всё разрешается в fallback-значения.',
    status: 'ready',
    previewKey: 'gr-config-provider-read',
    code: `<!-- ConfigReader.vue -->
<script setup lang="ts">
import { GrBadge, useGrConfig } from '@feugene/granularity'

// Любой компонент может прочитать конфиг ближайшего GrConfigProvider.
const config = useGrConfig()
</script>

<template>
  <div class="grid gap-2 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3 text-sm">
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">size</span>
      <GrBadge tone="info">{{ config.size.value ?? '—' }}</GrBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">zIndexBase</span>
      <GrBadge tone="slate">{{ config.zIndexBase.value ?? '—' }}</GrBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">GrButton default variant</span>
      <GrBadge tone="success">{{ config.componentDefaults.value.GrButton?.variant ?? '—' }}</GrBadge>
    </div>
  </div>
</template>

<!-- Demo.vue -->
<script setup lang="ts">
import { GrConfigProvider } from '@feugene/granularity'

import ConfigReader from './ConfigReader.vue'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Inside a provider
      </div>
      <GrConfigProvider
        size="lg"
        :z-index-base="2000"
        :component-defaults="{ GrButton: { variant: 'secondary' } }"
      >
        <ConfigReader />
      </GrConfigProvider>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        No provider (fallbacks)
      </div>
      <ConfigReader />
    </div>
  </div>
</template>`,
    note: 'Провайдер также принимает проп `i18n` — адаптер переводов прокидывается вложенным компонентам через общий inject-ключ (иначе приложение инжектит его вручную).',
  },
]
