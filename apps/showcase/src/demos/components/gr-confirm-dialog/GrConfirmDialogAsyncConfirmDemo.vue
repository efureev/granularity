<script setup lang="ts">
import { ref } from 'vue'

import type { ResponseErrorInfo } from '@feugene/granularity'
import { GrBadge, GrButton, GrConfirmDialog, GrSegmented } from '@feugene/granularity'

const open = ref(false)
const loading = ref(false)
const error = ref<ResponseErrorInfo | null>(null)
const status = ref('Ничего не отправляли')

// Первая попытка отвечает отказом, вторая проходит — так видно и баннер, и то,
// что окно остаётся открытым для повтора.
let attempt = 0

const focusAction = ref<'cancel' | 'confirm'>('cancel')

function openDialog() {
  attempt = 0
  error.value = null
  status.value = 'Ничего не отправляли'
  open.value = true
}

async function onConfirm() {
  attempt += 1
  loading.value = true
  error.value = null

  await new Promise(resolve => setTimeout(resolve, 1500))
  loading.value = false

  if (attempt === 1) {
    error.value = { kind: 'unknown', message: 'Сервер отклонил запрос. Попробуйте ещё раз.', raw: null }
    return
  }

  status.value = 'Рабочая область удалена'
  open.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrSegmented
        v-model="focusAction"
        size="sm"
        :options="[
          { value: 'cancel', label: 'focusAction: cancel' },
          { value: 'confirm', label: 'focusAction: confirm' },
        ]"
      />
      <GrButton variant="primary" tone="danger" @click="openDialog">
        Удалить рабочую область
      </GrButton>
      <GrBadge size="sm" :tone="status.startsWith('Рабочая') ? 'danger' : 'neutral'">
        {{ status }}
      </GrBadge>
    </div>

    <GrConfirmDialog
      v-model="open"
      title="Удалить рабочую область?"
      description="Первая попытка вернёт ошибку сервера — окно останется открытым для повтора."
      confirm-text="Удалить"
      confirm-tone="danger"
      :focus-action="focusAction"
      :confirm-loading="loading"
      :error="error"
      :close-on-confirm="false"
      persistent
      @confirm="onConfirm"
    />
  </div>
</template>
