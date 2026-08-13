<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrTextarea } from '@feugene/granularity'

const note = ref('Клиент просил перезвонить после 18:00.\nНапомнить про счёт за март.')
const draft = ref('')
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Заметка по клиенту" hint="Крестик появляется, когда есть что стирать">
      <GrTextarea v-model="note" clearable :rows="3" />
    </GrFormField>

    <GrFormField label="Черновик письма" hint="Кнопка очистки достижима `Tab`, срабатывает `Enter` и `Space`">
      <GrTextarea
        v-model="draft"
        clearable
        show-count
        :maxlength="200"
        :rows="3"
        placeholder="Наберите текст — появится счётчик и крестик"
      />
    </GrFormField>
  </div>
</template>
