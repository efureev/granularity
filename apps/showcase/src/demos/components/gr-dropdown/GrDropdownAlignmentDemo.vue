<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <GrDropdown placement="bottom-start" width="12rem">
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" v-bind="triggerProps">{{ t('components.GrDropdown.alignment.left') }}</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.alignment.leftAligned') }}</div>
          <div class="text-[var(--gr-muted-fg)]">
            {{ t('components.GrDropdown.alignment.leftHint') }}
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown placement="top" :offset="16" :width="240">
      <template #trigger="{ triggerProps }">
        <GrButton v-bind="triggerProps">{{ t('components.GrDropdown.alignment.center') }}</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.alignment.centerAligned') }}</div>
          <div class="text-[var(--gr-muted-fg)]">
            {{ t('components.GrDropdown.alignment.centerHint') }}
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown placement="bottom-end" width="auto">
      <template #trigger="{ triggerProps }">
        <GrButton variant="ghost-border" v-bind="triggerProps">{{ t('components.GrDropdown.alignment.autoWidth') }}</GrButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          {{ t('components.GrDropdown.alignment.autoHint') }}
        </div>
      </template>
    </GrDropdown>
  </div>
</template>
