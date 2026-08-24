<script setup lang="ts">
import { ref } from 'vue'

import {
  GrAutocomplete,
  GrButton,
  GrDropdown,
  GrFormField,
  GrModal,
  GrSelect,
  GrTooltip,
} from '@feugene/granularity'

// `GrDatePicker` из companion-пакета подставляется авто-импортом.
const open = ref(false)

const city = ref('berlin')
const cities = [
  { label: 'Berlin', value: 'berlin' },
  { label: 'Lisbon', value: 'lisbon' },
  { label: 'Tbilisi', value: 'tbilisi' },
]

const airport = ref('')
const airports = ['BER', 'LIS', 'TBS', 'AMS', 'IST'].map(code => ({ value: code, label: code }))

const departure = ref<string | null>('2026-08-12')
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open form with poppers
    </GrButton>

    <!-- Панель, открытая изнутри окна, телепортируется в общий портал и лежит
         РЯДОМ с корнем окна, а не внутри него. Высоту ей задаёт стек слоёв:
         пока окно открыто, панель встаёт над ним. -->
    <GrModal v-model="open" size="md" aria-label="Trip details">
      <div class="grid gap-4">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          Trip details
        </div>

        <GrFormField label="City">
          <GrSelect v-model="city" :options="cities" options-view="panel" />
        </GrFormField>

        <GrFormField label="Airport">
          <GrAutocomplete v-model="airport" :options="airports" placeholder="Start typing" />
        </GrFormField>

        <GrFormField label="Departure">
          <GrDatePicker v-model="departure" value-adapter="isoDate" locale="en-US" clearable />
        </GrFormField>

        <div class="flex items-center gap-3">
          <GrDropdown>
            <template #trigger="{ triggerProps }">
              <GrButton v-bind="triggerProps" variant="outline" size="sm">
                Actions
              </GrButton>
            </template>

            <template #content>
              <div class="grid gap-1 p-1 text-sm">
                <button class="rounded-[var(--gr-radius-control)] px-2 py-1 text-left hover:bg-[var(--gr-muted)]">
                  Duplicate trip
                </button>
                <button class="rounded-[var(--gr-radius-control)] px-2 py-1 text-left hover:bg-[var(--gr-muted)]">
                  Export as PDF
                </button>
              </div>
            </template>
          </GrDropdown>

          <GrTooltip text="Подсказка тоже поверх окна: её слой ниже модального">
            <GrButton variant="ghost" size="sm">
              Why so many pickers?
            </GrButton>
          </GrTooltip>
        </div>

        <div class="flex justify-end">
          <GrButton size="sm" @click="open = false">
            Done
          </GrButton>
        </div>
      </div>
    </GrModal>
  </div>
</template>
