<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <GrDropdown align="left" width="48">
      <template #trigger>
        <GrButton variant="outline">{{ t('components.GrDropdown.alignment.left') }}</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.alignment.leftAligned') }}</div>
          <div class="text-[var(--muted-fg)]">
            {{ t('components.GrDropdown.alignment.leftHint') }}
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown align="center" width="60">
      <template #trigger>
        <GrButton>{{ t('components.GrDropdown.alignment.center') }}</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.alignment.centerAligned') }}</div>
          <div class="text-[var(--muted-fg)]">
            {{ t('components.GrDropdown.alignment.centerHint') }}
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown align="right" width="auto">
      <template #trigger>
        <GrButton variant="ghost-border">{{ t('components.GrDropdown.alignment.autoWidth') }}</GrButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          {{ t('components.GrDropdown.alignment.autoHint') }}
        </div>
      </template>
    </GrDropdown>
  </div>
</template>
