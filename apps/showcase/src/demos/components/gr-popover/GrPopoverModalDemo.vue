<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrFormField, GrInput, GrPopover, GrSwitch } from '@feugene/granularity'

const modal = ref(true)
const open = ref(false)
const amount = ref('1200')
const comment = ref('')
const lastBackgroundClick = ref<string | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="modal">
      Modal mode
    </GrSwitch>

    <GrPopover v-model:open="open" :modal="modal" aria-label="Refund request" placement="bottom-start">
      <template #trigger="{ triggerProps }">
        <GrButton class="justify-self-start" variant="outline" v-bind="triggerProps">
          Request a refund
        </GrButton>
      </template>

      <template #content>
        <div class="grid w-72 gap-3">
          <GrFormField label="Amount">
            <GrInput v-model="amount" size="sm" />
          </GrFormField>

          <GrFormField label="Comment">
            <GrInput v-model="comment" size="sm" placeholder="Optional" />
          </GrFormField>

          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" size="sm" @click="open = false">
              Cancel
            </GrButton>
            <GrButton size="sm" @click="open = false">
              Send
            </GrButton>
          </div>
        </div>
      </template>
    </GrPopover>

    <!-- Фон для проверки изоляции: в модальном режиме кнопка не кликается,
         не получает фокус по Tab и не читается диктором. -->
    <div class="grid gap-2 rounded-xl border border-[var(--gr-brd)] p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Background stays interactive only while the popover is not modal.
      </div>
      <GrButton
        class="justify-self-start"
        variant="ghost"
        size="sm"
        @click="lastBackgroundClick = new Date().toLocaleTimeString()"
      >
        Click me
      </GrButton>
      <div class="text-sm">
        Last background click: {{ lastBackgroundClick ?? 'never' }}
      </div>
    </div>
  </div>
</template>
