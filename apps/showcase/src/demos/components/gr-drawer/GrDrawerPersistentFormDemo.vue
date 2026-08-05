<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer, GrFormField, GrInput, GrTextarea } from '@feugene/granularity'

const open = ref(false)
const saving = ref(false)
const status = ref('—')

const name = ref('Nightly backup')
const note = ref('')

const nameInput = ref<HTMLElement | null>(null)

async function save(): Promise<void> {
  saving.value = true
  status.value = 'saving — drawer is locked'

  await new Promise(resolve => setTimeout(resolve, 1200))

  saving.value = false
  open.value = false
  status.value = `saved “${name.value}”`
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Edit job
    </GrButton>

    <GrDrawer
      v-model="open"
      title="Edit job"
      :persistent="saving"
      :initial-focus="nameInput"
      :body-config="{ paddingY: 'py-4' }"
      @opened="status = 'opened'"
      @closed="status = status.startsWith('saved') ? status : 'closed'"
    >
      <div class="grid gap-4">
        <GrFormField label="Job name">
          <GrInput ref="nameInput" v-model="name" size="sm" />
        </GrFormField>

        <GrFormField label="Note" hint="Виден только команде дежурных">
          <GrTextarea v-model="note" :rows="4" />
        </GrFormField>

        <p class="text-sm text-[var(--gr-muted-fg)]">
          Пока идёт сохранение, панель `persistent`: ни Esc, ни клик по подложке её не закроют —
          кнопка закрытия остаётся, чтобы выход был хотя бы один.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" :disabled="saving" @click="open = false">
            Cancel
          </GrButton>
          <GrButton :loading="saving" @click="save">
            Save
          </GrButton>
        </div>
      </template>
    </GrDrawer>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Lifecycle: <span class="font-semibold text-[var(--gr-fg)]">{{ status }}</span>
    </div>
  </div>
</template>
