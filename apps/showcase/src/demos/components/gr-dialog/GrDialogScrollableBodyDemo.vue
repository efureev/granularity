<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrDialog, GrFormField, GrInput, GrSegmented, GrSwitch } from '@feugene/granularity'

const open = ref(false)
const scrollBehavior = ref<'inside' | 'outside'>('inside')
const saved = ref(false)

const fields = Array.from({ length: 12 }, (_, index) => `Поле ${index + 1}`)
const model = ref<Record<string, string>>({})

const hint = computed(() =>
  scrollBehavior.value === 'inside'
    ? 'Шапка и подвал закреплены — «Сохранить» на виду с первого кадра'
    : 'Скроллится вся страница окна: до кнопок надо доскроллить',
)

function save() {
  saved.value = true
  open.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <GrSegmented
      v-model="scrollBehavior"
      size="sm"
      class="justify-self-start"
      :options="[
        { value: 'inside', label: 'inside' },
        { value: 'outside', label: 'outside' },
      ]"
    />

    <div class="text-xs text-[var(--gr-muted-fg)]">
      {{ hint }}
    </div>

    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      Настройки профиля
    </GrButton>

    <div v-if="saved" class="text-xs text-[var(--gr-muted-fg)]">
      Сохранено
    </div>

    <GrDialog
      v-model="open"
      title="Настройки профиля"
      :scroll-behavior="scrollBehavior"
    >
      <div class="grid gap-4">
        <GrFormField v-for="field in fields" :key="field" :label="field">
          <GrInput v-model="model[field]" :placeholder="field" />
        </GrFormField>

        <GrSwitch>Присылать уведомления</GrSwitch>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Отмена
          </GrButton>
          <GrButton @click="save">
            Сохранить
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>
