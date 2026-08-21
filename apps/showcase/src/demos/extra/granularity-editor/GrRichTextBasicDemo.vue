<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrRichText` подставляется авто-импортом.

/**
 * Поле с тулбаром и панель модели рядом.
 *
 * Панель не для красоты: значение — размеченный текст, и увидеть, что именно
 * уходит наружу, иначе нельзя.
 */
const value = ref('<p>Наберите текст и примените <strong>формат</strong>.</p>')

const size = computed(() => `${value.value.length} символов разметки`)
</script>

<template>
  <div class="grid gap-4">
    <GrRichText v-model="value" schema="article" aria-label="Описание" />

    <pre class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] p-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]">{{ value }}</pre>

    <p class="showcase-demo-text text-sm opacity-70">{{ size }}</p>

    <p class="showcase-demo-text text-sm opacity-70">
      Тулбар — одна остановка <strong>Tab</strong>, внутри ходят стрелками: у «статьи» десять кнопок,
      и без этого до самого текста пришлось бы добираться десятью нажатиями. Активный формат объявлен
      <code>aria-pressed</code>, а не только подсветкой — подсветки скринридер не видит.
    </p>

    <p class="showcase-demo-text text-sm opacity-70">
      Горячие клавиши работают без тулбара: <strong>Ctrl/Cmd + B</strong> и <strong>I</strong>.
      <strong>Tab</strong> уводит из поля, а не вставляет отступ: иначе пользователь клавиатуры
      оказался бы в поле заперт.
    </p>
  </div>
</template>
