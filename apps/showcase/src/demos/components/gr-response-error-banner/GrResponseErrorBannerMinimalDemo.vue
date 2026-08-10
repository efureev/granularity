<script setup lang="ts">
import { GrButton, GrResponseErrorBanner, useResponseError } from '@feugene/granularity'

const { currentError, setRaw, dismiss } = useResponseError()

async function loadReport() {
  try {
    // На месте этой строки был бы `await fetch('/api/reports/42')`; ответ собран
    // здесь, чтобы демо работало на витрине без бэкенда.
    const response = new Response('{"message":"Отчёт ещё не готов: расчёт закончится через 2 минуты"}', {
      status: 409,
      headers: { 'content-type': 'application/json' },
    })

    if (!response.ok) throw response
  }
  catch (error) {
    await setRaw(error)
  }
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton size="sm" class="justify-self-start" @click="loadReport">
      Загрузить отчёт
    </GrButton>

    <GrResponseErrorBanner
      :error="currentError"
      can-retry
      @retry="loadReport"
      @dismiss="dismiss"
    />
  </div>
</template>
