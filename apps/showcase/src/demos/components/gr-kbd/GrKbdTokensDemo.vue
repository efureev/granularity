<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { GrKbdPlatform, GrKbdTokenGroup } from '@feugene/granularity'
import { GR_KBD_TOKENS, GrKbd, GrSegmented } from '@feugene/granularity'

const platform = ref<GrKbdPlatform>('auto')

/**
 * `auto` уточняется после монтирования — тем же способом, что и в самом
 * компоненте (`navigator` в теле setup разошёлся бы с серверным рендером).
 * Без этого колонка «диктор» показывала бы имя не той платформы, чей глиф
 * нарисован рядом.
 */
const detectedApple = ref(false)
onMounted(() => {
  detectedApple.value = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
})

const isApple = computed(() => (platform.value === 'auto' ? detectedApple.value : platform.value === 'apple'))

const groups: { id: GrKbdTokenGroup, title: string }[] = [
  { id: 'modifier', title: 'Модификаторы' },
  { id: 'editing', title: 'Ввод и редактирование' },
  { id: 'navigation', title: 'Навигация' },
]

/**
 * Список приходит из самого пакета (`GR_KBD_TOKENS`), а не переписан руками:
 * своя копия разошлась бы с форматтером на первой же новой клавише.
 */
const byGroup = computed(() => groups.map(group => ({
  ...group,
  tokens: GR_KBD_TOKENS.filter(spec => spec.group === group.id),
})))
</script>

<template>
  <div class="grid gap-5">
    <GrSegmented
      v-model="platform"
      size="sm"
      :options="[
        { value: 'auto', label: 'auto' },
        { value: 'apple', label: 'macOS' },
        { value: 'other', label: 'Windows/Linux' },
      ]"
    />

    <section v-for="group in byGroup" :key="group.id" class="grid gap-2">
      <h4 class="text-[length:var(--gr-text-xs)] font-600 uppercase tracking-wide text-[var(--gr-muted-fg)]">
        {{ group.title }}
      </h4>

      <ul class="grid gap-1 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-2">
        <li
          v-for="spec in group.tokens"
          :key="spec.token"
          class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-3 py-2 text-[length:var(--gr-text-sm)] hover:bg-[var(--gr-muted)]"
        >
          <GrKbd :keys="[spec.token]" :platform="platform" size="sm" />

          <code class="text-[length:var(--gr-text-xs)] text-[var(--gr-fg)]">{{ spec.token }}</code>

          <span
            v-if="spec.aliases.length"
            class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]"
          >
            то же: {{ spec.aliases.join(', ') }}
          </span>

          <!-- Имя произносит диктор вместо глифа; у слов его нет — они читаются сами. -->
          <span
            v-if="(isApple ? spec.apple : spec.other).name"
            class="ml-auto text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]"
          >
            диктор: {{ (isApple ? spec.apple : spec.other).name }}
          </span>
        </li>
      </ul>
    </section>

    <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
      Всё остальное компонент показывает как есть: буква приводится к заглавной
      (<GrKbd keys="k" :platform="platform" size="sm" />), слово остаётся словом
      (<GrKbd :keys="['F5']" :platform="platform" size="sm" />).
    </p>
  </div>
</template>
