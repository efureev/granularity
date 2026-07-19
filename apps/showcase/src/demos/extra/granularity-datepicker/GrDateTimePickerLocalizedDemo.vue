<script setup lang="ts">
import { ref } from 'vue'

import { GrDateTimePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <div class="grid max-w-[320px] gap-3">
    <GrDateTimePicker
      v-model="value"
      mode="datetime"
      locale="ru"
      enable-seconds
      :auto-apply="false"
      placeholder="Выберите дату и время"
      aria-label="Выберите дату и время"
    />
    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
    </p>
  </div>
</template>
