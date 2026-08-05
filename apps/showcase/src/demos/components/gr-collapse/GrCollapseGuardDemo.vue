<script setup lang="ts">
import { ref } from 'vue'

import { GrCollapse, GrCollapseItem, GrFormField, GrInput, GrSwitch } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['draft'])
const draft = ref('Quarterly report')
const dirty = ref(true)
const lastDecision = ref('—')

// Guard может быть async: пока он не ответил, повторный клик по заголовку
// игнорируется, поэтому диалог не откроется дважды.
async function beforeChange(name: string | number, expanding: boolean): Promise<boolean> {
  if (name !== 'draft' || expanding || !dirty.value) {
    lastDecision.value = `allowed: ${String(name)} ${expanding ? 'expanded' : 'collapsed'}`
    return true
  }

  await new Promise(resolve => setTimeout(resolve, 400))
  lastDecision.value = 'collapse of "draft" blocked: unsaved changes'
  return false
}
</script>

<template>
  <div class="grid gap-3">
    <GrCollapse v-model="expanded" :before-change="beforeChange">
      <GrCollapseItem name="draft" title="Draft with unsaved changes">
        <div class="grid gap-3">
          <GrFormField label="Draft title">
            <GrInput v-model="draft" size="sm" />
          </GrFormField>
          <GrSwitch v-model="dirty" size="sm">
            Treat the draft as unsaved
          </GrSwitch>
        </div>
      </GrCollapseItem>

      <GrCollapseItem name="history" title="Change history">
        This section opens and closes freely — the guard only protects the draft above.
      </GrCollapseItem>
    </GrCollapse>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Last guard decision: <span class="font-semibold text-[var(--gr-fg)]">{{ lastDecision }}</span>
    </div>
  </div>
</template>
