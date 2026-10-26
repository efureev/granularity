<script setup lang="ts">
import IconFolder from '~icons/lucide/folder'
import IconHouse from '~icons/lucide/house'

import Specimen from './Specimen.vue'
import { keepOnPage } from './support'

defineProps<{ preview?: boolean }>()

const shortHomePath = [
  { label: 'Главная', href: '#', icon: IconHouse, iconOnly: true },
  { label: 'Проекты', href: '#' },
  { label: 'Оплата' },
]
const fullPath = [
  { label: 'Главная', href: '#', icon: IconHouse, iconOnly: true },
  { label: 'Проекты', href: '#', icon: IconFolder },
  { label: 'Запуск весной', href: '#' },
  { label: 'Оплата' },
]
const longPath = [
  { label: 'Обзор', href: '#' },
  { label: 'Финансы', href: '#' },
  { label: '2026', href: '#' },
  { label: 'Октябрь', href: '#' },
  { label: 'Счета', href: '#' },
  { label: 'СЧ-1046' },
]
const documentPath = [
  { label: 'Документы', href: '#' },
  { label: 'Договоры с подрядчиками', href: '#' },
  { label: 'Типография «Оттиск»', href: '#' },
  { label: 'Дополнительное соглашение № 3 к договору поставки' },
]
const settingsPath = [
  { label: 'Настройки', href: '#' },
  { label: 'Интеграции', disabled: true },
  { label: 'Уведомления', href: '#' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3" @click="keepOnPage">
    <GrBreadcrumbs :items="shortHomePath" aria-label="Путь к оплате" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Путь с иконками" note="«домик» в начале — подпись не пропадает, а прячется для диктора; последний пункт — текущая страница">
      <GrBreadcrumbs :items="fullPath" aria-label="Путь к оплате" />
    </Specimen>

    <Specimen title="Свёрнутая середина" note="не больше четырёх уровней: «…» раскрывает путь на месте, без меню">
      <GrBreadcrumbs :items="longPath" :max-items="4" :items-after-collapse="2" aria-label="Путь к счёту" />
    </Specimen>

    <Specimen title="По доступному месту" note="путь в одну строку: середина уходит под «…» ровно настолько, насколько не влезает">
      <div class="flex flex-col gap-4">
        <GrBreadcrumbs :items="documentPath" auto-collapse aria-label="Путь к соглашению" />
        <div class="max-w-[260px] rounded-[var(--gr-radius-md)] border border-dashed border-[var(--gr-brd)] px-3 py-2">
          <GrBreadcrumbs :items="documentPath" auto-collapse aria-label="Путь к соглашению в узкой колонке" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Разделитель, кегль и недоступный уровень" note="свой разделитель; малый кегль, текущая страница — ссылкой; «Интеграции» — текст без перехода">
      <div class="flex flex-col gap-4">
        <GrBreadcrumbs :items="settingsPath" separator="›" aria-label="Путь в настройках" />
        <GrBreadcrumbs :items="settingsPath" separator="›" size="sm" link-current aria-label="Путь в настройках, малый кегль" />
      </div>
    </Specimen>
  </div>
</template>
