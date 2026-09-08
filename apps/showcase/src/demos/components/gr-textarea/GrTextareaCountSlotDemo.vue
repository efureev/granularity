<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrTextarea } from '@feugene/granularity'

const post = ref('Выпустили гранулярность 0.49: каждый компонент едет своим subpath-экспортом.')
const note = ref('')
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Пост" hint="Слот считает остаток и не молчит про перебор">
      <GrTextarea v-model="post" :maxlength="120" :rows="3">
        <template #count="{ remaining }">
          <span v-if="remaining !== undefined && remaining < 0" class="text-[var(--gr-danger-text)]">
            перебор на {{ -remaining }}
          </span>
          <span v-else>осталось {{ remaining }}</span>
        </template>
      </GrTextarea>
    </GrFormField>

    <GrFormField label="Заметка" hint="Без maxlength предела нет — считаем слова">
      <GrTextarea v-model="note" :rows="3" placeholder="Пара мыслей…">
        <template #count>
          {{ note.trim() ? note.trim().split(/\s+/).length : 0 }} слов
        </template>
      </GrTextarea>
    </GrFormField>
  </div>
</template>
