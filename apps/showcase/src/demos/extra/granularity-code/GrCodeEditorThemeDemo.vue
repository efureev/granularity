<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'

import { GrSegmented } from '@feugene/granularity'

/**
 * Тему подключает **потребитель**, а не пакет.
 *
 * Свою палитру редактор строит из токенов `--gr-code-block-*` — тогда код
 * слушается темы приложения и меняется вместе с ней. Но проп `extensions` берёт
 * любое расширение CodeMirror, а тема там и есть расширение: готовая из npm или
 * собранная на месте. Ни та ни другая в зависимостях пакета не значится.
 */
type Palette = 'tokens' | 'one-dark' | 'custom'

const CODE = `import { defineStore } from './store'

export const useCart = defineStore('cart', {
  state: () => ({ items: [], coupon: null }),
  getters: {
    total: state => state.items.reduce((sum, item) => sum + item.price, 0),
  },
})`

const palette = ref<Palette>('tokens')
const code = ref(CODE)
const language = shallowRef(() => import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })))
const extensions = shallowRef<unknown[]>([])

/**
 * Тема на месте: `EditorView.theme` рисует хром, `HighlightStyle` — токены.
 *
 * Собрана здесь целиком, чтобы было видно: «любая тема» это не список
 * поддерживаемых пакетов, а обычное расширение CodeMirror.
 */
async function customTheme(): Promise<unknown[]> {
  const { EditorView } = await import('@codemirror/view')
  const { HighlightStyle, syntaxHighlighting } = await import('@codemirror/language')
  const { tags } = await import('@lezer/highlight')

  return [
    EditorView.theme({
      '&': { backgroundColor: '#1d1f21', color: '#c5c8c6' },
      '.cm-gutters': { backgroundColor: '#1d1f21', color: '#5c6370', border: 'none' },
      '.cm-cursor': { borderLeftColor: '#f0c674' },
    }, { dark: true }),
    syntaxHighlighting(HighlightStyle.define([
      { tag: tags.keyword, color: '#b294bb' },
      { tag: tags.string, color: '#b5bd68' },
      { tag: tags.number, color: '#de935f' },
      { tag: tags.comment, color: '#707880', fontStyle: 'italic' },
      { tag: tags.propertyName, color: '#81a2be' },
      { tag: tags.function(tags.variableName), color: '#81a2be' },
    ])),
  ]
}

watch(palette, async (next) => {
  if (next === 'tokens') {
    extensions.value = []
    return
  }

  extensions.value = next === 'one-dark'
    ? [await import('@codemirror/theme-one-dark').then(m => m.oneDark)]
    : await customTheme()
}, { immediate: true })
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="palette"
      size="sm"
      :options="[
        { value: 'tokens', label: 'Токены приложения' },
        { value: 'one-dark', label: 'One Dark из npm' },
        { value: 'custom', label: 'Своя, на месте' },
      ]"
    />

    <GrCodeEditor
      v-model="code"
      :language="language"
      :extensions="extensions"
      aria-label="Хранилище корзины"
      line-numbers
      max-height="16rem"
    />

    <p class="showcase-demo-text text-sm">
      <template v-if="palette === 'tokens'">
        Своя палитра: цвета из <code>--gr-code-block-*</code>, поэтому редактор меняется вместе с темой страницы
      </template>
      <template v-else>
        Тема потребителя сильнее нашей — переключите тему страницы в шапке: этот блок не изменится
      </template>
    </p>
  </div>
</template>
