<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { GrCameraStatus } from './cameraState'
import { outputSize } from '../../internal/outputSize'
import { useCameraStream } from '../../internal/useCameraStream'
import { shouldMirrorPreview } from './cameraState'
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
   * Пожелание камере: какое соотношение сторон запросить у устройства.
   *
   * Это **не обрезка**. Камера, которая умеет запрошенное, отдаст его сама;
   * та, что не умеет, отдаст своё — и показан, и снят будет её настоящий кадр.
   * Нужен ровно квадрат — это `GrImageCrop` после съёмки.
   */
  aspectRatio?: number
  /**
   * Включать камеру сразу.
   *
   * По умолчанию `false`: запрос разрешения без действия пользователя
   * отклоняют не глядя, а второй раз браузер уже не спросит.
   */
  autoStart?: boolean
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
  aspectRatio: undefined,
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
// Живой регион про сам снимок: поток о себе сообщает изнутри композабла.
const { announce } = useAnnouncer()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCameraCapture' })

const videoEl = ref<HTMLVideoElement | null>(null)

const camera = useCameraStream({
  video: videoEl,
  disabled: () => props.disabled,
  facing: () => props.facing,
  deviceId: () => props.deviceId,
  aspectRatio: () => props.aspectRatio,
  onStatus: next => emit('statusChange', next),
  onStart: () => emit('start'),
  onStop: () => emit('stop'),
})

const { frameRatio, isLive, message: stateMessage, start, status, stop } = camera

const mirrored = computed(() => shouldMirrorPreview(props.facing, props.mirror))

/**
 * Снимок текущего кадра — целиком, без среза.
 *
 * Камеры на разных устройствах отдают разные размеры и соотношения, поэтому
 * подгонять кадр под окно бессмысленно: на одном телефоне срезалось бы одно, на
 * другом другое. Снимок повторяет то, что показывало превью, а обрезка под
 * нужное место — работа `GrImageCrop`.
 *
 * Зеркало превью сюда **не переносится**: на снимке оказывается то, что было
 * перед камерой. Иначе текст на визитке или в документе уехал бы в зазеркалье —
 * а снимают ими ровно это.
 */
async function capture(): Promise<Blob | null> {
  const video = videoEl.value
  if (!video || !isLive.value)
    return null

  const rect = { sx: 0, sy: 0, sw: video.videoWidth, sh: video.videoHeight }
  if (rect.sw <= 0)
    return null

  const canvas = document.createElement('canvas')
  const size = outputSize(rect, props.output)
  canvas.width = size.width
  canvas.height = size.height

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

defineExpose({ start, stop, capture, status })
</script>

<template>
  <div :class="rootClass" role="group" :aria-label="ariaLabel ?? t('grMedia.camera.label', 'Camera')">
    <div :class="frameClass" :style="{ aspectRatio: String(frameRatio) }">
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
