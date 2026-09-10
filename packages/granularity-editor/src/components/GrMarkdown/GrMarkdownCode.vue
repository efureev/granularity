<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'
import { useGranularityTranslations } from '@feugene/granularity/composables/useGranularityTranslations'

import { copiedIconPaths, copyIconPaths } from './icons'

/**
 * Блок кода со своей рамкой.
 *
 * Отдельный компонент, а не ветка рендер-функции, ровно из-за состояния
 * «скопировано»: живи оно в родителе, изменение этого флага инвалидировало бы
 * кэш VNode **всех** блоков документа, и главный механизм перфоманса
 * (`renderNodes` → кэш по ключу блока) перестал бы работать от нажатия кнопки.
 */

export interface GrMarkdownCodeProps {
  code: string
  language?: string | null
  /** Переносить длинные строки вместо горизонтальной прокрутки. */
  wrap?: boolean
}

const props = withDefaults(defineProps<GrMarkdownCodeProps>(), {
  language: null,
  wrap: false,
})

const emit = defineEmits<{ (e: 'copy', language: string | null): void }>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

/**
 * Наличие буфера уточняется после монтирования: `navigator` в теле `setup`
 * либо роняет серверный рендер, либо расходится с ним. До этого кнопки нет —
 * ровно та разметка, что пришла с сервера, поэтому гидрация совпадает.
 */
const canCopy = ref(false)
onMounted(() => {
  canCopy.value = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.writeText)
})

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    announce(t('grEditor.markdown.copied', 'Copied'))
    emit('copy', props.language)
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 1600)
  }
  catch {
    announce(t('grEditor.markdown.copyFailed', 'Could not copy'))
  }
}

const regionLabel = computed(() => (props.language
  ? `${t('grEditor.markdown.codeRegion', 'Code block')}: ${props.language}`
  : t('grEditor.markdown.codeRegion', 'Code block')))
</script>

<template>
  <div class="gr-md-code" data-gr-markdown-code>
    <div class="gr-md-code-bar">
      <span v-if="language" class="gr-md-code-lang">{{ language }}</span>
      <span v-else class="gr-md-code-lang" />
      <button
        v-if="canCopy"
        type="button"
        class="gr-md-code-copy"
        :aria-label="copied ? t('grEditor.markdown.copied', 'Copied') : t('grEditor.markdown.copy', 'Copy code')"
        data-gr-markdown-copy
        @click="copy"
      >
        <svg class="gr-md-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-for="d in (copied ? copiedIconPaths : copyIconPaths)" :key="d" :d="d" />
        </svg>
      </button>
    </div>
    <!-- Прокручиваемая область обязана быть достижима с клавиатуры. -->
    <pre
      class="gr-md-pre"
      :class="{ 'gr-md-pre-wrap': wrap }"
      tabindex="0"
      role="region"
      :aria-label="regionLabel"
    ><code>{{ code }}</code></pre>
  </div>
</template>
