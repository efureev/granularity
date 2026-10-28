<script setup lang="ts">
import type { GrSegmentedOption } from '@feugene/granularity'
import type { GrImageCropSize } from '@feugene/granularity-media'
import { computed, onBeforeUnmount, ref, useTemplateRef } from 'vue'

import Specimen from './Specimen.vue'
import { svgUrl } from './support'

defineProps<{ preview?: boolean }>()

/**
 * Размер у картинок задан явно: кадр считается в пикселях исходника, а SVG без
 * `width`/`height` собственного размера не имеет.
 */
const PORTRAIT = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">'
  + '<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(205, 56%, 80%)"/><stop offset="1" stop-color="hsl(228, 44%, 62%)"/></linearGradient></defs>'
  + '<rect width="1200" height="900" fill="url(#b)"/>'
  + '<rect x="80" y="120" width="220" height="660" rx="24" fill="hsla(0, 0%, 100%, 0.28)"/>'
  + '<rect x="900" y="80" width="220" height="740" rx="24" fill="hsla(0, 0%, 100%, 0.2)"/>'
  + '<path d="M380 900c18-170 112-260 220-260s202 90 220 260z" fill="hsl(222, 38%, 30%)"/>'
  + '<circle cx="600" cy="420" r="150" fill="hsl(28, 52%, 74%)"/>'
  + '<path d="M450 400c0-110 70-180 150-180s150 70 150 180c-40-60-90-80-150-80s-110 20-150 80z" fill="hsl(24, 40%, 28%)"/>'
  + '</svg>',
)

const LANDSCAPE = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">'
  + '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(32, 86%, 78%)"/><stop offset="1" stop-color="hsl(14, 72%, 86%)"/></linearGradient></defs>'
  + '<rect width="1600" height="900" fill="url(#s)"/>'
  + '<circle cx="1140" cy="300" r="110" fill="hsl(40, 96%, 92%)"/>'
  + '<path d="M0 590 Q350 430 700 560 T1600 500 V900 H0Z" fill="hsl(18, 34%, 58%)"/>'
  + '<path d="M0 720 Q450 590 930 700 T1600 680 V900 H0Z" fill="hsl(12, 30%, 40%)"/>'
  + '</svg>',
)

const SIZES: readonly GrImageCropSize[] = ['xs', 'sm', 'md', 'lg']

const RATIOS = [
  { ratio: 1, label: '1 — аватар' },
  { ratio: 4 / 3, label: '4 / 3 — карточка' },
  { ratio: 16 / 9, label: '16 / 9 — обложка' },
]

const zoom = ref(2)
const ZOOM_OPTIONS: GrSegmentedOption[] = [
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
  { value: 3, label: '3×' },
]
/** Колесо и клавиши дают промежуточное увеличение — тогда не выбрана ни одна ступень. */
const zoomPreset = computed(() => (ZOOM_OPTIONS.some(option => option.value === zoom.value) ? zoom.value : ''))
const zoomText = computed(() => `×${zoom.value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`)

const avatarCrop = useTemplateRef<{ crop: () => Promise<Blob | null> }>('avatarCrop')
const avatar = ref<string | null>(null)
const saving = ref(false)

