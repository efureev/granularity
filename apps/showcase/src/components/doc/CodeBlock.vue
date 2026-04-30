<script setup lang="ts">
import { ref } from 'vue'

import { GrButton } from '@feugene/granularity'
import IconCheck from '~icons/lucide/check'
import IconCopy from '~icons/lucide/copy'

const props = withDefaults(defineProps<{
  code: string
  language?: string
  title?: string
}>(), {
  language: 'ts',
  title: undefined,
})

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
</script>

<template>
  <div class="showcase-code-surface min-w-0 max-w-full overflow-hidden rounded-3xl border">
    <div class="showcase-code-divider flex items-center justify-between gap-3 border-b px-4 py-3">
      <div class="min-w-0">
        <p
          v-if="title"
          class="truncate text-sm font-semibold"
        >
          {{ title }}
        </p>
        <p class="showcase-code-muted text-xs uppercase tracking-[0.16em]">
          {{ language }}
        </p>
      </div>

      <GrButton
        :aria-label="isCopied ? $t('showcase.docComponents.codeBlock.copied') : $t('showcase.docComponents.codeBlock.copy')"
        :title="isCopied ? $t('showcase.docComponents.codeBlock.copied') : $t('showcase.docComponents.codeBlock.copy')"
        variant="primary"
        size="sm"
        square
        class="shadow-sm"
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
      </GrButton>
    </div>

    <pre class="max-w-full overflow-x-auto px-4 py-4 text-sm leading-6"><code>{{ code }}</code></pre>
  </div>
</template>
