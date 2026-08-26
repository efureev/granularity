<script setup lang="ts">
/**
 * Оболочка страницы компонента: заголовок и ровно один компонент под ним.
 *
 * Своей логики у неё нет намеренно. Всё, что она добавит в DOM, попадёт в
 * снимок и в гидрацию каждой из ста страниц — то есть станет общим фоном, на
 * котором ищут расхождение. Поэтому здесь только статическая разметка.
 */
defineProps<{ name: string, about: string }>()
</script>

<template>
  <main class="min-h-[100dvh] bg-[var(--gr-bg)] px-4 py-8 text-[var(--gr-fg)] sm:px-6">
    <header class="mx-auto mb-6 grid max-w-[1180px] gap-1">
      <h1
        data-testid="component-page-name"
        class="m-0 text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-tight)] font-600"
      >
        {{ name }}
      </h1>
      <p class="m-0 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-relaxed)] text-[var(--gr-muted-fg)]">
        {{ about }}
      </p>
    </header>

    <div data-testid="component-page-body" class="mx-auto max-w-[1180px]">
      <slot />
    </div>
  </main>
</template>
