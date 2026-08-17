<script setup lang="ts">
import { computed, markRaw, ref, watch, type Component } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

import IconFile from '~icons/lucide/file'
import IconFileArchive from '~icons/lucide/file-archive'
import IconFileSpreadsheet from '~icons/lucide/file-spreadsheet'
import IconFileText from '~icons/lucide/file-text'
import IconFileType from '~icons/lucide/file-type'
import IconImageOff from '~icons/lucide/image-off'

import type { GrSizeWithPx } from '../shared/sizes'

import { fileKindOf, isPreviewableKind, type GrFileKind } from './fileKindOf'
import {
  filePreviewFallbackClass,
  filePreviewIconClass,
  filePreviewInteractiveClass,
  filePreviewLabelClass,
  filePreviewMediaClass,
  filePreviewRatioClass,
  filePreviewRootClass,
  filePreviewTileWidths,
  type GrFilePreviewRatio,
} from './grFilePreviewStyles'

export type { GrFileKind } from './fileKindOf'
export type { GrFilePreviewRatio } from './grFilePreviewStyles'

/**
 * Плитка превью файла с фолбэком по типу.
 *
 * Показывает **сохранённый** файл, а не отправляет новый: отправка — это
 * `GrFormFile` и `GrFileUpload`. Просмотрщик во весь экран открывает
 * потребитель по событию `click`.
 */
export interface GrFilePreviewProps {
  /** Адрес превью. Пусто — сразу заглушка по типу. */
  src?: string | null
  /** MIME-тип. Он решает, картинка это или файл. */
  mime?: string | null
  /** Имя файла: доступное имя картинки и подпись заглушки. */
  name?: string | null
  /**
   * Ступень канонической шкалы либо произвольная ширина в пикселях. Число —
   * escape-hatch, как диаметр у GrAvatar: плитка 96px в ленте вложений в
   * четыре ступени не укладывается.
   */
  tileSize?: GrSizeWithPx
  ratio?: GrFilePreviewRatio
  /** Ссылка на оригинал — для не-картинок и для перехода мимо просмотрщика. */
  href?: string
  /** Свой корневой тег (`RouterLink`, `Link` от Inertia). Сильнее `href`. */
  as?: string | Component
  /** Плитка кликабельна и эмитит `click` — обычно чтобы открыть просмотрщик. */
  clickable?: boolean
  loading?: 'lazy' | 'eager'
  /**
   * Доступное имя интерактивной плитки. Не задано — имя приходит из содержимого:
   * `alt` картинки или подписи заглушки.
   */
  ariaLabel?: string
}

export interface GrFilePreviewEmits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<GrFilePreviewProps>(), {
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем компонент
  // заглянет в `GrConfigProvider`.
  src: undefined,
  mime: undefined,
  name: undefined,
  tileSize: undefined,
  ratio: undefined,
  href: undefined,
  as: undefined,
  clickable: false,
  loading: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<GrFilePreviewEmits>()

const resolvedTileSize = useGrComponentProp('GrFilePreview', 'tileSize', () => props.tileSize, 'md')
const resolvedRatio = useGrComponentProp('GrFilePreview', 'ratio', () => props.ratio, '1:1')
const resolvedLoading = useGrComponentProp('GrFilePreview', 'loading', () => props.loading, 'lazy')

const kind = computed<GrFileKind>(() => fileKindOf(props.mime))

/**
 * Сорвавшаяся загрузка деградирует в ту же заглушку: превью может исчезнуть с
 * диска, и «сломанная картинка» здесь не информативнее иконки.
 */
const failed = ref(false)

// Новая ссылка не должна наследовать ошибку прошлой.
watch(() => props.src, () => { failed.value = false })

const showImage = computed(() => (
  isPreviewableKind(kind.value) && Boolean(props.src) && !failed.value
))

/**
 * Иконка вида. Картинка попадает сюда только сорвавшейся загрузкой — тогда и
 * значок другой: «изображение не открылось», а не «это файл».
 */
const iconByKind: Record<GrFileKind, Component> = {
  image: markRaw(IconImageOff),
  pdf: markRaw(IconFileText),
  document: markRaw(IconFileType),
  spreadsheet: markRaw(IconFileSpreadsheet),
  archive: markRaw(IconFileArchive),
  unknown: markRaw(IconFile),
}

const fallbackIcon = computed(() => iconByKind[kind.value])

const isInteractive = computed(() => Boolean(props.as) || Boolean(props.href) || props.clickable)

const rootTag = computed<string | Component>(() => {
  if (props.as) return typeof props.as === 'string' ? props.as : markRaw(props.as)
  if (props.href) return 'a'
  return props.clickable ? 'button' : 'div'
})

/**
 * Компонент-ссылка (`Link` от Inertia, `RouterLink`) рендерит `<a>` сам, и без
 * `href` он ведёт в никуда. Строковый тег, кроме `a`, атрибут не понимает —
 * там он и гасится.
 */
const rootHref = computed(() => (
  typeof rootTag.value === 'string' && rootTag.value !== 'a' ? undefined : props.href
))

const rootClass = computed(() => [
  filePreviewRootClass,
  filePreviewRatioClass[resolvedRatio.value],
  typeof resolvedTileSize.value === 'number' ? '' : filePreviewTileWidths[resolvedTileSize.value],
  isInteractive.value ? filePreviewInteractiveClass : '',
].filter(Boolean).join(' '))

const rootStyle = computed(() => (
  typeof resolvedTileSize.value === 'number' ? { width: `${resolvedTileSize.value}px` } : undefined
))

/**
 * `alt` не выдумывается. Есть имя — оно и есть `alt`; нет — картинка
 * декоративна, и придуманное компонентом описание было бы хуже пустого.
 */
const alt = computed(() => props.name ?? '')

function onClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <component
    :is="rootTag"
    data-gr-file-preview
    :data-kind="kind"
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootHref"
    :class="rootClass"
    :style="rootStyle"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <img
      v-if="showImage"
      :key="src ?? ''"
      data-gr-file-preview-image
      :src="src ?? undefined"
      :alt="alt"
      :loading="resolvedLoading"
      :class="filePreviewMediaClass"
      @error="failed = true"
    >

    <span v-else data-gr-file-preview-fallback :class="filePreviewFallbackClass">
      <component :is="fallbackIcon" :class="filePreviewIconClass" aria-hidden="true" />
      <span v-if="name" data-gr-file-preview-label :class="filePreviewLabelClass">{{ name }}</span>
    </span>
  </component>
</template>
