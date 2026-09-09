<script setup lang="ts">
import { ref } from 'vue'

import { GrTransfer } from '@feugene/granularity'

type Person = { id: string, label: string }

const DIRECTORY: Person[] = [
  { id: 'ivanova', label: 'Ирина Иванова' },
  { id: 'sokolov', label: 'Пётр Соколов' },
  { id: 'gareeva', label: 'Алина Гареева' },
  { id: 'morozov', label: 'Денис Морозов' },
  { id: 'lebedev', label: 'Кирилл Лебедев' },
  { id: 'orlova', label: 'Мария Орлова' },
]

const members = ref<Array<number | string>>(['sokolov'])
const items = ref<Person[]>(DIRECTORY)
const loading = ref(false)

let pending: ReturnType<typeof setTimeout> | null = null

// Справочник живёт на сервере: компонент отдаёт запрос, ответ подставляет
// потребитель — и он же говорит, что ответ ещё в пути.
function onSearch(query: string) {
  if (pending)
    clearTimeout(pending)

  loading.value = true
  pending = setTimeout(() => {
    const needle = query.trim().toLowerCase()
    items.value = needle
      ? DIRECTORY.filter(person => person.label.toLowerCase().includes(needle))
      : DIRECTORY
    loading.value = false
  }, 900)
}
</script>

<template>
  <div class="grid gap-3">
    <GrTransfer
      v-model="members"
      :items="items"
      item-key="id"
      item-label="label"
      :loading="loading"
      source-title="Сотрудники"
      target-title="В группе"
      aria-label="Состав рабочей группы"
      @search="onSearch"
    />

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Наберите в поиске — ответ приходит с задержкой. Пока он в пути, пустая панель
      говорит «ищем», а не «ничего не найдено»; панель со строками их не теряет, и
      сигнал даёт спиннер в поле поиска.
    </div>
  </div>
</template>
