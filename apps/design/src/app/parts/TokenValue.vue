<script setup lang="ts">
import { computed } from 'vue'

import type { TokenPreview } from '../componentTokens'

/**
 * Значение токена текстом и образцом. Образец читает сам токен (`var(name)`), а
 * не текст значения: формула вроде `color-mix(… var(--gr-primary) …)` считается
 * браузером, и под парой режима (`data-theme`) — в этом режиме, а не в режиме
 * страницы. Общее для режимов значение со ссылками даёт по образцу на режим:
 * формула одна, роли в ней — разные; литерал везде один — и образец один.
 */
const props = defineProps<{
  name: string
  value: string
  preview?: TokenPreview
  modes: readonly { pair: string, title: string }[]
}>()

const samples = computed(() => (props.value.includes('var(') ? props.modes : props.modes.slice(0, 1)))
</script>

<template>
  <span class="flex items-start gap-2">
    <span v-if="preview" class="flex flex-none gap-1" aria-hidden="true">
      <span
        v-for="mode in samples"
        :key="mode.pair"
        class="token-preview"
        :title="mode.title"
        :data-preview="preview"
        :data-theme="mode.pair"
        :style="{ '--token': `var(${name})` }"
      >
        <template v-if="preview === 'font'">Аа</template>
      </span>
    </span>
    <code class="min-w-0 break-words font-[var(--gr-font-mono)] text-[var(--gr-fg)]">{{ value }}</code>
  </span>
</template>

<style scoped>
.token-preview {
  flex: none;
  width: 20px;
  height: 20px;
  border: 1px solid var(--gr-brd);
  border-radius: var(--gr-radius-xs);
}

/* Шахматка под цветом: прозрачная заливка видна прозрачной, а не белой. */
.token-preview[data-preview='color'] {
  background:
    linear-gradient(var(--token), var(--token)),
    repeating-conic-gradient(var(--gr-muted) 0 25%, var(--gr-card) 0 50%) 0 0 / 8px 8px;
}

.token-preview[data-preview='shadow'] {
  width: 28px;
  background: var(--gr-card);
  box-shadow: var(--token);
}

.token-preview[data-preview='radius'] {
  border: 2px solid var(--gr-fg);
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-top-left-radius: var(--token);
}

.token-preview[data-preview='font'] {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  background: var(--gr-card);
  color: var(--gr-fg);
  font-family: var(--token);
  font-size: 13px;
  line-height: 1;
}
</style>
