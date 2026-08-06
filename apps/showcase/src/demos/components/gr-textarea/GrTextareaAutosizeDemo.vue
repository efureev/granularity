<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrTextarea } from '@feugene/granularity'

const comment = ref('Поле растёт под текст: директива `v-autosize` была в пакете и просто не была подключена.')
const summary = ref('')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Комментарий" hint="Высота подстраивается под содержимое">
      <GrTextarea
        v-model="comment"
        autosize
        resize="none"
        :rows="2"
        placeholder="Что изменилось в релизе"
      />
    </GrFormField>

    <GrFormField label="Краткое описание" hint="Счётчик связан с полем через aria-describedby">
      <GrTextarea
        v-model="summary"
        :maxlength="120"
        show-count
        :rows="3"
        size="sm"
        placeholder="До 120 символов"
      />
    </GrFormField>
  </div>
</template>
