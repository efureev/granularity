<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'

import GrCodeBlock from '@feugene/granularity-code/components/GrCodeBlock'
import { createMarkedEngine, markedEngine } from '@feugene/granularity-editor/markdown'

// `GrMarkdown`, `GrSwitch` подставляются авто-импортом.

/**
 * Один и тот же документ с подменой рендереров.
 *
 * `GrMarkdown` про `granularity-code` не знает: подсвечивающий блок приносит
 * потребитель пропом `components`. Ребра между пакетами при этом не заводится,
 * и документ из одних абзацев за подсветку не платит.
 */
const source = `Ссылка ведёт [во внутренний роутер](/foundations/tokens), а не наружу.

\`\`\`json
{ "engine": "marked", "render": "vnode", "sanitizer": null }
\`\`\`

Картинка подменяется своим рендерером — здесь на подпись.

![Схема сборки](/nonexistent.png)

Выделение маркером — ==вот такое== — есть в Obsidian и Pandoc, но ни в CommonMark, ни в GFM его нет.
`

const highlight = ref(true)
const routerLinks = ref(true)
const altImages = ref(true)
const ownSyntax = ref(true)

/**
 * Выделение маркером: `==текст==` превращается в `<mark>`.
 *
 * Синтаксис не входит ни в CommonMark, ни в GFM — он пришёл из Obsidian и
 * Pandoc, и в markdown-it живёт плагином. Здесь он и взят: показывает, что
 * расширение добавляет движку синтаксис, которого парсер не знает.
 *
 * От расширения берётся только токенайзер: его `renderer` не вызывается никогда,
 * потому что разметку строит рендерер пакета из узлов Vue. Новый тип токена
 * приезжает узлом `custom` и ищет себе компонент в `components` по имени.
 */
const highlightMark = {
  name: 'highlightMark',
  level: 'inline' as const,
  start: (src: string) => src.indexOf('=='),
  tokenizer(src: string) {
    const match = /^==([^=\n]+)==/.exec(src)
    return match ? { type: 'highlightMark', raw: match[0], value: match[1] } : undefined
  },
}

const withSyntax = createMarkedEngine({ extensions: [highlightMark] })

/** Компонент под токен: получает поля токена пропами. */
const HighlightMark = defineComponent({
  props: { value: { type: String, default: '' } },
  setup: props => () => h('mark', { class: 'rounded-[var(--gr-radius-sm)] bg-[var(--gr-warning-light)] px-1' }, props.value),
})

/** Ссылка приложения: перехватывает клик и не уводит со страницы. */
const RouterLink = defineComponent({
  props: { href: { type: String, required: true } },
  setup: (props, { slots }) => () => h('a', {
    href: props.href,
    class: 'gr-md-link',
    style: { textDecorationStyle: 'dotted' },
    onClick: (event: MouseEvent) => event.preventDefault(),
  }, slots.default?.()),
})

/** Картинки, которой нет, быть не должно: показываем подпись вместо битого значка. */
const AltOnly = defineComponent({
  props: { alt: { type: String, default: '' } },
  setup: props => () => h('span', { class: 'showcase-demo-text' }, `[изображение: ${props.alt}]`),
})

const components = computed(() => ({
  code: highlight.value ? GrCodeBlock : undefined,
  link: routerLinks.value ? RouterLink : undefined,
  image: altImages.value ? AltOnly : undefined,
  highlightMark: ownSyntax.value ? HighlightMark : undefined,
}))

const engine = computed(() => (ownSyntax.value ? withSyntax : markedEngine))

/**
 * Чип повторяет форму самого пропа: `components` — это объект, и запись
 * `code: GrCodeBlock` читается как строчка из него, а не как условный значок.
 */
const active = computed(() => [
  { key: 'code', on: highlight.value, label: highlight.value ? 'code: GrCodeBlock' : 'code: по умолчанию' },
  { key: 'link', on: routerLinks.value, label: routerLinks.value ? 'link: RouterLink' : 'link: по умолчанию' },
  { key: 'image', on: altImages.value, label: altImages.value ? 'image: AltOnly' : 'image: по умолчанию' },
  { key: 'highlightMark', on: ownSyntax.value, label: ownSyntax.value ? 'highlightMark: <mark>' : 'расширения нет' },
])
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-3 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] p-4">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <span class="showcase-demo-caption text-[11px]">Подменить рендерер</span>
        <GrSwitch v-model="highlight" size="sm">
          Блок кода
        </GrSwitch>
        <GrSwitch v-model="routerLinks" size="sm">
          Ссылки
        </GrSwitch>
        <GrSwitch v-model="altImages" size="sm">
          Картинки
        </GrSwitch>
        <GrSwitch v-model="ownSyntax" size="sm">
          Выделение маркером
        </GrSwitch>
      </div>

      <p class="showcase-demo-text text-xs">
        Выключенный тумблер — рендерер по умолчанию, включённый — свой компонент
        из пропа `components`. Чипы в шапке документа показывают текущий набор
        той же записью, какой его задают в коде. Последний тумблер добавляет
        движку токенайзер, а не рендерер: `==текст==` — это выделение маркером
        из Obsidian и Pandoc, в CommonMark и GFM такого синтаксиса нет. Без
        расширения парсер его не узнаёт, и на экране остаются сами равно.
      </p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] shadow-[var(--showcase-shadow-raised)]">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--gr-brd)] px-5 py-2.5 sm:px-8">
        <span class="showcase-demo-caption text-[11px]">Отрендеренный документ</span>

        <div class="ms-auto flex flex-wrap items-center gap-2">
          <!-- Собственные токены, а не `showcase-demo-chip`: тот жёстко задаёт
               цвет и рамку, и активное состояние ими не выразить. -->
          <span
            v-for="item in active"
            :key="item.key"
            class="rounded-full border px-2.5 py-0.5 font-mono text-xs"
            :class="item.on
              ? 'border-[var(--gr-primary)] bg-[var(--gr-card)] text-[var(--gr-primary-text)]'
              : 'border-[var(--gr-brd)] bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'"
          >
            {{ item.label }}
          </span>
        </div>
      </div>

      <div class="px-5 py-6 sm:px-8 sm:py-8">
        <GrMarkdown
          :source="source"
          :engine="engine"
          id-prefix="renderers-"
          :components="components"
        />
      </div>
    </div>
  </div>
</template>
