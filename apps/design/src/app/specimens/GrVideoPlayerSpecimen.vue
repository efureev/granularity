<script setup lang="ts">
import type { GrVideoPlayerSize } from '@feugene/granularity-media'
import { ref, watch } from 'vue'

import Specimen from './Specimen.vue'
import { svgUrl } from './support'

defineProps<{ preview?: boolean }>()

/**
 * Четыре секунды неподвижного кадра 320×180 в VP8 — фон постера без надписи —
 * прямо в адресе: дизайн-система не ходит в сеть, а с длительностью у плеера
 * появляются полоса перемотки и время.
 */
const CLIP = 'data:video/webm;base64,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'

/** Не ролик: браузер не разберёт его и поднимет `error` без запроса в сеть. */
const BROKEN_CLIP = 'data:video/webm;base64,AAAA'

/** Фон постера — тот же, что у кадра ролика: после пуска картинка не подменяется чужой. */
function poster(width: number, height: number, title: string): string {
  const unit = Math.min(width, height)
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + '<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(222, 47%, 22%)"/><stop offset="1" stop-color="hsl(262, 42%, 38%)"/></linearGradient></defs>'
    + `<rect width="${width}" height="${height}" fill="url(#p)"/>`
    + `<circle cx="${width * 0.78}" cy="${height * 0.3}" r="${unit * 0.22}" fill="hsla(0, 0%, 100%, 0.14)"/>`
    + `<circle cx="${width * 0.9}" cy="${height * 0.62}" r="${unit * 0.12}" fill="hsla(0, 0%, 100%, 0.1)"/>`
    + `<rect x="${width * 0.08}" y="${height * 0.18}" width="${width * 0.32}" height="${unit * 0.035}" rx="${unit * 0.017}" fill="hsla(0, 0%, 100%, 0.55)"/>`
    + `<text x="${width * 0.08}" y="${height * 0.36}" font-family="sans-serif" font-size="${unit * 0.1}" font-weight="700" fill="hsl(0, 0%, 100%)">${title}</text>`
    + '</svg>',
  )
}

const WIDE_POSTER = poster(1280, 720, 'Обзор отчётов')
const UNBOXING_POSTER = poster(1280, 720, 'Распаковка')

const SIZES: readonly GrVideoPlayerSize[] = ['xs', 'sm', 'md', 'lg']

const RATIOS = [
  { ratio: 4 / 3, label: '4:3', src: poster(960, 720, 'Урок 3') },
  { ratio: 1, label: '1:1', src: poster(720, 720, 'Сторис') },
]

/**
 * Позиция ставится, как только известна длительность: без запуска и без звука,
 * зато полоса показывает просмотренное — цвет токена плеера.
 */
const positioned = ref<{ seekTo: (seconds: number) => void, duration: number } | null>(null)
watch(() => positioned.value?.duration, (duration) => {
  if (duration && Number.isFinite(duration))
    positioned.value?.seekTo(duration * 0.4)
})

const unboxingState = ref<'ready' | 'playing' | 'paused' | 'ended'>('ready')
const STATE_LABELS = { ready: 'не запускалось', playing: 'идёт', paused: 'на паузе', ended: 'досмотрено' } as const
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrVideoPlayer :src="CLIP" :poster="WIDE_POSTER" size="xs" muted aria-label="Обзор отчётов" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Кадр до запуска" note="Постер держит место, пока ролик не пошёл; панель лежит на кадре, градиент держит подписи на светлом. Ролик — четыре секунды неподвижного кадра прямо в адресе: дизайн-система не ходит в сеть.">
      <GrVideoPlayer :src="CLIP" :poster="WIDE_POSTER" muted aria-label="Обзор отчётов" />
    </Specimen>

    <Specimen title="Просмотренное" note="Полоса берёт цвет токена --gr-video-player-progress, буфер — светлее; диктору дорожка говорит время, а не долю.">
      <GrVideoPlayer ref="positioned" :src="CLIP" muted aria-label="Запись с позицией" />
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg — кегль времени; кнопки на кадре одного размера на любой ступени.">
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrVideoPlayer :src="CLIP" :poster="WIDE_POSTER" :size="size" muted :aria-label="`Обзор отчётов, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Соотношение сторон" note="Рамка держит aspect-ratio до загрузки, и страница под ней не прыгает; по умолчанию 16:9. Кадр другого соотношения вписывается с полями.">
      <div class="grid grid-cols-2 items-start gap-4">
        <div v-for="item in RATIOS" :key="item.label" class="flex flex-col gap-2">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ item.label }}
          </span>
          <GrVideoPlayer :src="CLIP" :poster="item.src" :aspect-ratio="item.ratio" size="xs" muted :aria-label="`Ролик ${item.label}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Недоступен" note="Кнопки выключены, дорожка уходит из порядка Tab, запуск не срабатывает.">
      <GrVideoPlayer :src="CLIP" :poster="WIDE_POSTER" muted disabled aria-label="Обзор отчётов, недоступен" />
    </Specimen>

    <Specimen title="Ролик не открылся" note="Битый источник — слой с причиной поверх кадра и событие error; панель остаётся на месте.">
      <GrVideoPlayer :src="BROKEN_CLIP" muted aria-label="Ролик с ошибкой" />
    </Specimen>

    <Specimen title="Видео в заявке" note="Короткое подтверждение рядом с данными заявки: вид плеера совпадает с остальным интерфейсом в любой теме." wide>
      <GrCard title="Заявка на возврат R-1042" description="Кофемолка ручная · покупатель приложил видео" :heading-level="5" padding="md">
        <template #actions>
          <GrBadge tone="warning" size="sm">
            Ждёт решения
          </GrBadge>
        </template>
        <div class="grid items-start gap-6 md:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
          <GrVideoPlayer
            :src="CLIP"
            :poster="UNBOXING_POSTER"
            muted
            aria-label="Видео распаковки"
            @play="unboxingState = 'playing'"
            @pause="unboxingState = 'paused'"
            @ended="unboxingState = 'ended'"
          />
          <div class="flex flex-col gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            <p>Жернова не вращаются с первого дня, на корпусе — скол у основания.</p>
            <p class="text-[var(--gr-muted-fg)]">
              Видео: {{ STATE_LABELS[unboxingState] }}
            </p>
          </div>
        </div>
      </GrCard>
    </Specimen>
  </div>
</template>
