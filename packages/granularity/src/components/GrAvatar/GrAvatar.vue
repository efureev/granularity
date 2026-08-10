<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'

import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrSizeWithPx } from '../shared/sizes'

import { GR_AVATAR_GROUP_KEY } from './avatarContext'
import {
  avatarFontSizePx,
  grAvatarClass,
  initialsFrom,
  mediaClass,
  rootBaseClass,
  rootStatusClass,
  statusDotClass,
  statusToneClass,
  type GrAvatarShape,
  type GrAvatarStatus,
} from './grAvatarStyles'

export type { GrAvatarShape, GrAvatarStatus } from './grAvatarStyles'

/** Диаметр аватара для каждой ступени канонической шкалы. */
const GR_AVATAR_SIZE_PX = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
} as const

export interface GrAvatarProps {
  /**
   * Размер по канонической шкале (`xs|sm|md|lg`) — тогда работает
   * `GrConfigProvider`. Число — escape-hatch: аватар нужен произвольного
   * диаметра (24px в строке списка, 96px в профиле), и четыре ступени шкалы
   * этого не закрывают.
   */
  size?: GrSizeWithPx
  src?: string
  /** Резервная картинка: показывается, когда `src` не загрузился. */
  fallbackSrc?: string
  alt?: string
  /** Имя участника: даёт инициалы и доступное имя аватара. */
  name?: string
  shape?: GrAvatarShape
  /** Статус участника. Точка декоративна — рядом идёт скрытая подпись. */
  status?: GrAvatarStatus
}

const props = withDefaults(defineProps<GrAvatarProps>(), {
  size: undefined,
  src: undefined,
  fallbackSrc: undefined,
  alt: undefined,
  name: undefined,
  // Дефолт живёт в резолвере: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  shape: undefined,
  status: undefined,
})

const slots = defineSlots<{
  /** Содержимое вместо картинки и инициалов. */
  default?: () => unknown
}>()

const { t } = useGranularityTranslations()
const group = inject(GR_AVATAR_GROUP_KEY, null)

// Размер и форма группы сильнее провайдера, но слабее собственного пропа.
const localSize = computed(() => props.size ?? group?.size)

const resolvedScaleSize = useGrComponentSize(
  () => (typeof localSize.value === 'number' ? undefined : localSize.value),
  { component: 'GrAvatar' },
)

const resolvedShape = useGrComponentProp(
  'GrAvatar',
  'shape',
  () => props.shape ?? group?.shape,
  'circle',
)

const sizePx = computed(() => (
  typeof localSize.value === 'number' ? localSize.value : GR_AVATAR_SIZE_PX[resolvedScaleSize.value]
))

const style = computed(() => {
  const px = `${sizePx.value}px`
  // Кегль на корне, а не на span инициалов: так он достаётся и слотовому тексту.
  return { width: px, height: px, fontSize: `${avatarFontSizePx(sizePx.value)}px` }
})

/**
 * Состояние картинки. Без него битая ссылка оставляла `v-if="src"` истинным:
 * браузер рисовал сломанное изображение, а запасной вариант не показывался
 * никогда.
 */
type ImageState = 'loading' | 'loaded' | 'error'

const primaryState = ref<ImageState>('loading')
const fallbackState = ref<ImageState>('loading')

// Новая ссылка не должна наследовать ошибку прошлой.
watch(() => props.src, () => { primaryState.value = 'loading' })
watch(() => props.fallbackSrc, () => { fallbackState.value = 'loading' })

const activeSrc = computed(() => {
  if (props.src && primaryState.value !== 'error') return props.src
  if (props.fallbackSrc && fallbackState.value !== 'error') return props.fallbackSrc
  return undefined
})

const isFallbackActive = computed(() => Boolean(activeSrc.value) && activeSrc.value !== props.src)

// Скелет держит место, пока картинка едет: иначе ряд аватаров мигает пустотой.
const showSkeleton = computed(() => {
  if (!activeSrc.value) return false
  return (isFallbackActive.value ? fallbackState.value : primaryState.value) === 'loading'
})

const initials = computed(() => (props.name ? initialsFrom(props.name) : ''))

// Пусто — когда нет ни картинки, ни слота, ни имени.
const showInitials = computed(() => !activeSrc.value && !slots.default && Boolean(initials.value))

const statusLabel = computed(() => (props.status
  ? t(`gr.avatar.status.${props.status}`, props.status)
  : undefined))

/**
 * Доступное имя: `alt` сильнее всего, иначе имя участника.
 *
 * Когда есть картинка, имя несёт её `alt` — так привычнее потребителю и не
 * возникает двойного объявления. Без картинки роль и имя берёт на себя корень:
 * иначе аватар с инициалами остался бы для диктора пустым.
 */
const accessibleName = computed(() => props.alt ?? props.name ?? '')

const rootIsImage = computed(() => !activeSrc.value && accessibleName.value !== '')

const rootClass = computed(() => [
  rootBaseClass,
  grAvatarClass(resolvedShape.value),
  props.status ? rootStatusClass : '',
])

function onError(kind: 'primary' | 'fallback'): void {
  if (kind === 'primary') primaryState.value = 'error'
  else fallbackState.value = 'error'
}

function onLoad(kind: 'primary' | 'fallback'): void {
  if (kind === 'primary') primaryState.value = 'loaded'
  else fallbackState.value = 'loaded'
}
</script>

<template>
  <span
    data-gr-avatar
    :style="style"
    :class="rootClass"
    :role="rootIsImage ? 'img' : undefined"
    :aria-label="rootIsImage ? accessibleName : undefined"
  >
    <span :class="[mediaClass, grAvatarClass(resolvedShape)]">
      <GrSkeleton
        v-if="showSkeleton"
        data-gr-avatar-skeleton
        width="100%"
        height="100%"
        :rounded="resolvedShape === 'circle' ? 'var(--gr-radius-full)' : 'var(--gr-avatar-square-radius, 10px)'"
      />

      <img
        v-if="activeSrc"
        :key="activeSrc"
        data-gr-avatar-image
        :src="activeSrc"
        :alt="accessibleName"
        class="h-full w-full object-cover"
        :class="showSkeleton ? 'invisible absolute' : ''"
        @error="onError(isFallbackActive ? 'fallback' : 'primary')"
        @load="onLoad(isFallbackActive ? 'fallback' : 'primary')"
      >

      <span v-else-if="showInitials" data-gr-avatar-initials>{{ initials }}</span>

      <slot v-else />
    </span>

    <template v-if="status">
      <span
        data-gr-avatar-status
        :class="[statusDotClass, statusToneClass[status]]"
        aria-hidden="true"
      />
      <!-- Цвет точки смысл не передаёт: статус объявляется словом (WCAG 1.4.1). -->
      <span data-gr-avatar-status-label class="sr-only">{{ statusLabel }}</span>
    </template>
  </span>
</template>
