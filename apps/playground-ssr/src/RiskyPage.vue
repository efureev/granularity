<script setup lang="ts">
import { ref } from 'vue'

import {
  GrCollapse,
  GrCollapseItem,
  GrCommandPalette,
  GrDataTable,
  GrDrawer,
  GrFileUpload,
  GrImageViewer,
  GrInputTag,
  GrKbd,
  GrSegmented,
  GrSlider,
  GrToaster,
  GrTree,
  GrTreeSelect,
} from '@feugene/granularity'

/**
 * Страница-улика: компоненты, у которых серверный рендер может сломаться не
 * телепортом, а по трём другим причинам.
 *
 *  1. **браузерный API в setup** — `new Image()` у `GrImageViewer` выполнялся
 *     синхронно при `immediate: true`, независимо от `modelValue`, и ронял
 *     весь рендер страницы, где просмотрщик просто присутствует закрытым;
 *  2. **окружение в первом рендере** — `GrCommandPalette` считал подсказку
 *     хоткея из `navigator`: сервер отдавал `Ctrl`, клиент на macOS — `⌘`;
 *  3. **нестабильные id** — `GrCollapseItem` и `GrSegmented` строили id из
 *     `instance.uid`, сквозного счётчика приложения: на сервере он продолжает
 *     расти между запросами, на клиенте стартует с нуля;
 *  4. **DOM в setup композабла** — `GrInputTag` и `GrImageViewer` зовут
 *     `useAnnouncer()`, а тот при первом обращении ставит живой регион в
 *     документ. На сервере документа нет, и хост обязан не создаваться вовсе.
 *
 * Все три класса дефектов видны только в связке «настоящий серверный рендер +
 * гидрация», поэтому живут здесь, а не в юнит-тестах пакета.
 */

const collapseOpen = ref<string[]>(['first'])
const view = ref('list')
const volume = ref(40)
// Палитра открыта намеренно: подсказка хоткея живёт внутри неё, и у закрытой
// палитры дефект гидрации не проявляется вовсе.
const paletteOpen = ref(true)
const drawerOpen = ref(false)
const viewerOpen = ref(false)
const treeValue = ref<number | null>(null)
const tags = ref<string[]>(['ssr'])

const views = [
  { label: 'Список', value: 'list' },
  { label: 'Доска', value: 'board' },
]

const treeData = [
  { id: 1, label: 'Документы', children: [{ id: 11, label: 'Отчёты' }] },
  { id: 2, label: 'Изображения' },
]

const rows = [
  { id: 1, name: 'Alice', score: 10 },
  { id: 2, name: 'Bob', score: 15 },
]

const columns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'score', label: 'Счёт', sortable: true },
]

const commands = [
  { id: 'open', label: 'Открыть файл' },
  { id: 'save', label: 'Сохранить' },
]

const images = [
  'https://example.invalid/a.png',
  'https://example.invalid/b.png',
]
</script>

<template>
  <main class="flex flex-col gap-6 p-6">
    <!--
      Просмотрщик закрыт. Это и есть сценарий из аудита: страница падала не от
      открытого оверлея, а от того, что компонент присутствует в шаблоне.
    -->
    <GrImageViewer v-model="viewerOpen" :url-list="images" />

    <GrCommandPalette v-model="paletteOpen" :items="commands" hotkey="mod+k" />

    <!-- Тот же дефект в отдельном примитиве: `mod` рисуется по `navigator`. -->
    <GrKbd keys="mod+k" />

    <GrDrawer v-model="drawerOpen">
      Содержимое drawer'а.
    </GrDrawer>

    <GrCollapse v-model="collapseOpen">
      <GrCollapseItem name="first" title="Первая секция">
        Раскрыта на сервере.
      </GrCollapseItem>
      <!-- Без `name`: идентичность берётся из авто-id — здесь и ломалась гидрация. -->
      <GrCollapseItem title="Вторая секция">
        Свёрнута на сервере.
      </GrCollapseItem>
    </GrCollapse>

    <!-- Без `name`: имя скрытого input'а берётся из авто-id. -->
    <GrSegmented v-model="view" :options="views" />

    <!-- `useAnnouncer()` в setup: на сервере хост не должен даже пытаться встать. -->
    <GrInputTag v-model="tags" aria-label="Теги" />

    <GrSlider v-model="volume" :min="0" :max="100" aria-label="Громкость" />

    <GrTree :data="treeData" node-key="id" />

    <GrTreeSelect v-model="treeValue" :data="treeData" node-key="id" placeholder="Выберите узел" />

    <GrDataTable :rows="rows" :columns="columns" />

    <GrFileUpload />

    <GrToaster />
  </main>
</template>