async function saveAvatar(): Promise<void> {
  saving.value = true
  try {
    const blob = await avatarCrop.value?.crop()
    if (!blob)
      return
    if (avatar.value)
      URL.revokeObjectURL(avatar.value)
    avatar.value = URL.createObjectURL(blob)
  }
  finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (avatar.value)
    URL.revokeObjectURL(avatar.value)
})
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="w-full max-w-[160px]">
      <GrImageCrop :src="PORTRAIT" shape="circle" size="sm" aria-label="Кадр аватара" />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Круг и прямоугольник" note="Рамка неподвижна, двигается картинка. Круг — маска показа (--gr-image-crop-mask), файл остаётся прямоугольным; у прямоугольника — направляющая рамка.">
      <div class="grid grid-cols-2 items-start gap-4">
        <GrImageCrop :src="PORTRAIT" shape="circle" aria-label="Кадр аватара, круг" />
        <GrImageCrop :src="PORTRAIT" shape="rect" aria-label="Кадр аватара, прямоугольник" />
      </div>
    </Specimen>

    <Specimen title="Соотношение сторон" note="aspectRatio — число, а не строка «16:9»: его задаёт место, куда уйдёт кадр, а не пользователь.">
      <div class="grid grid-cols-3 items-start gap-4">
        <div v-for="item in RATIOS" :key="item.label" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ item.label }}
          </span>
          <GrImageCrop :src="LANDSCAPE" :aspect-ratio="item.ratio" size="xs" :aria-label="`Кадр ${item.label}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg — ступень слайдера увеличения и кегль подписи пустой рамки.">
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrImageCrop :src="LANDSCAPE" :aspect-ratio="16 / 9" :size="size" :aria-label="`Кадр обложки, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Без картинки" note="Пустая рамка держит соотношение, и пришедшая картинка ничего под собой не сдвигает; свой текст — слот #empty.">
      <div class="grid grid-cols-2 items-start gap-4">
        <GrImageCrop :aspect-ratio="4 / 3" aria-label="Кадр, картинки нет" />
        <GrImageCrop :aspect-ratio="4 / 3" aria-label="Обложка товара">
          <template #empty>
            <span class="flex flex-col items-center gap-1 p-4 text-center text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              <span class="font-600 text-[var(--gr-fg)]">Обложка 4:3</span>
              <span>Выберите фото товара</span>
            </span>
          </template>
        </GrImageCrop>
      </div>
    </Specimen>

    <Specimen title="Заперто" note="disabled: картинка не двигается и не увеличивается, рамка уходит из порядка Tab, слайдер выключен.">
      <div class="w-full max-w-[280px]">
        <GrImageCrop :src="PORTRAIT" shape="circle" disabled aria-label="Кадр аватара, заперт" />
      </div>
    </Specimen>

    <Specimen title="Своё увеличение" note="v-model:zoom держит увеличение снаружи; слот #controls заменяет слайдер — здесь ступенями 1×, 2×, 3×.">
      <div class="w-full max-w-[280px]">
        <GrImageCrop v-model:zoom="zoom" :src="LANDSCAPE" :max-zoom="3" aria-label="Кадр с увеличением">
          <template #controls="{ setZoom }">
            <GrSegmented
              :model-value="zoomPreset"
              :options="ZOOM_OPTIONS"
              size="sm"
              aria-label="Увеличение кадра"
              @update:model-value="value => setZoom(Number(value))"
            />
            <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              {{ zoomText }}
            </span>
          </template>
        </GrImageCrop>
      </div>
    </Specimen>

    <Specimen
      title="Аватар профиля"
      note="crop() отдаёт Blob заданного output — 256 × 256; круглым его делает место показа, GrAvatar, а не файл."
      wide
    >
      <GrCard title="Фото профиля" description="Иван Петров · продажи" :heading-level="5" padding="md">
        <div class="grid items-start gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <GrImageCrop
            ref="avatarCrop"
            :src="PORTRAIT"
            shape="circle"
            :output="{ width: 256, height: 256, type: 'image/png' }"
            aria-label="Кадр фото профиля"
          />
          <div class="flex flex-col items-start gap-4">
            <div class="flex items-end gap-4">
              <GrAvatar name="Иван Петров" :src="avatar ?? undefined" :size="72" />
              <GrAvatar name="Иван Петров" :src="avatar ?? undefined" size="md" />
              <GrAvatar name="Иван Петров" :src="avatar ?? undefined" size="xs" />
            </div>
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              {{ avatar ? 'Так кадр выглядит в шапке профиля, в комментарии и в строке списка.' : 'Подвиньте картинку под рамкой и сохраните — кадр встанет в аватары справа.' }}
            </p>
            <GrButton size="sm" :loading="saving" @click="saveAvatar">
              Сохранить кадр
            </GrButton>
          </div>
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
