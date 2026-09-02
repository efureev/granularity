<script setup lang="ts">
import { GrAffix } from '@feugene/granularity'

const sections = [
  { id: 'a', title: 'Январь', rows: ['Аренда офиса', 'Подписки на сервисы', 'Командировка в Казань', 'Обучение команды', 'Реклама в поиске'] },
  { id: 'b', title: 'Февраль', rows: ['Аренда офиса', 'Закупка ноутбуков', 'Подписки на сервисы', 'Юридическое сопровождение'] },
  { id: 'c', title: 'Март', rows: ['Аренда офиса', 'Подписки на сервисы', 'Конференция', 'Ремонт переговорной', 'Реклама в поиске', 'Аудит безопасности'] },
]
</script>

<template>
  <div
    class="h-[320px] w-full overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
    tabindex="0"
    role="group"
    aria-label="Список месяцев"
  >
    <section v-for="section in sections" :key="section.id">
      <GrAffix>
        <h3 class="px-4 py-2 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">
          {{ section.title }}
        </h3>
      </GrAffix>

      <ul>
        <li
          v-for="row in section.rows"
          :key="row"
          class="border-t border-[var(--gr-brd)] px-4 py-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
        >
          {{ row }}
        </li>
      </ul>
    </section>
  </div>
</template>
