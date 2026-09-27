<script setup lang="ts">
import {ref} from 'vue'

import { GrButton } from '@feugene/granularity/components/GrButton'
// import { GrPromptDialog } from '@feugene/granularity/components/GrPromptDialog'

const isPromptOpen = ref(false)
const promptValue = ref('Исходное имя')
const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border', 'destructive'] as const
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 text-slate-900">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        playground / granularity
      </p>
      <h1 class="text-3xl font-semibold leading-tight">
        Проверка isolated-импорта `GrButton`
      </h1>
      <p class="max-w-3xl text-sm leading-6 text-slate-600">
        В это демо приложение импортирует только `GrButton` через component subpath export,
        чтобы проверить, что в bundle больше не попадает runtime других компонентов из
        `@feugene/granularity`.
      </p>
    </header>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          Варианты
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем, что в dist реально попали utility-стили для всех button variants.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <GrButton
            v-for="variant in variants"
            :key="variant"
            :variant="variant"
        >
          {{ variant }}
        </GrButton>
      </div>
    </section>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          GrButton only
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем, что subpath import остаётся рабочим и не подтягивает `GrModal`, `GrDialog`, `GrSelect`
          и их зависимости.
        </p>
      </div>

<!--      <div class="flex flex-wrap items-center gap-3">
        <GrButton @click="isPromptOpen = true">
          Нажми меня
        </GrButton>
        <span class="text-sm text-slate-500">
          Отдельно собранный `GrButton` без монолитного barrel-entry.
        </span>
      </div>-->
<!--
      <GrPromptDialog
          v-model="isPromptOpen"
          v-model:value="promptValue"
          title="Переименовать MVP"
          description="Проверь базовый prompt-сценарий и валидацию обязательного значения."
          label="Новое имя"
          placeholder="Введите новое имя"
          confirm-text="Сохранить"
          cancel-text="Отмена"
      />-->

    </section>
  </main>
</template>