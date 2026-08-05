<script setup lang="ts">
import { ref } from 'vue'

import type { GrFormFileError } from '@feugene/granularity'
import { GrButton, GrFormFile, GrFormField } from '@feugene/granularity'

const files = ref<File[]>([])
// `v-model:errors` — двусторонний канал: сюда пишет и внутренняя валидация,
// и ответ сервера.
const errors = ref<GrFormFileError[]>([])
const sending = ref(false)

async function submit(): Promise<void> {
  if (!files.value.length) return

  sending.value = true
  await new Promise(resolve => setTimeout(resolve, 700))
  sending.value = false

  errors.value = [{
    code: 'accept',
    fileName: files.value[0]?.name,
    message: 'Сервис принимает только подписанные PDF',
  }]
}
</script>

<template>
  <div class="grid gap-3">
    <GrFormField label="Документы" hint="До трёх файлов, только PDF">
      <GrFormFile
        v-model="files"
        v-model:errors="errors"
        accept="application/pdf,.pdf"
        multiple
        :limit="3"
      />
    </GrFormField>

    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" :loading="sending" :disabled="!files.length" @click="submit">
        Отправить
      </GrButton>
      <GrButton size="sm" variant="ghost" :disabled="!errors.length" @click="errors = []">
        Сбросить ошибки
      </GrButton>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Ошибки объявляются `role="alert"` и связаны с кнопкой выбора через `aria-describedby` —
      и те, что нашла валидация, и те, что вернул сервер.
    </div>
  </div>
</template>
