<script setup lang="ts">
import { onMounted, ref } from 'vue'

/**
 * Рендерит содержимое только после монтирования.
 *
 * Зачем это в примере: часть компонентов пакета телепортирует свои панели, и
 * серверная разметка у них не совпадает с клиентской — Vue сообщает
 * hydration mismatch, а в худшем случае «прилипает» стилями панели к контейнеру
 * приложения. Обёртка убирает такой компонент из серверного рендера целиком:
 * на сервере — пусто, на клиенте — обычный рендер уже после гидрации.
 *
 * Подробности и список компонентов — `packages/granularity/docs/ssr.md`.
 */
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <slot v-if="mounted" />
  <slot v-else name="fallback" />
</template>
