<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import {
  fullscreenIconPath,
  pauseIconPath,
  playIconPath,
  volumeOffIconPath,
  volumeOnIconPath,
} from './icons'
import type { GrVideoPlayerSize } from './grVideoPlayerStyles'
import {
  bufferedClass,
  buttonClass,
  controlsClass,
  playedClass,
  rootClass,
  rowClass,
  sizeTextClass,
  stateLayerClass,
  timeClass,
  trackClass,
  videoClass,
} from './grVideoPlayerStyles'
import { bufferedPercent, clampTime, formatTime, progressPercent } from './videoTime'

export interface GrVideoPlayerProps {
  src?: string | null
  /** Кадр до запуска: без него первые секунды видна чёрная рамка. */
  poster?: string
  /** Соотношение сторон рамки. По умолчанию 16:9 — им снято большинство роликов. */
  aspectRatio?: number
  autoplay?: boolean
  loop?: boolean
  /** Начинать без звука. Для автозапуска обязательно: браузеры блокируют звук. */
  muted?: boolean
  /** Шаг перемотки стрелками, секунды. */
  seekStep?: number
  size?: GrVideoPlayerSize
  disabled?: boolean
  ariaLabel?: string
}

export interface GrVideoPlayerEmits {
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'ended'): void
  (e: 'timeupdate', current: number): void
  (e: 'error', error: unknown): void
}

