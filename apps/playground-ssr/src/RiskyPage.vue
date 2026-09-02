<script setup lang="ts">
import { ref } from 'vue'

import { GrCodeBlock } from '@feugene/granularity-code/components/GrCodeBlock'

import {
  GrAffix,
  GrCarousel,
  GrCarouselSlide,
  GrCollapse,
  GrCollapseItem,
  GrCommandPalette,
  GrContextMenu,
  GrDataTable,
  GrDrawer,
  GrFileUpload,
  GrImageViewer,
  GrInputTag,
  GrKbd,
  GrSegmented,
  GrSlider,
  GrSplitter,
  GrStatistic,
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
 *     документ. На сервере документа нет, и хост обязан не создаваться вовсе;
 *  5. **узел, которого нет на сервере** — кнопка копирования `GrCodeBlock`
 *     существует только там, где есть `navigator.clipboard`. Проверять его в
 *     `setup` нельзя: сервер отдал бы разметку без кнопки, а первый клиентский
 *     рендер — с ней, и гидрация разошлась бы по наличию узла.
 *
 * Все три класса дефектов видны только в связке «настоящий серверный рендер +
 * гидрация», поэтому живут здесь, а не в юнит-тестах пакета.
 */

const collapseOpen = ref<string[]>(['first'])
const view = ref('list')
const volume = ref(40)
const splitterSize = ref(35)
// Палитра открыта намеренно: подсказка хоткея живёт внутри неё, и у закрытой
// палитры дефект гидрации не проявляется вовсе.
const paletteOpen = ref(true)
const drawerOpen = ref(false)
const viewerOpen = ref(false)
const treeValue = ref<number | null>(null)
const tags = ref<string[]>(['ssr'])
const menuItems = [
  { key: 'open', label: 'Открыть' },
  { key: 'remove', label: 'Удалить', variant: 'danger' as const },
]

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

    <!--
      Карусель читает `matchMedia`, вешает `visibilitychange` и `ResizeObserver`,
      а состав ленты узнаёт от самих кадров при монтировании — на сервере полоса
      переключателей пуста. Автопрокрутка выключена намеренно: таймер на стенде
      производил бы те самые расхождения, ради поиска которых стенд существует.
    -->
    <GrCarousel aria-label="Кадры" indicators="thumbnails">
      <GrCarouselSlide v-for="frame in 3" :key="frame" :label="`Кадр ${frame}`">
        Кадр {{ frame }}
      </GrCarouselSlide>
    </GrCarousel>

    <!-- Тот же дефект в отдельном примитиве: `mod` рисуется по `navigator`. -->
    <GrKbd keys="mod+k" />

    <!--
      Кнопка копирования зависит от `navigator.clipboard`: на сервере его нет, и
      в первом рендере кнопки быть не должно — иначе гидрация разойдётся по
      наличию узла.
    -->
    <GrCodeBlock :code="{ ok: true, at: null }" aria-label="Ответ сервиса" line-numbers />

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

    <!--
      Сентинел обязан приехать с сервера: рендерить его только на клиенте значило
      бы разойтись по наличию узла. Состояние «прилипло» на сервере выключено, и
      первый клиентский рендер обязан повторить это, не заглядывая в наблюдателя.
    -->
    <GrAffix :offset="64">
      Липкая панель
    </GrAffix>

    <!-- `useAnnouncer()` в setup: на сервере хост не должен даже пытаться встать. -->
    <GrInputTag v-model="tags" aria-label="Теги" />

    <GrSlider v-model="volume" :min="0" :max="100" aria-label="Громкость" />

    <!-- `aria-controls` разделителя строится из авто-id: на сервере и на клиенте он обязан совпасть. -->
    <div style="height: 120px">
      <GrSplitter v-model="splitterSize" aria-label="Ширина панели">
        <template #start>
          Панель
        </template>
        <template #end>
          Содержимое
        </template>
      </GrSplitter>
    </div>

    <!--
      `animate` читает `matchMedia` и крутит `requestAnimationFrame`: на сервере
      нет ни того, ни другого, и серверная разметка обязана нести конечное число.
    -->
    <GrStatistic title="Выручка" :value="1284500" prefix="₽" animate />

    <!--
      `virtual` считает окно от `maxHeight` и оценки строки: контейнера на
      сервере нет, замерить нечего, и первый клиентский рендер обязан
      повторить серверный до последней строки.
    -->
    <GrTree :data="treeData" node-key="id" virtual :max-height="200" />

    <GrTreeSelect v-model="treeValue" :data="treeData" node-key="id" placeholder="Выберите узел" />

    <!--
      Якорь контекстного меню — точка вьюпорта, которой на сервере нет вовсе:
      меню обязано отрендериться закрытым и не тронуть ни `window`, ни портал
      до гидрации.
    -->
    <GrContextMenu :items="menuItems">
      <div>Правый клик по этому блоку</div>
    </GrContextMenu>

    <GrDataTable :rows="rows" :columns="columns" />

    <GrFileUpload />

    <GrToaster />
  </main>
</template>
