<script setup lang="ts">
// import {ref} from 'vue'

// import {GrButton} from '@feugene/granularity'

// const isPromptOpen = ref(false)
// const promptValue = ref('Исходное имя')
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 text-slate-900">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        playground / granularity
      </p>
      <h1 class="text-3xl font-semibold leading-tight">
        Нулевая отметка замеров: Vue без `@feugene/granularity`
      </h1>
      <p class="max-w-3xl text-sm leading-6 text-slate-600">
        Ни одного импорта из библиотеки и ни одного CSS-канала: плагина granum в
        сборке этого стенда нет, поэтому классы разметки остаются без правил и
        страница выглядит голой. Так и задумано — `dist` здесь показывает цену
        пустого Vue-приложения, с которой сравнивают остальные playground'ы.
      </p>
    </header>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          Prompt dialog
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем композицию `GrPromptDialog` поверх `GrDialog`/`GrModal`, валидацию и action-кнопки.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!--        <GrButton @click="isPromptOpen = true">
                  Переименовать
                </GrButton>
                <span class="text-sm text-slate-500">
                  Текущее значение: <span class="font-medium text-slate-900">{{ promptValue }}</span>
                </span>
                -->
      </div>
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
            />
      -->
    </section>
  </main>
</template>