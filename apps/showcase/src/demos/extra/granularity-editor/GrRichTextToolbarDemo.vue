<script setup lang="ts">
import { computed, ref } from 'vue'

import { createSchema, type GrRichTextAction } from '@feugene/granularity-editor'

/**
 * Что тулбар умеет из коробки — полным списком.
 *
 * Таблица строится из той же схемы, по которой собирается панель: разойтись они
 * не могут по построению. Допиши действие в схему — строка появится сама.
 */
const value = ref('<h2>Попробуйте кнопки</h2><p>Выделите фрагмент и примените формат.</p>')

const minimal = createSchema('minimal').actions
const article = createSchema('article').actions

const groupTitles: Record<GrRichTextAction['group'], string> = {
  inline: 'Начертание',
  block: 'Структура',
  list: 'Списки',
}

/** `Mod` — `⌘` на Apple и `Ctrl` на остальных: показываем обе записи. */
function shortcut(action: GrRichTextAction): string {
  return action.shortcut.replace('Mod', '⌘/Ctrl').replace(/-/g, ' + ')
}

function inMinimal(action: GrRichTextAction): boolean {
  return minimal.some(entry => entry.key === action.key)
}

const rows = computed(() => article.map(action => ({
  action,
  group: groupTitles[action.group],
  shortcut: shortcut(action),
  schemas: inMinimal(action) ? 'minimal, article' : 'article',
})))
</script>

<template>
  <div class="grid gap-4">
    <GrRichText v-model="value" schema="article" toolbar="both" aria-label="Все кнопки" />

    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]">
        <thead>
          <tr class="border-b border-[var(--gr-brd)] text-left">
            <th class="py-2 pr-3 font-semibold">Кнопка</th>
            <th class="py-2 pr-3 font-semibold">Группа</th>
            <th class="py-2 pr-3 font-semibold">Команда TipTap</th>
            <th class="py-2 pr-3 font-semibold">Клавиши</th>
            <th class="py-2 font-semibold">Схемы</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.action.key" class="border-b border-[var(--gr-brd)]">
            <td class="py-2 pr-3">{{ row.action.labelFallback }}</td>
            <td class="showcase-demo-text py-2 pr-3">{{ row.group }}</td>
            <td class="py-2 pr-3"><code>{{ row.action.command }}</code></td>
            <td class="py-2 pr-3"><code>{{ row.shortcut }}</code></td>
            <td class="showcase-demo-text py-2">{{ row.schemas }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="showcase-demo-text text-sm">
      Таблица построена из той же схемы, по которой собирается панель: разойтись они не могут по
      построению. Кнопка без команды за ней тут невозможна — это и есть причина, по которой тулбар
      описан данными, а не написан разметкой.
    </p>

    <p class="showcase-demo-text text-sm">
      Горячие клавиши приходят от расширений TipTap, а не от пакета: они работают и при
      <code>toolbar="false"</code>. Кроме перечисленного из коробки идут отмена и повтор
      (<code>⌘/Ctrl + Z</code> и <code>⌘/Ctrl + Shift + Z</code>), перенос строки внутри абзаца
      (<code>Shift + Enter</code>), горизонтальная черта и ссылка — последние две без своей кнопки:
      черта ставится правилом ввода <code>---</code>, ссылка живёт маркой и ждёт своего интерфейса.
    </p>

    <p class="showcase-demo-text text-sm">
      Схема <code>minimal</code> оставляет только начертание и списки, <code>article</code> добавляет
      структуру. Заголовка первого уровня не даёт ни одна: <code>h1</code> принадлежит странице, а не
      полю внутри неё.
    </p>
  </div>
</template>
