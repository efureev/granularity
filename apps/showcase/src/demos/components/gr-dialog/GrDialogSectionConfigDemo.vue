<script setup lang="ts">
import {ref} from 'vue'

import {GrButton, GrDialog, GrCheckbox} from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const open = ref(false)
const confirmed = ref(false)

function openDialog() {
  confirmed.value = false
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="openDialog">
      {{ t('components.GrDialog.section.open') }}
    </GrButton>

    <div class="text-xs text-[var(--muted-fg)]">
      {{ t('components.GrDialog.section.footerEnabled') }} <span class="font-medium text-[var(--fg)]">{{ confirmed ? t('components.GrDialog.section.yes') : t('components.GrDialog.section.no') }}</span>
    </div>

    <GrDialog
        v-model="open"
        :title="t('components.GrDialog.section.title')"
        :header-config="{ paddingX: 'px-4', paddingY: 'py-3' }"
        :footer-config="{ paddingX: 'px-4', paddingY: 'py-3', bordered: false }"
    >
      <div class="grid gap-4 text-sm text-[var(--muted-fg)]">
        <p>
          {{ t('components.GrDialog.section.body') }}
        </p>

        <div class="flex items-start gap-3 rounded-lg border border-[var(--brd)] p-3 text-[var(--fg)]">
          <GrCheckbox v-model="confirmed">{{ t('components.GrDialog.section.checkbox') }}</GrCheckbox>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            {{ t('components.GrDialog.section.later') }}
          </GrButton>
          <GrButton :disabled="!confirmed" @click="open = false">
            {{ t('components.GrDialog.section.share') }}
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>
