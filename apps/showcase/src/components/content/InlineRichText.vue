<script setup lang="ts">
import {computed} from 'vue'

import {DsBadge, DsLink} from '@feugene/granularity'

type InlineRichTextPart = {
  type: 'text' | 'badge' | 'link'
  content: string
  href?: string
}

const productLinks: Record<string, string> = {
  UnoCSS: 'https://unocss.dev',
}

const props = withDefaults(defineProps<{
  text: string
  tag?: string
  textClass?: string
}>(), {
  tag: 'span',
  textClass: '',
})

const backtickPattern = /`([^`]+)`/g

function resolvePartType(content: string): InlineRichTextPart {
  const normalizedContent = content.trim()
  const productHref = productLinks[normalizedContent]

  if (productHref) {
    return {
      type: 'link',
      content: normalizedContent,
      href: productHref,
    }
  }

  return {
    type: 'badge',
    content: normalizedContent,
  }
}

function createParts(text: string) {
  const parts: InlineRichTextPart[] = []
  let lastIndex = 0

  for (const match of text.matchAll(backtickPattern)) {
    const [matchedText, content] = match
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, matchIndex),
      })
    }

    parts.push(resolvePartType(content))
    lastIndex = matchIndex + matchedText.length
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return parts.length ? parts : [{type: 'text', content: text} as InlineRichTextPart]
}

const parts = computed(() => createParts(props.text))
</script>

<template>
  <component :is="tag" :class="textClass">
    <template v-for="(part, index) in parts" :key="`${part.type}-${part.content}-${index}`">
      <span v-if="part.type === 'text'">{{ part.content }}</span>
      <DsBadge
          tone="slate"
          class="!rounded-[7px] !px-1.5 !inline"
          v-else-if="part.type === 'badge'"
      >
        {{ part.content }}
      </DsBadge>
      <DsLink
          v-else
          :href="part.href"
          variant="primary"
          class="font-semibold"
          target="_blank"
          rel="noreferrer"
      >
        {{ part.content }}
      </DsLink>
    </template>
  </component>
</template>