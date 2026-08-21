<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'

import { CharacterCount, Focus, Selection } from '@tiptap/extensions'
import type { GrRichTextExtension } from '@feugene/granularity-editor'

/**
 * Свои расширения TipTap поверх схемы.
 *
 * Переключатели включают их **на живом поле**: смена набора пересобирает
 * редактор, а текст переносится разметкой и проходит разбор по новой схеме.
 * Схему ProseMirror подменить нельзя — из неё выведены и документ, и команды.
 */
const value = ref('<p>Включите расширение и продолжайте печатать.</p>')

const LIMIT = 120

const catalogue = [
  {
    key: 'characterCount',
    title: 'CharacterCount',
    about: `Счётчик символов и потолок. Здесь предел — ${LIMIT}: дальше ввод просто не проходит.`,
    make: () => CharacterCount.configure({ limit: LIMIT }),
  },
  {
    key: 'focus',
    title: 'Focus',
    about: 'Помечает абзац под курсором классом `has-focus`. Оформление — ваше: здесь это полоса слева.',
    make: () => Focus.configure({ className: 'has-focus', mode: 'shallowest' }),
  },
  {
    key: 'selection',
    title: 'Selection',
    about: 'Оставляет выделение видимым, когда фокус ушёл из поля. Выделите текст и щёлкните мимо.',
    make: () => Selection,
  },
] as const

type ExtensionKey = typeof catalogue[number]['key']

const enabled = ref<ExtensionKey[]>([])

const extensions = computed<GrRichTextExtension[]>(() => (
  catalogue
    .filter(entry => enabled.value.includes(entry.key))
    .map(entry => entry.make() as GrRichTextExtension)
))

/** Инстанс редактора наружу отдаёт сам компонент — счётчик живёт в нём. */
const field = shallowRef<{ editor: { storage: Record<string, { characters?: () => number }> } } | null>(null)

const typed = ref(0)

// `flush: 'post'` — не педантизм: включение расширения пересобирает редактор в
// собственном наблюдателе компонента, и до этого момента счётчика в хранилище
// ещё нет. Без задержки поле показывало «0» при непустом тексте.
watch([value, enabled], () => {
  const storage = field.value?.editor?.storage?.characterCount

  typed.value = typeof storage?.characters === 'function' ? storage.characters() : 0
}, { flush: 'post' })

const counted = computed(() => enabled.value.includes('characterCount'))
</script>

<template>
  <div class="showcase-editor-extensions grid gap-4">
    <GrRichText
      ref="field"
      v-model="value"
      schema="article"
      :extensions="extensions"
      aria-label="Текст с расширениями"
    />

    <div class="showcase-demo-panel grid gap-3 rounded-[var(--gr-radius-lg)] border p-4">
      <div class="showcase-demo-title text-sm font-semibold">
        Расширения
      </div>

      <label v-for="entry in catalogue" :key="entry.key" class="flex items-start gap-3">
        <GrCheckbox
          :model-value="enabled.includes(entry.key)"
          :aria-label="entry.title"
          @update:model-value="enabled = $event ? [...enabled, entry.key] : enabled.filter(k => k !== entry.key)"
        />
        <span class="grid gap-0.5">
          <code class="text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]">{{ entry.title }}</code>
          <span class="showcase-demo-text text-sm">{{ entry.about }}</span>
        </span>
      </label>

      <p v-if="counted" class="showcase-demo-text text-sm">
        Набрано символов: <strong>{{ typed }}</strong> из {{ LIMIT }}
      </p>
    </div>

    <p class="showcase-demo-text text-sm">
      Набор расширений задаётся пропом <code>extensions</code> и добавляется <strong>к схеме</strong>,
      а не заменяет её. Кнопку для своего расширения тулбар не покажет: он строится по схеме, и
      кнопка без команды за ней была бы обманом.
    </p>

    <p class="showcase-demo-text text-sm">
      Смена набора пересобирает редактор: схема ProseMirror неизменяема — из неё выведены и документ,
      и команды. Текст переносится разметкой и проходит разбор заново, поэтому узел, которого в новой
      схеме нет, отбрасывается — то же правило, что и при вставке.
    </p>

    <p class="showcase-demo-text text-sm">
      <code>Focus</code> и <code>Selection</code> сами ничего не рисуют — они вешают класс, а
      оформление остаётся за вами. В этом демо классы оформлены парой правил рядом; без них
      расширение честно работает, но выглядит как выключенное.
    </p>

    <p class="showcase-demo-text text-sm">
      <code>TrailingNode</code> в списке нет намеренно: он уже входит в <code>StarterKit</code>, то
      есть в саму схему. Добавить его пропом можно, но переключатель ничего бы не менял — под
      заголовком и цитатой пустой абзац есть и без него.
    </p>

    <p class="showcase-demo-text text-sm">
      Полный список готовых расширений —
      <GrLink href="https://tiptap.dev/docs/editor/extensions" external>каталог TipTap</GrLink>; как
      написать своё —
      <GrLink href="https://tiptap.dev/docs/editor/extensions/custom-extensions" external>руководство по расширениям</GrLink>.
      Пакет ничего в них не оборачивает: <code>extensions</code> принимает их как есть, а инстанс
      редактора компонент отдаёт через <code>defineExpose</code> — для своих команд и плагинов.
    </p>
  </div>
</template>

<!--
  Классы вешают сами расширения, а рисует их потребитель — в этом и смысл
  `Focus` и `Selection`. Стиль не `scoped`: узлы создаёт ProseMirror в рантайме,
  атрибут области видимости на них не попадает.
-->
<style>
.showcase-editor-extensions .has-focus {
  border-left: 2px solid var(--gr-primary);
  padding-left: 0.5rem;
  margin-left: -0.625rem;
}

.showcase-editor-extensions .selection {
  background: var(--gr-accent);
  border-radius: var(--gr-radius-sm);
}
</style>
