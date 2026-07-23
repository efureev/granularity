<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrImageViewer } from '@feugene/granularity'

// Картинка гарантированного размера: picsum возвращает ровно указанные width/height.
const IMAGE_WIDTH = 1000
const IMAGE_HEIGHT = 1500

const slides = [`https://picsum.photos/id/1015/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`]

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--gr-muted-fg)]">
      Картинка гарантированного размера {{ IMAGE_WIDTH }}×{{ IMAGE_HEIGHT }}. Номинальный `scale` считается относительно
      вписанного в окно изображения (`object-contain`), поэтому «100%» — это не натуральный размер. Компонент сам отдаёт
      в slot natural-размер, фактический rendered-размер и реальный масштаб — без ручного чтения DOM.
    </div>

    <div>
      <GrButton size="sm" @click="open = true">
        Open real-size experiment
      </GrButton>
    </div>

    <GrImageViewer
      v-model="open"
      :url-list="slides"
      show-progress
      :draggable="true"
      :show-zoom-value="false"
    >
      <template #toolbar="{ scale, rotation, naturalWidth, naturalHeight, renderedWidth, renderedHeight, realScalePercent, actions }">
        <div class="flex flex-col gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--gr-bg)_20%,transparent)] bg-[color-mix(in_srgb,var(--gr-fg)_55%,transparent)] px-3 py-2 text-[var(--gr-bg)] backdrop-blur-sm">
          <div class="flex items-center justify-center gap-2">
            <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--gr-bg)_10%,transparent)]" @click="actions.zoomOut">−</button>
            <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--gr-bg)_10%,transparent)]" @click="actions.reset">Reset</button>
            <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--gr-bg)_10%,transparent)]" @click="actions.zoomIn">+</button>
          </div>

          <div class="grid gap-0.5 text-[11px] leading-tight font-500">
            <span>Natural: {{ naturalWidth }} × {{ naturalHeight }} px</span>
            <span>Rendered: {{ renderedWidth }} × {{ renderedHeight }} px</span>
            <span>Nominal scale: {{ Math.round(scale * 100) }}% · rotation {{ rotation }}°</span>
            <span>Real scale: {{ realScalePercent }}%</span>
          </div>
        </div>
      </template>
    </GrImageViewer>
  </div>
</template>
