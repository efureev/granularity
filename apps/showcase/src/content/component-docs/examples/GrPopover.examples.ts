import type { ShowcaseComponentExampleDoc } from '../types'

export const grPopoverExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'popover-form',
    title: 'Настройки в поповере',
    description: 'Форма прямо у кнопки, без ухода в модалку: поповер держит фокус, закрывается по Esc и клику вне, а клик внутри его не роняет — иначе первое же поле закрывало бы форму.',
    status: 'ready',
    previewKey: 'gr-popover-form',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrFormField, GrInput, GrPopover } from '@feugene/granularity'

const open = ref(false)
const name = ref('Weekly digest')
const recipients = ref('team@acme.io')

function save(): void {
  open.value = false
}
</script>

<template>
  <GrPopover v-model:open="open" aria-label="Report settings" placement="bottom-start">
    <template #trigger="{ triggerProps }">
      <GrButton variant="outline" v-bind="triggerProps">
        Report settings
      </GrButton>
    </template>

    <template #content>
      <div class="grid w-64 gap-3">
        <GrFormField label="Name">
          <GrInput v-model="name" size="sm" />
        </GrFormField>

        <GrFormField label="Recipients">
          <GrInput v-model="recipients" size="sm" />
        </GrFormField>

        <div class="flex justify-end gap-2">
          <GrButton variant="ghost" size="sm" @click="open = false">
            Cancel
          </GrButton>
          <GrButton size="sm" @click="save">
            Save
          </GrButton>
        </div>
      </div>
    </template>
  </GrPopover>
</template>`,
  },
  {
    id: 'popover-confirm',
    title: 'Подтверждение действия',
    description: 'Лёгкая альтернатива диалогу для необратимых мелочей: подтверждение появляется у самой кнопки, а не перекрывает экран.',
    status: 'ready',
    previewKey: 'gr-popover-confirm',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPopover } from '@feugene/granularity'

const open = ref(false)
const archived = ref(false)

function confirm(): void {
  archived.value = true
  open.value = false
}
</script>

<template>
  <div class="flex items-center gap-3">
    <GrPopover
      v-model:open="open"
      aria-label="Confirm archiving"
      placement="top"
      size="sm"
    >
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" tone="danger" v-bind="triggerProps">
          Archive invoice
        </GrButton>
      </template>

      <template #content>
        <div class="grid w-56 gap-3">
          <p class="text-[var(--gr-fg)]">
            Archive this invoice? You can restore it from the archive later.
          </p>

          <div class="flex justify-end gap-2">
            <GrButton variant="ghost" size="xs" @click="open = false">
              Cancel
            </GrButton>
            <GrButton size="xs" tone="danger" @click="confirm">
              Archive
            </GrButton>
          </div>
        </div>
      </template>
    </GrPopover>

    <span v-if="archived" class="text-sm text-[var(--gr-muted-fg)]">
      Invoice archived
    </span>
  </div>
</template>`,
  },
  {
    id: 'popover-placement',
    title: 'Сторона и переворот у края',
    description: 'Сторона задаётся пропом placement; у границы экрана панель сама переворачивается и сдвигается, оставаясь видимой целиком.',
    status: 'ready',
    previewKey: 'gr-popover-placement',
    code: `<script setup lang="ts">
import { GrButton, GrPopover } from '@feugene/granularity'

const placements = ['top', 'right', 'bottom', 'left'] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GrPopover
      v-for="placement in placements"
      :key="placement"
      :placement="placement"
      :aria-label="'Opens on the ' + placement"
      size="sm"
    >
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" size="sm" v-bind="triggerProps">
          {{ placement }}
        </GrButton>
      </template>

      <template #content>
        <div class="w-40 text-[var(--gr-fg)]">
          Opens on the <b>{{ placement }}</b> and flips itself when the edge is close.
        </div>
      </template>
    </GrPopover>
  </div>
</template>`,
  },
]
