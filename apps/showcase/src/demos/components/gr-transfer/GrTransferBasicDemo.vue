<script setup lang="ts">
import { ref } from 'vue'

import { GrTransfer } from '@feugene/granularity'

const members = ref<string[]>(['sokolov'])

const directory = [
  { id: 'ivanova', label: 'Ирина Иванова' },
  { id: 'sokolov', label: 'Пётр Соколов' },
  { id: 'gareeva', label: 'Алина Гареева' },
  { id: 'morozov', label: 'Денис Морозов' },
  { id: 'lebedev', label: 'Кирилл Лебедев' },
  { id: 'orlova', label: 'Мария Орлова' },
]
</script>

<template>
  <div class="w-full">
    <GrTransfer
      v-model="members"
      :items="directory"
      source-title="Сотрудники"
      target-title="В группе"
      aria-label="Состав рабочей группы"
    />
  </div>
</template>
