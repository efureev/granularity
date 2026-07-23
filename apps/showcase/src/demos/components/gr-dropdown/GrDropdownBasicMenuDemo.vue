<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const lastAction = ref(t('components.GrDropdown.basic.noAction'))

function select(action: string) {
  lastAction.value = action
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdown>
      <template #trigger="{ open }">
        <GrButton variant="outline">
          {{ open ? t('components.GrDropdown.basic.closeMenu') : t('components.GrDropdown.basic.openMenu') }}
        </GrButton>
      </template>

      <template #content>
        <div class="grid gap-1">
          <button type="button" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]" @click="select(t('components.GrDropdown.basic.preview'))">
            {{ t('components.GrDropdown.basic.preview') }}
          </button>
          <button type="button" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]" @click="select(t('components.GrDropdown.basic.duplicate'))">
            {{ t('components.GrDropdown.basic.duplicate') }}
          </button>
          <button type="button" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]" @click="select(t('components.GrDropdown.basic.archive'))">
            {{ t('components.GrDropdown.basic.archive') }}
          </button>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ lastAction }}
    </GrBadge>
  </div>
</template>
