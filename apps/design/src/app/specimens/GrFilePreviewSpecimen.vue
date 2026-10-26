<script setup lang="ts">
import { ref } from 'vue'

import Specimen from './Specimen.vue'
import { photos } from './support'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const
const RATIOS = ['1:1', '4:3', '16:9'] as const

const COVER = photos[0]!.src
const VALLEY = photos[1]!.src
// Битые данные: картинка не декодируется, и плитка показывает «не открылась».
const BROKEN = 'data:image/png;base64,AAAA'

const attachments = [
  { name: 'Обложка.jpg', mime: 'image/jpeg', src: COVER },
  { name: 'Договор с типографией.pdf', mime: 'application/pdf' },
  { name: 'Бриф.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { name: 'Смета на апрель.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { name: 'Выгрузка заказов.csv', mime: 'text/csv' },
  { name: 'Макеты.zip', mime: 'application/zip' },
  { name: 'Резерв.dat', mime: 'application/octet-stream' },
]

const viewerOpen = ref(false)
const viewerIndex = ref(0)

function openViewer(index: number): void {
  viewerIndex.value = index
  viewerOpen.value = true
}
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex gap-3">
      <GrFilePreview :src="COVER" mime="image/jpeg" name="Обложка.jpg" tile-size="sm" />
      <GrFilePreview mime="application/pdf" name="Договор.pdf" tile-size="sm" />
      <GrFilePreview mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" name="Смета.xlsx" tile-size="sm" />
      <GrFilePreview mime="application/zip" name="Макеты.zip" tile-size="sm" />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Виды файлов" note="Тип решает mime, а не расширение: картинка — картинкой, остальное — значком и именем; незнакомый тип даёт заглушку." wide>
      <div class="flex flex-wrap gap-3">
        <GrFilePreview v-for="file in attachments" :key="file.name" :src="file.src" :name="file.name" :mime="file.mime" />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Ширина — ступень шкалы или число пикселей; высоту задают пропорции.">
      <div class="flex flex-wrap items-end gap-3">
        <div v-for="size in SIZES" :key="size" class="flex flex-col items-center gap-1.5">
          <GrFilePreview :src="VALLEY" mime="image/jpeg" :name="`Долина, ступень ${size}`" :tile-size="size" />
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrFilePreview :src="VALLEY" mime="image/jpeg" name="Долина, 72 пикселя" :tile-size="72" />
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">72</span>
        </div>
      </div>
    </Specimen>

    <Specimen title="Пропорции" note="Соотношение держит место до загрузки, картинка обрезается по нему.">
      <div class="flex flex-wrap items-end gap-3">
        <div v-for="ratio in RATIOS" :key="ratio" class="flex flex-col items-center gap-1.5">
          <GrFilePreview :src="COVER" mime="image/jpeg" :name="`Закат, ${ratio}`" tile-size="lg" :ratio="ratio" />
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ ratio }}</span>
        </div>
      </div>
    </Specimen>

    <Specimen title="Картинка не открылась" note="Пустой src и сорванная загрузка ведут в заглушку, а не в битую иконку; у сорванной — свой значок.">
      <div class="flex flex-wrap gap-3">
        <GrFilePreview mime="image/png" name="Без превью.png" />
        <GrFilePreview :src="BROKEN" mime="image/png" name="Удалённый снимок.png" />
      </div>
    </Specimen>

    <Specimen title="С GrImageViewer" note="Кликабельная плитка — кнопка в порядке Tab; окно открывает потребитель по её click.">
      <div class="flex flex-wrap gap-3">
        <GrFilePreview
          v-for="(photo, index) in photos"
          :key="photo.src"
          :src="photo.src"
          mime="image/jpeg"
          :name="photo.alt"
          clickable
          @click="openViewer(index)"
        />
      </div>
      <GrImageViewer
        v-model="viewerOpen"
        :url-list="photos"
        :initial-index="viewerIndex"
        show-progress
        hide-on-click-modal
        aria-label="Снимки к заказу"
      />
    </Specimen>
  </div>
</template>
