<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrScrollSpy } from '@feugene/granularity'

const sections = [
  { id: 'spy-slot-brief', label: 'Бриф' },
  { id: 'spy-slot-research', label: 'Исследование' },
  { id: 'spy-slot-concept', label: 'Концепция' },
  { id: 'spy-slot-launch', label: 'Запуск' },
]

const log = ref<string[]>([])

function onSelect(id: string): void {
  log.value = [sections.find(section => section.id === id)?.label ?? id, ...log.value].slice(0, 3)
}
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <div class="grid gap-4 sm:grid-cols-[190px_1fr]">
      <!--
        Своя разметка пункта: слот отдаёт состояние и способ перейти, вся
        арифметика остаётся за компонентом. Адрес не трогаем — приложение с
        роутером обновит хеш само, из события `select`.
      -->
      <GrScrollSpy
        :sections="sections"
        :update-hash="false"
        aria-label="Этапы проекта"
        @select="onSelect"
      >
        <template #item="{ section, active, activate }">
          <button
            type="button"
            :aria-current="active ? 'location' : undefined"
            class="flex w-full items-center justify-between gap-2 rounded-[var(--gr-radius-control)] px-2 py-1 text-left transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]"
            :class="active
              ? 'bg-[var(--gr-primary-light)] text-[var(--gr-primary-text)] font-600'
              : 'text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]'"
            @click="activate"
          >
            {{ section.label }}
            <GrBadge v-if="active" size="sm" tone="primary">
              тут
            </GrBadge>
          </button>
        </template>
      </GrScrollSpy>

      <div
        class="h-[260px] overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
        tabindex="0"
        role="group"
        aria-label="Описание этапов"
      >
        <section v-for="section in sections" :id="section.id" :key="section.id" class="px-4 py-5">
          <h3 class="text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">
            {{ section.label }}
          </h3>
          <p class="mt-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            Что происходит на этапе «{{ section.label }}» и чем он заканчивается.
          </p>
        </section>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Выбрано:</span>
      <GrBadge v-for="(entry, index) in log" :key="index" size="sm" tone="slate">
        {{ entry }}
      </GrBadge>
      <span v-if="log.length === 0" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        выберите этап
      </span>
    </div>
  </div>
</template>
