<script setup lang="ts">
import { computed, markRaw, ref, watch, type Component } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'
import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'

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
  filePreviewMediaLoadingClass,
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
  /**
   * Куда открывать ссылку. Объявлен пропом, а не оставлен на fallthrough:
   * иначе `_blank` уезжал бы на `<a>` мимо компонента, и защитный `rel`
   * подставить было бы негде.
   */
  target?: string
  /** Своё значение `rel`. Задано — отменяет автоподстановку. */
  rel?: string
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
  target: undefined,
  rel: undefined,
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
 * Состояний три, а не два. Сорвавшаяся загрузка деградирует в заглушку: превью
 * может исчезнуть с диска, и «сломанная картинка» здесь не информативнее
 * иконки. Отдельное `loading` нужно ленте вложений: два десятка плиток
 * приезжают вразнобой, и без него сетка стоит дырами непонятной природы —
 * «ещё едет» и «файл без превью» выглядят одинаково.
 */
type ImageState = 'loading' | 'loaded' | 'error'

const imageState = ref<ImageState>('loading')

// Новая ссылка не должна наследовать ни ошибку прошлой, ни её готовность.
watch(() => props.src, () => {
  imageState.value = 'loading'
})

const showImage = computed(() => (
  isPreviewableKind(kind.value) && Boolean(props.src) && imageState.value !== 'error'
))

const showSkeleton = computed(() => showImage.value && imageState.value === 'loading')

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
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)
  if (props.href)
    return 'a'
  return props.clickable ? 'button' : 'div'
})

/**
 * Ссылка, открывающаяся в новой вкладке, получает защиту без спроса — по факту
 * `_blank`, а не по отдельному пропу: то же правило, что у `GrLink` и
 * `GrButton`. Без `rel` открытая страница получает `window.opener` и может
 * переписать вкладку-источник.
 */
const resolvedRel = computed(() => props.rel ?? (props.target === '_blank' ? 'noopener noreferrer' : undefined))

/**
 * Компонент-ссылка (`Link` от Inertia, `RouterLink`) рендерит `<a>` сам, и без
 * `href` он ведёт в никуда. Строковый тег, кроме `a`, ссылочных атрибутов не
 * понимает — там они и гасятся.
 */
const isAnchorLike = computed(() => typeof rootTag.value !== 'string' || rootTag.value === 'a')

const rootHref = computed(() => (isAnchorLike.value ? props.href : undefined))
const rootTarget = computed(() => (isAnchorLike.value ? props.target : undefined))
const rootRel = computed(() => (isAnchorLike.value ? resolvedRel.value : undefined))

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
    :target="rootTarget"
    :rel="rootRel"
    :class="rootClass"
    :style="rootStyle"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <GrSkeleton
      v-if="showSkeleton"
      data-gr-file-preview-skeleton
      width="100%"
      height="100%"
      rounded="var(--gr-file-preview-radius, var(--gr-radius-md))"
    />

    <!--
      Условие — `showImage`, а не «картинка готова»: убери её из дерева на
      время загрузки, и браузер не начнёт качать, а `load` не придёт никогда.
      Поэтому она ждёт невидимой и вне потока — иначе поделила бы плитку со
      скелетом как второй flex-элемент.
    -->
    <img
      v-if="showImage"
      :key="src ?? ''"
      data-gr-file-preview-image
      :src="src ?? undefined"
      :alt="alt"
      :loading="resolvedLoading"
      :class="[filePreviewMediaClass, showSkeleton ? filePreviewMediaLoadingClass : '']"
      @load="imageState = 'loaded'"
      @error="imageState = 'error'"
    >

    <span v-else data-gr-file-preview-fallback :class="filePreviewFallbackClass">
      <component :is="fallbackIcon" :class="filePreviewIconClass" aria-hidden="true" />
      <span v-if="name" data-gr-file-preview-label :class="filePreviewLabelClass">{{ name }}</span>
    </span>
  </component>
</template>
