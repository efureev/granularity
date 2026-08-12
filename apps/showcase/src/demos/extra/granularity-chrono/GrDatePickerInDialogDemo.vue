<script setup lang="ts">
import { ref } from 'vue'

// `GrDatePicker`, `GrDialog`, `GrButton` и `GrFormField` подставляются
// авто-импортом (`unplugin-vue-components`).
const open = ref(false)
const value = ref<string | null>('2026-08-12')
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Schedule delivery
    </GrButton>

    <GrDialog v-model="open" title="Schedule delivery" size="sm">
      <!-- Панель пикера встаёт в общий стек слоёв поверх окна: Esc закрывает
           сначала её, и только следующий — само окно. -->
      <GrFormField label="Delivery date">
        <GrDatePicker
          v-model="value"
          value-adapter="isoDate"
          locale="en-US"
          clearable
          placeholder="Pick a date"
        />
      </GrFormField>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <span class="showcase-demo-text text-sm">
            <span class="opacity-70">value=</span><code>{{ value ?? '—' }}</code>
          </span>
          <GrButton @click="open = false">
            Done
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>
