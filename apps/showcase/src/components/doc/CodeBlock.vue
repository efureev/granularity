<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import IconCheck from '~icons/lucide/check'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconCopy from '~icons/lucide/copy'

const props = withDefaults(defineProps<{
  code: string
  language?: string
  title?: string
  /**
   * Сколько строк показывать в свёрнутом виде. Сниппеты короче этого порога
   * не сворачиваются вовсе: кнопка на трёхстрочном примере — лишний шум.
   */
  collapsedLines?: number
  /** Развернуть сразу. Для мест, где код и есть содержание страницы. */
  expanded?: boolean
}>(), {
  language: 'ts',
  title: undefined,
  collapsedLines: 8,
  expanded: false,
})

const { t } = useFintI18n()

const isCopied = ref(false)

async function copyCode() {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText)
    return

  await navigator.clipboard.writeText(props.code)
  isCopied.value = true

  window.setTimeout(() => {
    isCopied.value = false
  }, 1200)
}

const lineCount = computed(() => props.code.split('\n').length)

/** Сворачивать имеет смысл, только если под катом реально что-то прячется. */
const isCollapsible = computed(() => lineCount.value > props.collapsedLines)

const isExpanded = ref(props.expanded)

// Высота ката считается по числу строк, а не «на глаз»: `leading-6` (24px) ×
// строки + верхний паддинг + запас под градиент. Запас важен: без него подложка
// съедала бы последнюю строку наполовину, и обрыв выглядел бы багом, а не приёмом.
const FADE_HEIGHT_REM = 5

const collapsedMaxHeight = computed(
  () => `${props.collapsedLines * 1.5 + 1 + FADE_HEIGHT_REM}rem`,
)

const codeId = useId()

function toggle(): void {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="showcase-code-surface min-w-0 max-w-full overflow-hidden rounded-3xl border">
    <div
      class="showcase-code-divider flex items-center justify-between gap-3 border-b px-4"
      :class="title ? 'py-3' : 'py-2'"
    >
      <div class="min-w-0">
        <p
          v-if="title"
          class="truncate text-sm font-semibold leading-tight"
        >
          {{ title }}
        </p>
        <p
          class="showcase-code-meta"
          :class="title ? 'mt-0.5' : ''"
        >
          <b>{{ language }}</b><template v-if="isCollapsible">
· {{ t('showcase.docComponents.codeBlock.lines', { count: lineCount }) }}
</template>
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <!-- Свернуть можно только из шапки, развернуть — только из подложки внизу.
             Раньше обе кнопки жили одновременно и дублировали друг друга в 200px. -->
        <button
          v-if="isCollapsible && isExpanded"
          type="button"
          class="showcase-code-action flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium"
          :aria-expanded="'true'"
          :aria-controls="codeId"
          @click="toggle"
        >
          {{ t('showcase.docComponents.codeBlock.collapse') }}
          <IconChevronDown class="h-3.5 w-3.5 rotate-180" />
        </button>

        <!-- Копирование намеренно тихое: сплошная кнопка перетягивала внимание
             с самого кода. Акцент появляется на hover и в состоянии «скопировано». -->
        <button
          type="button"
          class="showcase-code-action rounded-xl p-2"
          :class="isCopied ? 'showcase-code-action--done' : ''"
          :aria-label="isCopied ? t('showcase.docComponents.codeBlock.copied') : t('showcase.docComponents.codeBlock.copy')"
          :title="isCopied ? t('showcase.docComponents.codeBlock.copied') : t('showcase.docComponents.codeBlock.copy')"
          @click="copyCode"
        >
          <IconCheck
            v-if="isCopied"
            class="h-4 w-4"
          />
          <IconCopy
            v-else
            class="h-4 w-4"
          />
        </button>
      </div>
    </div>

    <div class="relative">
      <!-- tabindex: длинные строки дают горизонтальный скролл, а скроллящийся блок
           обязан быть достижим с клавиатуры — иначе часть кода недоступна без мыши
           (axe: scrollable-region-focusable). -->
      <pre
        :id="codeId"
        tabindex="0"
        :aria-label="t('showcase.docComponents.codeBlock.regionLabel', { language })"
        class="max-w-full overflow-x-auto px-4 py-4 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        :style="isCollapsible && !isExpanded ? { maxHeight: collapsedMaxHeight, overflowY: 'hidden' } : undefined"
      ><code>{{ code }}</code></pre>

      <!-- Подложка-обрыв: градиент выходит на сплошной фон раньше, чем начинается
           подпись, поэтому текст под ней не «просвечивает». Кликабельна целиком —
           это основной способ развернуть. -->
      <button
        v-if="isCollapsible && !isExpanded"
        type="button"
        class="showcase-code-fade absolute inset-x-0 bottom-0 flex h-20 w-full cursor-pointer items-end justify-center pb-3"
        :aria-expanded="'false'"
        :aria-controls="codeId"
        @click="toggle"
      >
        <span class="showcase-code-fade__label flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          {{ t('showcase.docComponents.codeBlock.expand') }}
          <IconChevronDown class="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  </div>
</template>
