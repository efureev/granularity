<script setup lang="ts">
import IconImages from '~icons/lucide/images'
import IconMap from '~icons/lucide/map'

import { ref } from 'vue'

import Specimen from './Specimen.vue'
import { photos, svgUrl } from './support'

defineProps<{ preview?: boolean }>()

const viewerOpen = ref(false)
const viewerIndex = ref(0)

function openViewer(index: number): void {
  viewerIndex.value = index
  viewerOpen.value = true
}

// Натуральный размер плана крупнее экрана: «1:1» тут честно увеличивает, а не возвращает вписанный кадр.
const floorPlan = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600" viewBox="0 0 2400 1600">'
  + '<rect width="2400" height="1600" fill="hsl(210, 30%, 97%)"/>'
  + '<g fill="none" stroke="hsl(215, 28%, 30%)" stroke-width="16">'
  + '<rect x="160" y="160" width="2080" height="1280"/>'
  + '<path d="M960 160V900M960 1100V1440M160 800H760M1160 800H2240M1600 800V1440"/>'
  + '</g>'
  + '<g font-family="sans-serif" font-size="64" fill="hsl(215, 28%, 30%)">'
  + '<text x="420" y="500">Студия</text><text x="1480" y="500">Переговорная</text>'
  + '<text x="400" y="1140">Кухня</text><text x="1180" y="1140">Склад</text><text x="1800" y="1140">Кабинет</text>'
  + '</g>'
  + '</svg>',
)
const planSources = [{ src: floorPlan, alt: 'План офиса: студия, переговорная, кухня, склад и кабинет' }]
const planOpen = ref(false)
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="(item, index) in photos.slice(0, 3)"
        :key="item.src"
        type="button"
        class="overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        :aria-label="`Открыть в просмотре: ${item.alt}`"
        @click="openViewer(index)"
      >
        <img :src="item.src" alt="" class="block h-[72px] w-full object-cover">
      </button>
    </div>
    <GrImageViewer v-model="viewerOpen" :url-list="photos" :initial-index="viewerIndex" show-progress aria-label="Снимки объекта" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Галерея поверх страницы" note="масштаб в точку под курсором, поворот, листание стрелками и свайпом; Esc закрывает">
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="(item, index) in photos"
          :key="item.src"
          type="button"
          class="overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
          :aria-label="`Открыть в просмотре: ${item.alt}`"
          @click="openViewer(index)"
        >
          <img :src="item.src" alt="" class="block h-20 w-full object-cover">
        </button>
      </div>
      <div>
        <GrButton variant="secondary" tone="neutral" size="sm" @click="openViewer(0)">
          <GrIcon><IconImages /></GrIcon>
          Открыть все снимки
        </GrButton>
      </div>
      <GrImageViewer
        v-model="viewerOpen"
        :url-list="photos"
        :initial-index="viewerIndex"
        show-progress
        hide-on-click-modal
        aria-label="Снимки объекта"
      />
    </Specimen>

    <Specimen title="Чертёж: «1:1» и скачивание" note="«100%» — вписанный кадр, «1:1» — пиксель в пиксель; исходник скачивается кнопкой в панели">
      <button
        type="button"
        class="overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        :aria-label="`Открыть в просмотре: ${planSources[0]!.alt}`"
        @click="planOpen = true"
      >
        <img :src="floorPlan" alt="" class="block h-[160px] w-full object-cover">
      </button>
      <div>
        <GrButton variant="secondary" tone="neutral" size="sm" @click="planOpen = true">
          <GrIcon><IconMap /></GrIcon>
          Открыть план
        </GrButton>
      </div>
      <GrImageViewer
        v-model="planOpen"
        :url-list="planSources"
        :max-scale="8"
        show-zoom-value
        show-download
        aria-label="План офиса"
      />
    </Specimen>
  </div>
</template>
