import type { ShowcaseComponentExampleDoc } from '../types'

export const grInputTagExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'input-tag-validation',
    title: 'Проверка тега перед добавлением',
    description: 'Асинхронный `beforeAdd` со спиннером, событие `reject` для объяснения отказа и `clearable` для сброса набора.',
    status: 'ready',
    previewKey: 'gr-input-tag-validation',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInputTag } from '@feugene/granularity'

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
const KNOWN_DOMAINS = ['example.com', 'granularity.dev']

const recipients = ref(['ops@example.com'])
const error = ref('')

// Проверка асинхронная намеренно: так же выглядит обращение к серверу за
// «существует ли такой адрес». На время проверки поле показывает спиннер.
async function beforeAdd(tag: string): Promise<boolean> {
  error.value = ''

  if (!EMAIL_RE.test(tag)) {
    error.value = \`«\${tag}» не похож на адрес\`
    return false
  }

  await new Promise(resolve => setTimeout(resolve, 500))

  const domain = tag.split('@')[1] ?? ''
  if (!KNOWN_DOMAINS.includes(domain)) {
    error.value = \`Домен \${domain} не в списке разрешённых\`
    return false
  }

  return true
}
</script>

<template>
  <div class="grid gap-3">
    <GrFormField
      label="Получатели"
      hint="Enter или запятая — добавить. Разрешены домены example.com и granularity.dev"
      :error="error"
    >
      <GrInputTag
        v-model="recipients"
        :before-add="beforeAdd"
        :separators="[',', ' ']"
        clearable
        placeholder="name@example.com"
        tag-tone="primary"
        @clear="error = ''"
      />
    </GrFormField>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Крестики чипов — одна остановка \`Tab\`: между ними ходят стрелки влево-вправо, удаляет \`Delete\`.
      Из пустого поля на последний чип уводит стрелка влево.
    </div>
  </div>
</template>`,
  },
  {
    id: 'input-tag-basic-flow',
    title: 'Basic tag entry with live summary',
    description: 'Базовый live-demo фиксирует основной UX: ввод, `Enter`/separator commit и отражение списка тегов на стороне хоста.',
    status: 'ready',
    previewKey: 'gr-input-tag-basic-flow',
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
      aria-label="Incident tags"
      add-on-blur
      :separators="[',', ';']"
    />

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Current tags: <span class="font-semibold text-[var(--gr-fg)]">{{ tags.join(', ') || 'none' }}</span>
    </div>
  </div>
</template>`,
  },
  {
    id: 'input-tag-max-state',
    title: 'Controlled limit with semantic state',
    description: 'Отдельно документируем сценарий с `max`: компонент удобно использовать для curated lists и constrained profile metadata.',
    status: 'ready',
    previewKey: 'gr-input-tag-max-state',
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
      aria-label="Skill tags"
      tag-tone="secondary"
      tag-radius="round"
    />

    <div class="text-sm text-[var(--gr-muted-fg)]">
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
    previewKey: 'gr-input-tag-custom-slot',
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
      aria-label="Environment aliases"
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

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Custom tag slot lets host screens inject status markers, counters or semantic labels.
    </div>
  </div>
</template>`,
  },
]
