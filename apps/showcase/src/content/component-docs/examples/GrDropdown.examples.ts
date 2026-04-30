import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-basic-menu',
    title: 'Basic actions menu',
    description: 'Стартовый сценарий для `GrDropdown`: trigger/content slots, короткий action list и автоматическое закрытие по клику.',
    status: 'ready',
    previewKey: 'ds-dropdown-basic-menu',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'

const lastAction = ref('No action yet')

function select(action: string) {
  lastAction.value = action
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdown>
      <template #trigger="{ open }">
        <GrButton variant="outline">
          {{ open ? 'Close menu' : 'Open menu' }}
        </GrButton>
      </template>

      <template #content>
        <div class="grid gap-1">
          <button type="button" class="rounded-xl px-3 py-2 text-left hover:bg-[var(--accent)]" @click="select('Preview')">Preview</button>
          <button type="button" class="rounded-xl px-3 py-2 text-left hover:bg-[var(--accent)]" @click="select('Duplicate')">Duplicate</button>
          <button type="button" class="rounded-xl px-3 py-2 text-left hover:bg-[var(--accent)]" @click="select('Archive')">Archive</button>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ lastAction }}
    </GrBadge>
  </div>
</template>`,
  },
  {
    id: 'dropdown-alignment-width',
    title: 'Alignment and width presets',
    description: 'Отдельно сравниваем `align` и `width`, чтобы быстро проверить positioning и ожидаемую ширину выпадающего контента.',
    status: 'ready',
    previewKey: 'ds-dropdown-alignment-width',
    code: `<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <GrDropdown align="left" width="48">
      <template #trigger>
        <GrButton variant="outline">Left</GrButton>
      </template>

      <template #content>
        <div class="grid gap-2 px-3 py-2 text-sm">
          <div class="font-semibold">Left aligned</div>
          <div class="text-[var(--muted-fg)]">Хорошо подходит для меню, привязанных к левому краю toolbar.</div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown align="center" width="60">
      <template #trigger>
        <GrButton>Center</GrButton>
      </template>

      <template #content>
        <div class="grid gap-2 px-3 py-2 text-sm">
          <div class="font-semibold">Center aligned</div>
          <div class="text-[var(--muted-fg)]">Удобно для компактных launchers и emoji/filter pickers.</div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown align="right" width="auto">
      <template #trigger>
        <GrButton variant="ghost-border">Auto width</GrButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          Width adapts to content width.
        </div>
      </template>
    </GrDropdown>
  </div>
</template>`,
  },
  {
    id: 'dropdown-persistent-content',
    title: 'Persistent content with manual close',
    description: 'Показываем `closeOnContentClick=false`, когда внутри dropdown есть mini-form/filter pane и компонент не должен закрываться после каждого клика.',
    status: 'ready',
    previewKey: 'ds-dropdown-persistent-content',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'

const selected = ref<string[]>(['Errors'])

function toggleOption(option: string) {
  selected.value = selected.value.includes(option)
    ? selected.value.filter(item => item !== option)
    : [...selected.value, option]
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdown :close-on-content-click="false" width="64">
      <template #trigger>
        <GrButton variant="outline">Filters</GrButton>
      </template>

      <template #content="{ close }">
        <div class="grid gap-3 px-3 py-2 text-sm">
          <div class="font-semibold">Visible states</div>

          <label v-for="option in ['Errors', 'Warnings', 'Passed']" :key="option" class="flex items-center gap-2">
            <input
              :checked="selected.includes(option)"
              type="checkbox"
              @change="toggleOption(option)"
            >
            <span>{{ option }}</span>
          </label>

          <GrButton size="sm" class="justify-self-start" @click="close">
            Apply filters
          </GrButton>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ selected.join(', ') }}
    </GrBadge>
  </div>
</template>`,
    note: 'Это типичный composition-case: dropdown используется не как простое menu, а как контейнер для mini-control surface.',
  },
]
