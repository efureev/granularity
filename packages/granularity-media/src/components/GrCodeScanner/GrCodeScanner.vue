<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGrComponentSize } from '@feugene/granularity/composables/useGrComponentConfig'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import { useCameraStream } from '../../internal/useCameraStream'
import type { GrCameraStatus } from '../GrCameraCapture/cameraState'
import type { GrCodeDetector, GrCodeResult } from './codeDetection'
import { createNativeDetector, freshCodes, nativeDetectorSupported } from './codeDetection'
import type { GrCodeScannerSize } from './grCodeScannerStyles'
import {
  controlsClass,
  frameClass,
  reticleClass,
  rootClass,
  sizeTextClass,
  stateLayerClass,
  stateTextClass,
  videoClass,
} from './grCodeScannerStyles'

export interface GrCodeScannerProps {
  /** Какая камера: `environment` — тыловая, ей и сканируют. */
  facing?: 'user' | 'environment'
  deviceId?: string
  /**
   * Включать камеру сразу.
   *
   * По умолчанию `false`: запрос разрешения без действия пользователя
   * отклоняют не глядя, а второй раз браузер уже не спросит.
   */
  autoStart?: boolean
  /** Символики: `qr_code`, `ean_13`, `code_128`, … Без списка — все, что умеет браузер. */
  formats?: readonly string[]
  /**
   * Детектор для браузеров без `BarcodeDetector` — Safari и Firefox.
   *
   * Пакет своего декодера не несёт: у него нет ни одной зависимости, и ради
   * одного компонента появилась бы самая тяжёлая. Рецепт подключения готовой
   * библиотеки — на странице компонента.
   */
  detector?: GrCodeDetector
  /** Как часто разбирать кадр, мс. Чаще — горячее устройство, реже — вялый отклик. */
  interval?: number
  /** Сообщать один и тот же код повторно: приёмка сканирует подряд. */
  continuous?: boolean
  size?: GrCodeScannerSize
  disabled?: boolean
  ariaLabel?: string
}

export interface GrCodeScannerEmits {
  (e: 'detect', codes: GrCodeResult[]): void
  (e: 'start'): void
  (e: 'stop'): void
  (e: 'statusChange', status: GrCameraStatus): void
}

const props = withDefaults(defineProps<GrCodeScannerProps>(), {
  facing: 'environment',
  deviceId: undefined,
  autoStart: false,
  formats: undefined,
  detector: undefined,
  interval: 250,
  continuous: false,
  // `undefined`, а не `md`: настоящий дефолт живёт в `useGrComponentSize`.
  size: undefined,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<GrCodeScannerEmits>()

defineSlots<{
  /** Своя панель управления вместо встроенной. */
  controls?: (props: { status: GrCameraStatus, start: () => void, stop: () => void }) => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCodeScanner' })

const videoEl = ref<HTMLVideoElement | null>(null)
const detector = shallowRef<GrCodeDetector | null>(null)
const lastCodes = shallowRef<GrCodeResult[]>([])

const camera = useCameraStream({
  video: videoEl,
  disabled: () => props.disabled,
  facing: () => props.facing,
  deviceId: () => props.deviceId,
  onStatus: next => emit('statusChange', next),
  onStart: () => {
    lastCodes.value = []
    scheduleScan()
    emit('start')
  },
  onStop: () => emit('stop'),
})

const { frameRatio, isLive, message: cameraMessage, start, status, stop } = camera

/** Разбирать кадр нечем: ни нативного API, ни детектора от приложения. */
const undetectable = computed(() => !props.detector && !nativeDetectorSupported())

const stateMessage = computed(() => {
  if (undetectable.value) {
    return t(
      'grMedia.scanner.unsupported',
      'This browser cannot read codes. Pass a `detector` to enable it.',
    )
  }

  return cameraMessage.value
})

function resolveDetector(): GrCodeDetector | null {
  // Проп сильнее нативного пути: приложение, подключившее свою библиотеку,
  // обычно делает это ради формата, которого нативный не знает.
  return props.detector ?? createNativeDetector(props.formats)
}

let timer: ReturnType<typeof setTimeout> | null = null
/**
 * Цикл живой.
 *
 * Одного `clearTimeout` мало: разбор кадра асинхронный, и `tick`, ушедший в
 * `await` до остановки, вернётся уже после неё и запланирует следующий заход.
 * Таймер после этого переживает и остановку, и размонтирование — то есть течёт
 * на странице, которой больше нет.
 */
let scanning = false

async function scanFrame(): Promise<void> {
  const video = videoEl.value
  if (!video || !isLive.value || props.disabled)
    return

  detector.value ??= resolveDetector()
  if (!detector.value)
    return

  try {
    const found = await detector.value(video)
    const fresh = freshCodes(lastCodes.value, found, props.continuous)
    lastCodes.value = found

    if (fresh.length > 0) {
      emit('detect', fresh)
      announce(t('grMedia.scanner.detected', 'Code recognised'))
    }
  }
  catch {
    // Кадр не разобрался — это норма, а не сбой: в объектив попала рука,
    // отражение, размытие. Следующий кадр придёт через `interval`.
  }
}

function scheduleScan(): void {
  if (scanning)
    return

  scanning = true

  const tick = async () => {
    if (!scanning)
      return

    await scanFrame()

    if (!scanning || !isLive.value) {
      timer = null
      scanning = false

      return
    }

    timer = setTimeout(() => void tick(), props.interval)
  }

  timer = setTimeout(() => void tick(), props.interval)
}

function stopScanning(): void {
  scanning = false

  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

onMounted(() => {
  if (props.autoStart)
    void start()
})

onBeforeUnmount(stopScanning)

function stopAll(): void {
  stopScanning()
  stop()
}

defineExpose({ start, stop: stopAll, status })
</script>

<template>
  <div :class="rootClass" role="group" :aria-label="ariaLabel ?? t('grMedia.scanner.label', 'Code scanner')">
    <div :class="frameClass" :style="{ aspectRatio: String(frameRatio) }">
      <video
        ref="videoEl"
        :class="videoClass"
        playsinline
        muted
        autoplay
      />

      <div v-if="isLive && !undetectable" :class="reticleClass" />

      <div v-if="!isLive || undetectable" :class="stateLayerClass">
        <p :class="[stateTextClass, sizeTextClass[resolvedSize]]">
          {{ stateMessage }}
        </p>

        <GrButton
          v-if="!undetectable && status !== 'starting' && status !== 'insecure' && status !== 'missing'"
          :size="resolvedSize"
          :disabled="disabled"
          @click="start"
        >
          {{ status === 'idle' ? t('grMedia.scanner.start', 'Start scanning') : t('grMedia.camera.retry', 'Try again') }}
        </GrButton>
      </div>
    </div>

    <div :class="controlsClass">
      <slot name="controls" :status="status" :start="start" :stop="stopAll">
        <GrButton v-if="isLive" variant="outline" :size="resolvedSize" :disabled="disabled" @click="stopAll">
          {{ t('grMedia.scanner.stop', 'Stop') }}
        </GrButton>
      </slot>
    </div>
  </div>
</template>
