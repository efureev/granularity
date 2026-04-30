import type { ShowcaseComponentExampleDoc } from '../types'

export const grInputTagExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'input-tag-basic-flow',
    title: 'Basic tag entry with live summary',
    description: 'Базовый live-demo фиксирует основной UX: ввод, `Enter`/separator commit и отражение списка тегов на стороне хоста.',
    status: 'ready',
    previewKey: 'ds-input-tag-basic-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrInputTag } from '@feugene/granularity'

const tags = ref(['critical', 'backend'])
</script>

<template>
  <div class="grid gap-4">
    <GrInputTag
      v-model="tags"
      placeholder="Type a tag and press Enter"
      add-on-blur
      :separators="[',', ';']"
    />

    <div class="rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4 text-sm text-[var(--muted-fg)]">
      Current tags: <span class="font-semibold text-[var(--fg)]">{{ tags.join(', ') || 'none' }}</span>
    </div>
  </div>
</template>`,
  },
  {
    id: 'input-tag-max-state',
    title: 'Controlled limit with semantic state',
    description: 'Отдельно документируем сценарий с `max`: компонент удобно использовать для curated lists и constrained profile metadata.',
    status: 'ready',
    previewKey: 'ds-input-tag-max-state',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrInputTag } from '@feugene/granularity'

const skills = ref(['vue', 'typescript'])
const remaining = computed(() => 4 - skills.value.length)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrBadge tone="neutral" radius="round">{{ skills.length }}/4 selected</GrBadge>
      <GrBadge tone="secondary" radius="round">{{ remaining }} slots left</GrBadge>
    </div>

    <GrInputTag
      v-model="skills"
      :max="4"
      state="success"
      placeholder="Add skill tags"
      tag-tone="secondary"
      tag-radius="round"
    />

    <div class="text-sm text-[var(--muted-fg)]">
      Use \`max\` to keep curated lists compact in profile or filter forms.
    </div>
  </div>
</template>`,
  },
  {
    id: 'input-tag-custom-slot',
    title: 'Custom tag slot for semantic badges',
    description: 'Через slot `tag` витрина показывает, как host-screen может переоформить tag-pill и добавить собственные маркеры статуса.',
    status: 'ready',
    previewKey: 'ds-input-tag-custom-slot',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrInputTag } from '@feugene/granularity'

const environments = ref(['production', 'staging'])
</script>

<template>
  <div class="grid gap-4">
    <GrInputTag
      v-model="environments"
      placeholder="Environment alias"
      tag-tone="warning"
      tag-dark
    >
      <template #tag="{ tag, index }">
        <span class="inline-flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-current opacity-70" />
          <span>{{ index + 1 }}. {{ tag }}</span>
        </span>
      </template>
    </GrInputTag>

    <div class="text-sm text-[var(--muted-fg)]">
      Custom tag slot lets host screens inject status markers, counters or semantic labels.
    </div>
  </div>
</template>`,
  },
]
