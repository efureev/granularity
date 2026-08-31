<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { GrButton, GrFormField, GrSegmented } from '@feugene/granularity'

type State = 'edit' | 'readonly' | 'disabled' | 'invalid'

const state = ref<State>('edit')
const value = ref('')
const log = ref<string[]>([])

const editor = useTemplateRef<{ focus: () => void, getView: () => unknown }>('editor')

const readonly = computed(() => state.value === 'readonly')
const disabled = computed(() => state.value === 'disabled')
const invalid = computed(() => state.value === 'invalid')

const error = computed(() => invalid.value ? 'Сервер не принял конфигурацию' : undefined)

function note(event: string): void {
  log.value = [event, ...log.value].slice(0, 4)
}

/** `getView()` — escape hatch без контракта: тут им считают длину документа. */
function measure(): void {
  const view = editor.value?.getView() as { state: { doc: { lines: number } } } | null

  note(view ? `getView(): строк ${view.state.doc.lines}` : 'getView(): редактор ещё не поднят')
}
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="state"
      size="sm"
      :options="[
        { value: 'edit', label: 'Обычное' },
        { value: 'readonly', label: 'readonly' },
        { value: 'disabled', label: 'disabled' },
        { value: 'invalid', label: 'invalid' },
      ]"
    />

    <GrFormField label="Переопределение конфига" :error="error" hint="Пусто — показывается placeholder">
      <GrCodeEditor
        ref="editor"
        v-model="value"
        language="json"
        placeholder="{ }"
        :readonly="readonly"
        :disabled="disabled"
        :invalid="invalid"
        line-numbers
        size="sm"
        max-height="10rem"
        @change="note('change')"
        @focus="note('focus')"
        @blur="note('blur')"
      />
    </GrFormField>

    <div class="flex flex-wrap items-center gap-2">
      <GrButton size="sm" variant="secondary" @click="editor?.focus()">
        focus()
      </GrButton>
      <GrButton size="sm" variant="secondary" @click="measure()">
        getView()
      </GrButton>
      <span class="showcase-demo-text text-sm">{{ log.length ? log.join(' · ') : 'событий пока не было' }}</span>
    </div>
  </div>
</template>
