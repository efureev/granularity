<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPopover, GrSegmented } from '@feugene/granularity'

/**
 * Высота устроена как ширина — `min()` из хука и неотключаемого предела, — но
 * второй операнд здесь не константа, а замер слоя: сколько места осталось до
 * края вьюпорта на той стороне, куда панель встала.
 *
 * Содержимое намеренно длинное: пока потолок не упёрся, не видно ни его, ни
 * скролла, и демонстрировать было бы нечего.
 */
const ceiling = ref<'auto' | 'short'>('auto')

const ceilingOptions = [
  { value: 'auto', label: 'Мнения нет' },
  { value: 'short', label: 'Потолок 12rem' },
]

const ROWS = Array.from({ length: 24 }, (_, i) => `Строка ${i + 1} — содержимое, которого заведомо больше, чем экрана`)
</script>

<template>
  <div class="grid gap-4">
    <label class="grid gap-1 text-[length:var(--gr-control-text-sm)]">
      <span class="showcase-demo-text">Потолок содержимого — хук</span>
      <GrSegmented v-model="ceiling" :options="ceilingOptions" size="sm" />
    </label>

    <div>
      <GrPopover
        :key="ceiling"
        :content-class="ceiling === 'short' ? '[--gr-popover-max-height:12rem]' : undefined"
        placement="bottom-start"
        aria-label="Высота панели"
        size="sm"
      >
        <template #trigger="{ triggerProps }">
          <GrButton variant="outline" v-bind="triggerProps">
            Открыть длинную панель — 24 строки
          </GrButton>
        </template>

        <template #content>
          <div class="grid gap-1 text-[var(--gr-fg)]">
            <div v-for="row in ROWS" :key="row">{{ row }}</div>
          </div>
        </template>
      </GrPopover>
    </div>

    <p class="showcase-demo-text text-sm">
      <b>Не выше, чем есть места</b> — предел, который не настраивается. Слой пишет на панель замер
      <code>--gr-floating-available-height</code>: расстояние до края вьюпорта на той стороне, куда
      панель в итоге встала. Он стоит вторым операндом <code>min()</code> и снаружи не снимается.

      <br><br>

      Прокрутите страницу так, чтобы триггер оказался у нижнего края, и откройте снова: панель
      сожмётся под оставшееся место, а не уедет за экран. <code>flip</code> перевернёт её на
      свободную сторону, <code>shift</code> подвинет вдоль края — но сжать её не может ни тот, ни
      другой, и без этого предела низ длинной панели был бы недостижим ничем.
    </p>

    <p class="showcase-demo-text text-sm">
      <b>Потолок содержимого</b> — хук <code>--gr-popover-max-height</code>, по умолчанию
      <code>100vh</code>, то есть мнения нет: высоту диктует замер. Задают его, когда панель обязана
      быть <b>ниже</b> доступного места. Доставляется через <code>contentClass</code> по той же
      причине, что и потолок ширины: панель живёт в портале, и инлайновый стиль ляжет на обёртку
      триггера, а не на неё.

      <br><br>

      <b>Скролл приезжает вместе с потолком.</b> Потолок без скролла не ограничивает, а обрезает —
      содержимое молча уходит под нижний край. Пока потолок не упёрся, полосы прокрутки нет: для
      коротких панелей не меняется ничего.
    </p>
  </div>
</template>
