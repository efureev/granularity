<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented } from '@feugene/granularity'

/** Ответ сервиса, как он приходит из БД: `unknown`, а не заранее известная форма. */
const response = {
  id: 'ord_8241',
  status: 'shipped',
  total: 12490.5,
  paid: true,
  shipping: { carrier: 'СДЭК', track: '1094887312', days: 3 },
  items: [
    { sku: 'KB-87', title: 'Клавиатура 87 клавиш', qty: 1 },
    { sku: 'MS-02', title: 'Мышь беспроводная', qty: 2 },
  ],
  note: null,
}

const size = ref<'xs' | 'sm' | 'md' | 'lg'>('md')
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="size"
      size="sm"
      :options="[
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ]"
    />

    <GrCodeBlock :code="response" :size="size" line-numbers copyable max-height="18rem" />
  </div>
</template>
