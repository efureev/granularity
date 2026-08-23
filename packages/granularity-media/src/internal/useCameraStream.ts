import type { Ref } from 'vue'
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import type { GrCameraStatus } from '../components/GrCameraCapture/cameraState'
import { cameraStatusFromError, cameraSupported } from '../components/GrCameraCapture/cameraState'

/**
 * Поток камеры: запрос, состояния отказа, размеры кадра, остановка.
 *
 * Общий для съёмки и сканирования — у обоих одна и та же половина работы, и
 * дважды написанная она разъехалась бы на первом же исправлении: отказ, забытая
 * остановка дорожек, соотношение сторон до `loadedmetadata`. Компоненту
 * остаётся то, ради чего он существует: снять кадр или распознать код.
 */
export interface UseCameraStreamOptions {
  video: Ref<HTMLVideoElement | null>
  disabled: () => boolean
  facing: () => 'user' | 'environment'
  deviceId: () => string | undefined
  /** Пожелание камере, а не требование: см. `exact` ниже. */
  aspectRatio?: () => number | undefined
  onStatus?: (status: GrCameraStatus) => void
  onStart?: () => void
  onStop?: () => void
}

export function useCameraStream(options: UseCameraStreamOptions) {
  const { t } = useGranularityTranslations()
  const { announce } = useAnnouncer()

  const stream = shallowRef<MediaStream | null>(null)
  const status = ref<GrCameraStatus>('idle')
  /** Соотношение сторон потока: известно только после первого кадра. */
  const streamRatio = ref<number | null>(null)

  const isLive = computed(() => status.value === 'live')

  /**
   * Рамка следует **полученному** потоку, а не запрошенному соотношению:
   * камера вправе отдать своё, и показывать надо то, что она отдала.
   * Пока она молчит — 4:3, чтобы место в раскладке было видно.
   */
  const frameRatio = computed(() => streamRatio.value ?? 4 / 3)

  /** Подпись состояния: у каждого отказа своя причина и свой следующий шаг. */
  const message = computed(() => {
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
      case 'idle':
      case 'live':
      default:
        return t('grMedia.camera.idle', 'The camera is off.')
    }
  })

  function setStatus(next: GrCameraStatus): void {
    if (status.value === next)
      return

    status.value = next
    options.onStatus?.(next)
  }

  function readStreamRatio(): void {
    const video = options.video.value
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0)
      return

    streamRatio.value = video.videoWidth / video.videoHeight
  }

  function stopTracks(): void {
    // Живой трек держит индикатор камеры включённым, даже когда компонента уже
    // нет на экране: браузер гасит его только по `stop()` каждой дорожки.
    stream.value?.getTracks().forEach(track => track.stop())
    stream.value = null
    streamRatio.value = null

    if (options.video.value)
      options.video.value.srcObject = null
  }

  async function start(): Promise<void> {
    if (options.disabled() || status.value === 'starting' || status.value === 'live')
      return

    if (!cameraSupported(navigator)) {
      setStatus('insecure')

      return
    }

    setStatus('starting')

    try {
      const wanted = options.aspectRatio?.()
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          ...(options.deviceId()
            ? { deviceId: { exact: options.deviceId()! } }
            : { facingMode: options.facing() }),
          // Голое число — это `ideal`, то есть пожелание. `exact` здесь дал бы
          // `OverconstrainedError`, то есть состояние «камеры нет» на исправной
          // камере, которая просто умеет другое соотношение.
          ...(wanted ? { aspectRatio: wanted } : {}),
        },
        audio: false,
      })

      stream.value = media
      const video = options.video.value
      if (video) {
        video.srcObject = media
        // Размеры кадра приходят не сразу: до `loadedmetadata` они нули, и
        // соотношение, снятое раньше, было бы выдумкой.
        video.addEventListener('loadedmetadata', readStreamRatio, { once: true })
        await video.play().catch(() => undefined)
        readStreamRatio()
      }

      setStatus('live')
      options.onStart?.()
      announce(t('grMedia.camera.live', 'Camera is on'))
    }
    catch (error) {
      stopTracks()
      setStatus(cameraStatusFromError(error))
      announce(message.value, { politeness: 'assertive' })
    }
  }

  function stop(): void {
    if (!stream.value)
      return

    stopTracks()
    setStatus('idle')
    options.onStop?.()
  }

  // Поток обязан гаснуть вместе с компонентом: иначе индикатор камеры горит на
  // странице, где его уже нет.
  onBeforeUnmount(stopTracks)

  return { status, streamRatio, frameRatio, isLive, message, start, stop }
}
