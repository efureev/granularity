import type { ShowcaseComponentExampleDoc } from '../types'

export const grLoadingExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'loading-inline-overlay',
    title: 'Inline section overlay',
    description: 'Базовый сценарий: оверлей поверх карточки, пока обновляются данные. Подпись читается диктором — у корня `role="status"`.',
    status: 'ready',
    previewKey: 'gr-loading-inline-overlay',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="loading = !loading">
      {{ loading ? 'Hide' : 'Show' }} inline loading
    </GrButton>

    <div class="relative min-h-[180px] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div class="font-medium text-[var(--gr-fg)]">Invoice list</div>
        <div>Use \`GrLoading\` as an overlay above an existing card or section while async data is refreshing.</div>
        <div>No \`text\` prop here: the caption comes from the active locale — switch RU/EN to see it change.</div>
      </div>

      <GrLoading v-if="loading" />
    </div>
  </div>
</template>`,
  },
  {
    id: 'loading-delay-slot',
    title: 'Delay and custom panel',
    description: '`delay` не даёт оверлею мигнуть на быстром ответе, а слот заменяет содержимое панели — прогресс и кнопка отмены.',
    status: 'ready',
    previewKey: 'gr-loading-delay-slot',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading, GrProgressBar } from '@feugene/granularity'

const fastLoading = ref(false)
const exportLoading = ref(false)
const percent = ref(0)

let exportTimer: number | undefined

// Быстрый ответ: задержка 300 мс не даёт оверлею мигнуть.
function runFast() {
  fastLoading.value = true
  window.setTimeout(() => {
    fastLoading.value = false
  }, 200)
}

function runExport() {
  exportLoading.value = true
  percent.value = 0

  exportTimer = window.setInterval(() => {
    percent.value = Math.min(100, percent.value + 8)
    if (percent.value === 100) abortExport()
  }, 220)
}

function abortExport() {
  window.clearInterval(exportTimer)
  exportLoading.value = false
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <GrButton variant="outline" @click="runFast">
        Fast request (200 ms)
      </GrButton>
      <GrButton @click="runExport">
        Export report
      </GrButton>
    </div>

    <div class="relative min-h-[200px] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div class="font-medium text-[var(--gr-fg)]">Quarterly report</div>
        <div>The fast request finishes before the delay elapses, so the overlay never appears.</div>
      </div>

      <GrLoading v-if="fastLoading" :delay="300" text="Refreshing..." />

      <GrLoading v-if="exportLoading" custom-class="rounded-xl">
        <div class="text-sm font-medium text-[var(--gr-fg)]">Building the export</div>
        <GrProgressBar :value="percent" class="w-52" />
        <GrButton size="xs" variant="outline" @click="abortExport">
          Cancel
        </GrButton>
      </GrLoading>
    </div>
  </div>
</template>`,
  },
  {
    id: 'loading-directive',
    title: 'Directive with content blocking',
    description: 'Директива `v-loading` объявляет контейнер `aria-busy` и помечает его содержимое `inert`: под оверлеем не остаётся ни таб-порядка, ни доступного дерева.',
    status: 'ready',
    previewKey: 'gr-loading-directive',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrInput, vLoading } from '@feugene/granularity'

const loading = ref(false)
const name = ref('Alan Turing')

function save() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" :disabled="loading" @click="save">
      Save profile
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      While the overlay is up, the form below is \`inert\`: Tab skips it and screen readers ignore it.
      The container itself reports \`aria-busy\`.
    </div>

    <div
      v-loading="{ loading, text: 'Saving profile...', delay: 150 }"
      class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4"
    >
      <div class="grid gap-3">
        <GrInput v-model="name" aria-label="Full name" />
        <GrButton variant="outline" class="justify-self-start">
          Reset
        </GrButton>
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'loading-custom-appearance',
    title: 'Custom appearance',
    description: 'Настройка `background`, `spinnerTone` и `spinnerSize` под плотные дашборды; `animated` выключает вращение.',
    status: 'ready',
    previewKey: 'gr-loading-custom-appearance',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="loading = !loading">
      Toggle custom overlay
    </GrButton>

    <div class="relative min-h-[180px] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div class="font-medium text-[var(--gr-fg)]">Brand migration</div>
        <div>Custom background and a static, tinted spinner adapt the overlay to dense dashboards.</div>
      </div>

      <GrLoading
        v-if="loading"
        text="Preparing migration plan..."
        background="color-mix(in srgb, var(--gr-fg) 78%, transparent)"
        custom-class="rounded-xl"
        spinner-tone="primary"
        :spinner-size="36"
        :animated="false"
      />
    </div>
  </div>
</template>`,
  },
  {
    id: 'loading-fullscreen',
    title: 'Fullscreen async cycle',
    description: 'Полноэкранный режим на токене `--gr-z-loading`: он выше модалок, потому что блокирует приложение целиком.',
    status: 'ready',
    previewKey: 'gr-loading-fullscreen',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)

function runFullscreenSync() {
  loading.value = true

  window.setTimeout(() => {
    loading.value = false
  }, 1400)
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="runFullscreenSync">
      Simulate global sync
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Fullscreen overlay closes automatically after a short async cycle.
    </div>

    <GrLoading v-if="loading" fullscreen text="Syncing workspace data..." style="--gr-muted-fg: white;" />
  </div>
</template>`,
  },
]
