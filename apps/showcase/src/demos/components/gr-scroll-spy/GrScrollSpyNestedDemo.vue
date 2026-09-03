<script setup lang="ts">
import { GrScrollSpy } from '@feugene/granularity'

const sections = [
  { id: 'spy-nested-install', label: 'Установка' },
  { id: 'spy-nested-yarn', label: 'Yarn', level: 2 },
  { id: 'spy-nested-npm', label: 'npm', level: 2 },
  { id: 'spy-nested-config', label: 'Настройка' },
  { id: 'spy-nested-preset', label: 'Пресет', level: 2 },
  { id: 'spy-nested-tokens', label: 'Токены', level: 2 },
  { id: 'spy-nested-themes', label: 'Темы', level: 3 },
  { id: 'spy-nested-faq', label: 'Частые вопросы' },
]
</script>

<template>
  <div class="grid w-full gap-4 sm:grid-cols-[200px_1fr]">
    <!--
      Уровень задаёт отступ и `aria-level`, но структурой не является:
      арифметике нужен порядок документа, и плоский список гарантирует его.
      Предки активного пункта не приглушаются — иначе оглавление читается как
      сломанное.
    -->
    <GrScrollSpy :sections="sections" aria-label="Разделы руководства" />

    <div
      class="h-[280px] overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
      tabindex="0"
      role="group"
      aria-label="Текст руководства"
    >
      <section
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        class="border-b border-[var(--gr-brd)] px-4 py-4 last:border-b-0"
      >
        <h3
          class="font-600"
          :class="(section.level ?? 1) === 1
            ? 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)]'
            : 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'"
        >
          {{ section.label }}
        </h3>
        <p class="mt-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          Содержимое раздела «{{ section.label }}»: несколько строк, чтобы прокрутка была осмысленной.
        </p>
      </section>
    </div>
  </div>
</template>
