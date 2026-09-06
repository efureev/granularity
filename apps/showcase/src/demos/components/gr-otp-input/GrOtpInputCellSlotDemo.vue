<script setup lang="ts">
import { ref } from 'vue'

import { GrCard, GrOtpInput } from '@feugene/granularity'

const code = ref('42')
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <GrOtpInput v-model="code" type="alphanumeric" aria-label="Код с подчёркиванием">
      <template #cell="{ char, filled }">
        <span
            class="border-b-2 px-1 pb-0.5 font-semibold"
            :class="filled ? 'border-[var(--gr-primary)]' : 'border-[var(--gr-brd)]'"
        >{{ char || ' ' }}</span>
      </template>
    </GrOtpInput>
    <div class="text-sm text-[var(--gr-muted-fg)]">
      Слот <code>cell</code> меняет оформление, не трогая поведение: размер,
      рамку и каретку по-прежнему держит компонент.
    </div>
  </GrCard>
</template>
