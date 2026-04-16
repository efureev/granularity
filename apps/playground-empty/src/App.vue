<script setup lang="ts">
// import {ref} from 'vue'

// import {DsButton} from '@feugene/granularity'

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
        Проверка isolated-импорта `DsButton`, `DsModal` и `DsPromptDialog`
      </h1>
      <p class="max-w-3xl text-sm leading-6 text-slate-600">
        В это демо через `presetFintDsGranularity` подключены granular-стили для
        `DsPromptDialog`.
        На странице должны быть видны и button states, и корректная работа modal/prompt overlay, и базовые
        select-сценарии.
      </p>
    </header>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          Prompt dialog
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем композицию `DsPromptDialog` поверх `DsDialog`/`DsModal`, валидацию и action-кнопки.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!--        <DsButton @click="isPromptOpen = true">
                  Переименовать
                </DsButton>
                <span class="text-sm text-slate-500">
                  Текущее значение: <span class="font-medium text-slate-900">{{ promptValue }}</span>
                </span>
                -->
      </div>
      <!--
            <DsPromptDialog
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