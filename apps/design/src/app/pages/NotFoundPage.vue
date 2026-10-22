<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="mx-auto flex max-w-[720px] flex-col items-start gap-4 px-4 py-20 lg:px-10">
    <p class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
      404
    </p>
    <h1 class="text-[length:var(--gr-text-3xl)] font-600 leading-[var(--gr-leading-3xl)]">
      Такой страницы нет
    </h1>
    <p class="text-[length:var(--gr-text-base)] leading-[var(--gr-leading-lg)] text-[var(--gr-muted-fg)]">
      Раздел мог переехать, а у компонента может не быть страницы. Всё, что есть, — в навигации слева.
    </p>
    <GrButton :as="RouterLink" to="/" variant="secondary" tone="neutral">
      На обзор
    </GrButton>
  </div>
</template>
