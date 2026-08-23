<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton } from '@feugene/granularity'

/**
 * Шапка и подвал поля — зоны внутри рамки, а не блоки рядом с ней.
 *
 * Снаружи подпись и счётчик читались отдельным элементом: рамка обводила только
 * текст, и связь с полем держалась на близости. Здесь они внутри той же рамки и
 * отбиты линией, как тулбар.
 */
const value = ref('<p>Черновик письма клиенту.</p>')

const plainLength = computed(() => value.value.replace(/<[^>]*>/g, '').length)
</script>

<template>
  <div class="grid gap-4">
    <GrRichText v-model="value" schema="article" aria-label="Письмо">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]">
            Кому: <strong>ops@example.com</strong>
          </span>
          <GrBadge tone="warning">Черновик</GrBadge>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between gap-2">
          <span class="showcase-demo-text text-sm">Знаков: {{ plainLength }}</span>
          <GrButton size="xs" variant="outline">Отправить</GrButton>
        </div>
      </template>
    </GrRichText>

    <p class="showcase-demo-text text-sm">
      Обе зоны необязательны и включаются самим фактом слота. Линия принадлежит границе между
      зонами, а не самой зоне: у края поля она сошлась бы со скруглением рамки.
    </p>
  </div>
</template>
