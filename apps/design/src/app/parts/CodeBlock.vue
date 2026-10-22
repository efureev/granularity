<script setup lang="ts">
import CopyButton from './CopyButton.vue'

defineProps<{
  code: string
  /** Подпись над кодом: язык или файл. */
  caption: string
}>()
</script>

<template>
  <figure class="flex min-w-0 flex-col overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-muted)]">
    <figcaption class="flex items-center justify-between gap-2 border-b border-[var(--gr-brd)] py-1 pe-1 ps-3 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
      <span class="font-[var(--gr-font-mono)]">{{ caption }}</span>
      <CopyButton :text="code" :label="`Скопировать: ${caption}`" />
    </figcaption>
    <!-- Длинная строка прокручивает блок: с клавиатуры до неё тоже надо дотянуться. -->
    <pre tabindex="0" class="code-block m-0 overflow-x-auto p-3 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]"><code>{{ code }}</code></pre>
  </figure>
</template>

<style scoped>
.code-block:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: -2px;
}
</style>
