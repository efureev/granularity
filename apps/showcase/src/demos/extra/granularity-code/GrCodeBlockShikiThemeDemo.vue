<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

import { GrButton, GrSegmented } from '@feugene/granularity'
import { createShikiTokenizer, GR_CODE_SHIKI_THEME } from '@feugene/granularity-code'
import type { GrCodeTokenizer, ShikiLike } from '@feugene/granularity-code'

/**
 * Разбирает Shiki, красит тема приложения.
 *
 * Токен нашего контракта несёт **роль, а не цвет**: `createShikiTokenizer` даёт
 * Shiki тему-метку и разбирает цвета обратно в одиннадцать ролей. Цвет ролей
 * приходит из токенов `--gr-code-block-*` — поэтому «подключить тему» здесь это
 * не поставить пакет, а переопределить одиннадцать переменных. Зато одна и та
 * же тема разом ложится на блок, дифф и редактор, и слушается светлой/тёмной
 * схемы страницы.
 */
const SOURCE = `// Пересчёт корзины после смены купона
export async function recalc(cart: Cart, coupon?: string) {
  const discount = coupon ? await fetchDiscount(coupon) : 0
  const total = cart.items.reduce((sum, item) => sum + item.price, 0)

  return { total: total - discount, applied: discount > 0 }
}`

/**
 * Палитры настоящих тем, записанные нашими токенами.
 *
 * Ровно то, что делает потребитель: берёт цвета любимой темы и раскладывает их
 * по ролям. Ничего, кроме CSS-переменных, для этого не нужно.
 */
const PALETTES = {
  'app': null,
  'one-dark': {
    '--gr-code-block-bg': '#282c34',
    '--gr-code-block-fg': '#abb2bf',
    '--gr-code-block-key': '#e06c75',
    '--gr-code-block-string': '#98c379',
    '--gr-code-block-number': '#d19a66',
    '--gr-code-block-literal': '#d19a66',
    '--gr-code-block-punctuation': '#abb2bf',
    '--gr-code-block-keyword': '#c678dd',
    '--gr-code-block-comment': '#5c6370',
    '--gr-code-block-type': '#e5c07b',
    '--gr-code-block-function': '#61afef',
    '--gr-code-block-variable': '#abb2bf',
    '--gr-code-block-line-number': '#4b5263',
    // Дифф стоит рядом и красится теми же переменными: перекрась только код —
    // подложки правок останутся светлыми и станут нечитаемыми.
    '--gr-diff-added': '#2b3a2e',
    '--gr-diff-removed': '#3f2b2b',
    '--gr-diff-word-added': '#4b7f56',
    '--gr-diff-word-removed': '#a04c4c',
    '--gr-diff-word-added-fg': '#e6f4ea',
    '--gr-diff-word-removed-fg': '#fbeaea',
    '--gr-diff-gutter': '#5c6370',
    '--gr-diff-gap-bg': '#21252b',
  },
  'nord': {
    '--gr-code-block-bg': '#2e3440',
    '--gr-code-block-fg': '#d8dee9',
    '--gr-code-block-key': '#88c0d0',
    '--gr-code-block-string': '#a3be8c',
    '--gr-code-block-number': '#b48ead',
    '--gr-code-block-literal': '#81a1c1',
    '--gr-code-block-punctuation': '#eceff4',
    '--gr-code-block-keyword': '#81a1c1',
    '--gr-code-block-comment': '#616e88',
    '--gr-code-block-type': '#8fbcbb',
    '--gr-code-block-function': '#88c0d0',
    '--gr-code-block-variable': '#d8dee9',
    '--gr-code-block-line-number': '#4c566a',
    '--gr-diff-added': '#3b4a3f',
    '--gr-diff-removed': '#4a3b3f',
    '--gr-diff-word-added': '#5b8a63',
    '--gr-diff-word-removed': '#a3616f',
    '--gr-diff-word-added-fg': '#eceff4',
    '--gr-diff-word-removed-fg': '#eceff4',
    '--gr-diff-gutter': '#4c566a',
    '--gr-diff-gap-bg': '#3b4252',
  },
} as const

type Palette = keyof typeof PALETTES

const palette = ref<Palette>('app')
const tokenizer = shallowRef<GrCodeTokenizer | null>(null)
const loading = ref(false)

/**
 * Shiki грузит **потребитель**: движок регулярок и набор грамматик выбирает он,
 * а пакет о Shiki не знает даже в импортах типов.
 */
async function loadShiki(): Promise<void> {
  loading.value = true

  const { createHighlighter } = await import('shiki')
  const shiki = await createHighlighter({
    langs: ['ts'],
    // Тема-метка вместо настоящей: цвета Shiki нам не нужны, нужны роли.
    themes: [GR_CODE_SHIKI_THEME],
  })

  // Приведение — плата за то, что пакет типизует Shiki структурно, по одному
  // методу: у самого Shiki он объявлен через дженерики набора тем и языков.
  // Ровно поэтому переименование метода в мажоре Shiki ломает эту строку и
  // адаптер пакета, а контракт `GrCodeTokenizer` не ломает никогда.
  tokenizer.value = createShikiTokenizer(shiki as unknown as ShikiLike)
  loading.value = false
}

const style = computed(() => PALETTES[palette.value] ?? undefined)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" :loading="loading" :disabled="!!tokenizer" @click="loadShiki">
        {{ tokenizer ? 'Shiki подключён' : 'Подключить Shiki' }}
      </GrButton>
      <GrSegmented
        v-model="palette"
        size="sm"
        :options="[
          { value: 'app', label: 'Тема приложения' },
          { value: 'one-dark', label: 'One Dark' },
          { value: 'nord', label: 'Nord' },
        ]"
      />
    </div>

    <!-- Палитра — обычные CSS-переменные на обёртке: ниже её наследуют оба компонента. -->
    <div class="grid gap-3" :style="style">
      <GrCodeBlock
        :code="SOURCE"
        language="ts"
        :highlighter="tokenizer ?? undefined"
        aria-label="Пересчёт корзины"
        line-numbers
      />

      <GrDiff
        :before="SOURCE"
        :after="SOURCE.replace('discount > 0', 'discount > 0 && cart.items.length > 0')"
        language="ts"
        :highlighter="tokenizer ?? undefined"
        :context="1"
      />
    </div>

    <p class="showcase-demo-text text-sm">
      <template v-if="tokenizer">
        Разбирает Shiki, цвет берут одиннадцать токенов — поэтому тема легла и на блок, и на дифф разом
      </template>
      <template v-else>
        Пока Shiki не подключён, работает встроенный разбор: JSON и обычный текст
      </template>
    </p>
  </div>
</template>
