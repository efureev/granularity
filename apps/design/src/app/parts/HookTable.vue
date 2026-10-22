<script setup lang="ts">
import { computed } from 'vue'

import type { GrComponentToken } from '@feugene/granularity/tokens'

import { renderInline } from '../docs'

/**
 * Хуки — ручки приложения: тема их не задаёт, компонент читает их с запасным
 * значением. Колонка «почему не тема» — объяснение литерала по умолчанию
 * (`literal` в `tokens.json`): механика экземпляра, а не язык темы.
 */
const props = defineProps<{
  hooks: readonly GrComponentToken[]
  label: string
}>()

const withReasons = computed(() => props.hooks.some(hook => hook.literal))
</script>

<template>
  <div class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]" tabindex="0" role="region" :aria-label="label">
    <table class="w-full min-w-[820px] table-fixed border-collapse text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
      <colgroup>
        <col class="w-[40%]">
        <col :class="withReasons ? 'w-[24%]' : ''">
        <col v-if="withReasons">
      </colgroup>
      <thead>
        <tr class="text-[var(--gr-muted-fg)]">
          <th scope="col" class="px-4 py-2.5 text-start font-500">
            хук
          </th>
          <th scope="col" class="border-s border-[var(--gr-brd)] px-4 py-2.5 text-start font-500">
            без него
          </th>
          <th v-if="withReasons" scope="col" class="border-s border-[var(--gr-brd)] px-4 py-2.5 text-start font-500">
            почему не тема
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hook in hooks" :key="hook.name" class="border-t border-[var(--gr-brd)]">
          <th scope="row" class="px-4 py-3 text-start align-top font-400">
            <code class="block break-all font-[var(--gr-font-mono)] text-[var(--gr-fg)]">{{ hook.name }}</code>
            <!-- eslint-disable-next-line vue/no-v-html -- описание из tokens.json пакета: `code` в тексте -->
            <span class="hook-text mt-1 block text-[var(--gr-muted-fg)]" v-html="renderInline(hook.description)" />
          </th>
          <td class="border-s border-[var(--gr-brd)] px-4 py-3 align-top">
            <!-- eslint-disable-next-line vue/no-v-html -- значение по умолчанию из tokens.json: литерал или ссылка на токен -->
            <span class="hook-text" v-html="renderInline(hook.default)" />
          </td>
          <td v-if="withReasons" class="border-s border-[var(--gr-brd)] px-4 py-3 align-top text-[var(--gr-muted-fg)]">
            {{ hook.literal ?? '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hook-text :deep(code) {
  font-family: var(--gr-font-mono);
  word-break: break-all;
}
</style>
