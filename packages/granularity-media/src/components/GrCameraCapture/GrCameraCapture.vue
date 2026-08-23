<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { GrCameraStatus } from './cameraState'
import { cameraFrameRect, cameraStatusFromError, cameraSupported, shouldMirrorPreview } from './cameraState'
import type { GrCameraCaptureSize, GrCameraFacing } from './grCameraCaptureStyles'
import {
  controlsClass,
  frameClass,
  mirroredClass,
  rootClass,
  sizeTextClass,
  stateLayerClass,
  stateTextClass,
  videoClass,
} from './grCameraCaptureStyles'

export interface GrCameraCaptureOutput {
  width?: number
  height?: number
  type?: string
  quality?: number
}

export interface GrCameraCaptureProps {
  /** Какая камера: `user` — фронтальная, `environment` — тыловая. */
  facing?: GrCameraFacing
  /** Конкретное устройство, если приложение его уже выбрало. */
  deviceId?: string
  /**
   * Включать камеру сразу.
   *
   * По умолчанию `false`: запрос разрешения без действия пользователя
   * отклоняют не глядя, а второй раз браузер уже не спросит.
   */
  autoStart?: boolean
  aspectRatio?: number
  /** Зеркалить превью. По умолчанию — только фронтальную камеру. */
  mirror?: boolean
  output?: GrCameraCaptureOutput
  size?: GrCameraCaptureSize
  disabled?: boolean
  ariaLabel?: string
}

export interface GrCameraCaptureEmits {
  (e: 'capture', blob: Blob): void
  (e: 'start'): void
  (e: 'stop'): void
  (e: 'statusChange', status: GrCameraStatus): void
}

const props = withDefaults(defineProps<GrCameraCaptureProps>(), {
  facing: 'user',
  deviceId: undefined,
  autoStart: false,
  aspectRatio: 4 / 3,
  mirror: undefined,
  output: undefined,
  // `undefined`, а не `md`: настоящий дефолт живёт в `useGrComponentSize`.
  size: undefined,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrCameraCaptureEmits>()

defineSlots<{
  /** Своя панель управления вместо встроенной. */
  controls?: (props: { status: GrCameraStatus, start: () => void, stop: () => void, capture: () => Promise<Blob | null> }) => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCameraCapture' })

const videoEl = ref<HTMLVideoElement | null>(null)
const stream = shallowRef<MediaStream | null>(null)
const status = ref<GrCameraStatus>('idle')

const mirrored = computed(() => shouldMirrorPreview(props.facing, props.mirror))
const isLive = computed(() => status.value === 'live')

/** Подпись состояния: у каждого отказа своя причина и свой следующий шаг. */
const stateMessage = computed(() => {
  switch (status.value) {
    case 'starting':
      return t('grMedia.camera.starting', 'Requesting camera access…')
    case 'denied':
      return t('grMedia.camera.denied', 'Camera access is blocked. Allow it in the browser settings for this site.')
    case 'missing':
      return t('grMedia.camera.missing', 'No camera found on this device.')
    case 'busy':
      return t('grMedia.camera.busy', 'The camera is busy in another application.')
    case 'insecure':
      return t('grMedia.camera.insecure', 'The camera works only over HTTPS.')
    case 'error':
      return t('grMedia.camera.error', 'The camera could not be started.')
    default:
      return t('grMedia.camera.idle', 'The camera is off.')
  }
})

function setStatus(next: GrCameraStatus): void {
  if (status.value === next)
    return

  status.value = next
  emit('statusChange', next)
}

function stopTracks(): void {
  // Живой трек держит индикатор камеры включённым, даже когда компонента уже
  // нет на экране: браузер гасит его только по `stop()` каждой дорожки.
  stream.value?.getTracks().forEach(track => track.stop())
  stream.value = null

  if (videoEl.value)
    videoEl.value.srcObject = null
}

async function start(): Promise<void> {
  if (props.disabled || status.value === 'starting' || status.value === 'live')
    return

  if (!cameraSupported(navigator)) {
    setStatus('insecure')

    return
  }

  setStatus('starting')

  try {
    const media = await navigator.mediaDevices.getUserMedia({
      video: props.deviceId
        ? { deviceId: { exact: props.deviceId } }
        : { facingMode: props.facing },
      audio: false,
    })

    stream.value = media
    if (videoEl.value) {
      videoEl.value.srcObject = media
      await videoEl.value.play().catch(() => undefined)
    }

    setStatus('live')
    emit('start')
    announce(t('grMedia.camera.live', 'Camera is on'))
  }
  catch (error) {
    stopTracks()
    setStatus(cameraStatusFromError(error))
    announce(stateMessage.value, { politeness: 'assertive' })
  }
}

function stop(): void {
  if (!stream.value)
    return

  stopTracks()
  setStatus('idle')
  emit('stop')
}

/**
 * Снимок текущего кадра.
 *
 * Зеркало превью сюда **не переносится**: на снимке оказывается то, что было
 * перед камерой. Иначе текст на визитке или в документе уехал бы в зазеркалье —
 * а снимают ими ровно это.
 */
async function capture(): Promise<Blob | null> {
  const video = videoEl.value
  if (!video || !isLive.value)
    return null

  const frame = { width: video.videoWidth, height: video.videoHeight }
  const rect = cameraFrameRect(frame, props.aspectRatio)
  if (rect.sw <= 0)
    return null

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(props.output?.width ?? rect.sw))
  canvas.height = Math.max(1, Math.round(props.output?.height ?? rect.sh))

  const context = canvas.getContext('2d')
  if (!context)
    return null

  context.drawImage(video, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, props.output?.type ?? 'image/jpeg', props.output?.quality ?? 0.92)
  })

  if (blob) {
    emit('capture', blob)
    announce(t('grMedia.camera.captured', 'Photo taken'))
  }

  return blob
}

onMounted(() => {
  if (props.autoStart)
    void start()
})

// Поток обязан гаснуть вместе с компонентом: иначе индикатор камеры горит на
// странице, где её уже нет.
onBeforeUnmount(stopTracks)

defineExpose({ start, stop, capture, status })
</script>

<template>
  <div :class="rootClass" role="group" :aria-label="ariaLabel ?? t('grMedia.camera.label', 'Camera')">
    <div :class="frameClass" :style="{ aspectRatio: String(aspectRatio) }">
      <video
        ref="videoEl"
        :class="[videoClass, mirrored ? mirroredClass : '']"
        playsinline
        muted
        autoplay
      />

      <div v-if="!isLive" :class="stateLayerClass">
        <p :class="[stateTextClass, sizeTextClass[resolvedSize]]">
          {{ stateMessage }}
        </p>

        <GrButton
          v-if="status !== 'starting' && status !== 'insecure' && status !== 'missing'"
          :size="resolvedSize"
          :disabled="disabled"
          @click="start"
        >
          {{ status === 'idle' ? t('grMedia.camera.start', 'Turn on camera') : t('grMedia.camera.retry', 'Try again') }}
        </GrButton>
      </div>
    </div>

    <div :class="controlsClass">
      <slot name="controls" :status="status" :start="start" :stop="stop" :capture="capture">
        <GrButton :size="resolvedSize" :disabled="disabled || !isLive" @click="capture">
          {{ t('grMedia.camera.capture', 'Take photo') }}
        </GrButton>
        <GrButton v-if="isLive" variant="outline" :size="resolvedSize" :disabled="disabled" @click="stop">
          {{ t('grMedia.camera.stop', 'Turn off') }}
        </GrButton>
      </slot>
    </div>
  </div>
</template>
