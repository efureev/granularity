<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrFormField, GrInput } from '@feugene/granularity'

type GrInputInstance = InstanceType<typeof GrInput>

const login = ref('')
const checking = ref(false)
const log = ref<string[]>([])

const field = ref<GrInputInstance>()

function note(entry: string): void {
  log.value = [entry, ...log.value].slice(0, 4)
}

// `change` приходит по blur/Enter — момент, когда значение можно проверять.
async function onChange(value: string): Promise<void> {
  note(`change: ${value || '—'}`)

  if (!value) return

  checking.value = true
  await new Promise(resolve => setTimeout(resolve, 900))
  checking.value = false
  note(`проверен: ${value}`)
}

function prefill(): void {
  login.value = 'granularity'
  field.value?.focus()
  field.value?.select()
}
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Логин" hint="Проверка занятости уходит по blur или Enter">
      <GrInput
        ref="field"
        v-model="login"
        :loading="checking"
        clearable
        :maxlength="24"
        show-count
        placeholder="ваш-логин"
        @change="onChange"
        @clear="note('clear: очищено кнопкой')"
        @focus="note('focus')"
        @blur="note('blur')"
      />
    </GrFormField>

    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" variant="outline" @click="prefill">
        Подставить и выделить
      </GrButton>
      <GrButton size="sm" variant="ghost" :disabled="!log.length" @click="log = []">
        Очистить журнал
      </GrButton>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      <div v-if="!log.length">
        Журнал событий пуст — поставьте фокус в поле.
      </div>
      <div v-for="entry in log" :key="entry">
        {{ entry }}
      </div>
    </div>
  </div>
</template>
