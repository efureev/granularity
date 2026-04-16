<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsModal, DsPromptDialog, DsSelect } from '@feugene/granularity'

const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border', 'destructive'] as const
const sizes = ['xs', 'sm', 'md', 'lg'] as const
const isModalOpen = ref(false)
const isPromptOpen = ref(false)
const promptValue = ref('Исходное имя')
const selectedCurrency = ref('EUR')
const selectedTags = ref<string[]>(['frontend'])

const currencyOptions = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'KZT', label: 'KZT — Tenge' },
] as const

const tagOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'design-system', label: 'Design system' },
  { value: 'granularity', label: 'Granularity MVP' },
] as const
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10 text-slate-900">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        playground / granularity
      </p>
      <h1 class="text-3xl font-semibold leading-tight">
        Проверка isolated-импорта `DsButton`, `DsModal`, `DsSelect` и `DsPromptDialog`
      </h1>
      <p class="max-w-3xl text-sm leading-6 text-slate-600">
        В это демо через `presetFintDsGranularity` подключены granular-стили для
        `DsButton`, `DsModal`, `DsSelect` и `DsPromptDialog`.
        На странице должны быть видны и button states, и корректная работа modal/prompt overlay, и базовые select-сценарии.
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
        <DsButton
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
        >
          {{ variant }}
        </DsButton>
      </div>
    </section>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          Размеры и состояния
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем размеры, square-режим, disabled и loading.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="size in sizes"
          :key="size"
          class="flex flex-wrap items-center gap-3"
        >
          <span class="w-12 text-xs font-medium uppercase tracking-wide text-slate-400">{{ size }}</span>
          <DsButton :size="size">
            Button
          </DsButton>
          <DsButton :size="size" square aria-label="square action">
            +
          </DsButton>
          <DsButton :size="size" variant="outline" disabled>
            Disabled
          </DsButton>
          <DsButton :size="size" variant="secondary" loading>
            Loading
          </DsButton>
        </div>
      </div>
    </section>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          Select
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем native и panel режимы `DsSelect`, single/multiple и clearable-сценарии.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Native
          </p>
          <DsSelect
            v-model="selectedCurrency"
            aria-label="Валюта"
            :options="currencyOptions"
            clearable
          />
          <p class="text-sm text-slate-500">
            Текущее значение: <span class="font-medium text-slate-900">{{ selectedCurrency || 'не выбрано' }}</span>
          </p>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Panel / multiple
          </p>
          <DsSelect
            v-model="selectedTags"
            aria-label="Теги"
            :options="tagOptions"
            options-view="panel"
            multiple
            clearable
            placeholder="Выберите теги"
          />
          <p class="text-sm text-slate-500">
            Выбрано: <span class="font-medium text-slate-900">{{ selectedTags.join(', ') || 'ничего' }}</span>
          </p>
        </div>
      </div>
    </section>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">
          Modal
        </h2>
        <p class="text-sm text-slate-500">
          Проверяем overlay, размеры панели и базовый сценарий открытия/закрытия `DsModal`.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <DsButton @click="isModalOpen = true">
          Открыть modal
        </DsButton>
        <DsButton variant="secondary" @click="isModalOpen = false">
          Закрыть modal
        </DsButton>
      </div>

      <DsModal v-model="isModalOpen" size="lg">
        <div class="space-y-4 p-6 text-slate-900">
          <div class="space-y-2">
            <h3 class="text-xl font-semibold leading-tight">
              DsModal в playground
            </h3>
            <p class="text-sm leading-6 text-slate-600">
              Этот пример помогает быстро проверить, что granular preset подтягивает стили overlay,
              панели и анимаций для `DsModal`.
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <DsButton variant="outline" @click="isModalOpen = false">
              Отмена
            </DsButton>
            <DsButton @click="isModalOpen = false">
              Понятно
            </DsButton>
          </div>
        </div>
      </DsModal>
    </section>

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
        <DsButton @click="isPromptOpen = true">
          Переименовать
        </DsButton>
        <span class="text-sm text-slate-500">
          Текущее значение: <span class="font-medium text-slate-900">{{ promptValue }}</span>
        </span>
      </div>

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
    </section>
  </main>
</template>