<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrImageViewer } from '@feugene/granularity'

// Локальный кадр 4752×3168: настоящая фотография, а не SVG-заглушка — зерно на
// реальных 100% видно только у растра. Vite отдаёт ей хешированный URL, поэтому
// путь остаётся импортом, а не строкой в `public/`.
import photo from '../../../../media/svanhove-lorem-4873426.jpg'

const IMAGE_WIDTH = 4752
const IMAGE_HEIGHT = 3168

const slides = [photo]

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--gr-muted-fg)]">
      Фотография {{ IMAGE_WIDTH }}×{{ IMAGE_HEIGHT }}. Номинальный `scale` считается относительно вписанного в окно
      изображения (`object-contain`), поэтому «100%» — это не натуральный размер: зерна на нём не видно вовсе. Кнопка
      «1:1» доводит кадр до реальных 100% — пиксель в пиксель, и разница сразу видна. Компонент сам отдаёт в slot
      natural-размер, фактический rendered-размер и реальный масштаб — без ручного чтения DOM.
    </div>

    <div>
      <GrButton size="sm" @click="open = true">
        Open real-size experiment
      </GrButton>
    </div>

    <!--
      `maxScale` поднят с дефолтной пятёрки: нужное номинальное приближение — это
      `naturalWidth / renderedWidth`, у кадра 4752 px оно выходит от пяти до
      двенадцати крат в зависимости от ширины окна. С дефолтным потолком кнопка
      «1:1» упиралась бы в него, не дойдя до реальных 100%.
    -->
    <GrImageViewer
      v-model="open"
      :url-list="slides"
      :max-scale="14"
      show-progress
      :draggable="true"
      :show-zoom-value="false"
    >
      <template #toolbar="{ scale, rotation, naturalWidth, naturalHeight, renderedWidth, renderedHeight, realScalePercent, actions }">
        <div class="flex flex-col gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--gr-bg)_20%,transparent)] bg-[color-mix(in_srgb,var(--gr-fg)_55%,transparent)] px-3 py-2 text-[var(--gr-bg)] backdrop-blur-sm">
          <div class="flex items-center justify-center gap-2">
            <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--gr-bg)_10%,transparent)]" @click="actions.zoomOut">−</button>
            <button type="button" class="rounded-full px-3 py-1 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--gr-bg)_10%,transparent)]" @click="actions.reset">Fit</button>
            <button type="button" class="rounded-full px-3 py-1 text-xs font-600 transition-colors hover:bg-[color-mix(in_srgb,var(--gr-bg)_10%,transparent)]" @click="actions.zoomToNatural">1:1</button>
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