const props = withDefaults(defineProps<GrVideoPlayerProps>(), {
  src: null,
  poster: undefined,
  aspectRatio: 16 / 9,
  autoplay: false,
  loop: false,
  muted: false,
  seekStep: 5,
  // `undefined`, а не `md`: настоящий дефолт живёт в `useGrComponentSize`.
  size: undefined,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrVideoPlayerEmits>()

defineSlots<{
  /** Своя панель управления вместо встроенной. */
  controls?: (props: {
    playing: boolean
    current: number
    duration: number
    toggle: () => void
  }) => unknown
}>()

const { t } = useGranularityTranslations()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrVideoPlayer' })

const videoEl = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const current = ref(0)
const duration = ref(0)
const muted = ref(props.muted)
const failed = ref(false)

/**
 * Длительность известна не всегда.
 *
 * У потоковой записи (`MediaRecorder`, эфир) её нет в заголовке, и браузер
 * отдаёт `NaN`. Полоса прогресса и подпись «/ 0:00» в этом случае врут:
 * показывать надо то, что известно, — текущее время.
 */
const hasDuration = computed(() => Number.isFinite(duration.value) && duration.value > 0)

const played = computed(() => progressPercent(current.value, duration.value))
const buffered = computed(() => bufferedPercent(videoEl.value?.buffered ?? null, current.value, duration.value))
const timeLabel = computed(() => (
  hasDuration.value
    ? `${formatTime(current.value)} / ${formatTime(duration.value)}`
    : formatTime(current.value)
))

function toggle(): void {
  const video = videoEl.value
  if (!video || props.disabled)
    return

  if (video.paused)
    void video.play().catch(error => emit('error', error))
  else
    video.pause()
}

function seekTo(seconds: number): void {
  const video = videoEl.value
  if (!video || props.disabled)
    return

  video.currentTime = clampTime(seconds, duration.value)
}

function seekBy(delta: number): void {
  seekTo(current.value + delta)
}

function toggleMuted(): void {
  const video = videoEl.value
  if (!video || props.disabled)
    return

  video.muted = !video.muted
  muted.value = video.muted
}

function requestFullscreen(): void {
  const video = videoEl.value
  if (!video || props.disabled)
    return

  // Полный экран запрашивается у **корня**, а не у `<video>`: у нативного
  // элемента браузер показывает свои элементы управления, и наши, вместе с
  // клавиатурой и подписями, исчезли бы ровно там, где нужнее всего.
  void video.parentElement?.requestFullscreen?.().catch(error => emit('error', error))
}

/** Позиция клика по дорожке — доля её ширины. */
function seekFromPointer(event: PointerEvent): void {
  const track = event.currentTarget as HTMLElement | null
  if (!track || duration.value <= 0)
    return

  const bounds = track.getBoundingClientRect()
  seekTo((event.clientX - bounds.left) / bounds.width * duration.value)
}

function onKeydown(event: KeyboardEvent): void {
  const handlers: Record<string, () => void> = {
    ' ': toggle,
    'k': toggle,
    'ArrowLeft': () => seekBy(-props.seekStep),
    'ArrowRight': () => seekBy(props.seekStep),
    'Home': () => seekTo(0),
    'End': () => seekTo(duration.value),
    'm': toggleMuted,
    'f': requestFullscreen,
  }

  const handler = handlers[event.key] ?? handlers[event.key.toLowerCase()]
  if (!handler)
    return

  event.preventDefault()
  handler()
}

function bindVideo(): void {
  const video = videoEl.value
  if (!video)
    return

  video.addEventListener('loadedmetadata', () => {
    duration.value = video.duration
    failed.value = false
  })
  video.addEventListener('timeupdate', () => {
    current.value = video.currentTime
    emit('timeupdate', video.currentTime)
  })
  video.addEventListener('play', () => {
    playing.value = true
    emit('play')
  })
  video.addEventListener('pause', () => {
    playing.value = false
    emit('pause')
  })
  video.addEventListener('ended', () => {
    playing.value = false
    emit('ended')
  })
  video.addEventListener('error', (event) => {
    failed.value = true
    emit('error', event)
  })
}

onMounted(() => {
  bindVideo()

  if (props.autoplay && videoEl.value)
    void videoEl.value.play().catch(error => emit('error', error))
})

// Воспроизведение обязано прекращаться вместе с компонентом: иначе звук
// продолжает идти на странице, которой уже нет.
onBeforeUnmount(() => {
  videoEl.value?.pause()
})

defineExpose({ play: toggle, seekTo, toggleMuted, current, duration })
</script>

<template>
  <div
    :class="rootClass"
    :style="{ aspectRatio: String(aspectRatio) }"
    role="group"
    :aria-label="ariaLabel ?? t('grMedia.player.label', 'Video player')"
    tabindex="0"
    @keydown="onKeydown"
  >
    <video
      ref="videoEl"
      :class="videoClass"
      :src="src ?? undefined"
      :poster="poster"
      :loop="loop"
      :muted="muted"
      playsinline
    />

    <div v-if="failed" :class="stateLayerClass">
      <p :class="sizeTextClass[resolvedSize]">
        {{ t('grMedia.player.error', 'The video could not be played.') }}
      </p>
    </div>

    <div :class="controlsClass">
      <slot name="controls" :playing="playing" :current="current" :duration="duration" :toggle="toggle">
        <div
          v-if="hasDuration"
          :class="trackClass"
          role="slider"
          :aria-label="t('grMedia.player.seek', 'Position')"
          :aria-valuemin="0"
          :aria-valuemax="Math.round(duration)"
          :aria-valuenow="Math.round(current)"
          :aria-valuetext="timeLabel"
          :tabindex="disabled ? -1 : 0"
          @pointerdown="seekFromPointer"
          @keydown.stop="onKeydown"
        >
          <div :class="bufferedClass" :style="{ width: `${buffered}%` }" />
          <div :class="playedClass" :style="{ width: `${played}%` }" />
        </div>

        <div :class="rowClass">
          <button
            type="button"
            :class="buttonClass"
            :disabled="disabled"
            :aria-label="playing ? t('grMedia.player.pause', 'Pause') : t('grMedia.player.play', 'Play')"
            @click="toggle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path :d="playing ? pauseIconPath : playIconPath" />
            </svg>
          </button>

          <button
            type="button"
            :class="buttonClass"
            :disabled="disabled"
            :aria-label="muted ? t('grMedia.player.unmute', 'Unmute') : t('grMedia.player.mute', 'Mute')"
            @click="toggleMuted"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="muted ? volumeOffIconPath : volumeOnIconPath" />
            </svg>
          </button>

          <span :class="[timeClass, sizeTextClass[resolvedSize]]">{{ timeLabel }}</span>

          <button
            type="button"
            class="ml-auto" :class="[buttonClass]"
            :disabled="disabled"
            :aria-label="t('grMedia.player.fullscreen', 'Full screen')"
            @click="requestFullscreen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="fullscreenIconPath" />
            </svg>
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>
