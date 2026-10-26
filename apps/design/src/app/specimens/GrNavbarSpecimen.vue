<script setup lang="ts">
import IconBell from '~icons/lucide/bell'
import IconDownload from '~icons/lucide/download'
import IconLayers from '~icons/lucide/layers'
import IconPlus from '~icons/lucide/plus'
import IconSearch from '~icons/lucide/search'

import { ref } from 'vue'

import Specimen from './Specimen.vue'
import { keepOnPage } from './support'

defineProps<{ preview?: boolean }>()

const sectionLinks = ['Проекты', 'Задачи', 'Отчёты']
const query = ref('')

const reportLinks = ['Выручка', 'Возвраты', 'Средний чек', 'Когорты', 'Каналы', 'Склад']

const menuOpen = ref(false)
const menuLinks = ['Обзор', 'Документы', 'Задачи', 'Настройки']
const feed = [
  { title: 'Смета согласована', text: 'Анна Соколова подтвердила бюджет запуска — 480 000 ₽.' },
  { title: 'Макеты ушли в печать', text: 'Типография вернёт пробный тираж к пятнице.' },
  { title: 'Новый участник', text: 'Иван Петров присоединился к проекту «Запуск весной».' },
  { title: 'Счёт оплачен', text: 'СЧ-1046 закрыт картой •• 4417, чек на почте.' },
  { title: 'Созвон перенесён', text: 'Встреча с подрядчиком — в четверг в 11:00.' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
      <GrNavbar title="Студия">
        <div class="flex items-center gap-1">
          <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Поиск">
            <GrIcon><IconSearch /></GrIcon>
          </GrButton>
          <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Уведомления">
            <GrIcon><IconBell /></GrIcon>
          </GrButton>
          <GrAvatar name="Анна Соколова" size="sm" />
        </div>
      </GrNavbar>
      <p class="px-4 py-2.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        Добрый день, Анна
      </p>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Три зоны" note="заголовок слотом, разделы слева, поиск по центру, действия справа" wide>
      <div class="overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <GrNavbar>
          <template #title>
            <a href="#" class="flex items-center gap-2 rounded-[var(--gr-radius-sm)] text-[var(--gr-fg)] no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]">
              <GrIcon tone="primary"><IconLayers /></GrIcon>
              Студия
            </a>
          </template>
          <template #left>
            <nav aria-label="Разделы студии" class="flex items-center gap-4">
              <GrLink v-for="link in sectionLinks" :key="link" href="#" variant="muted" tone="neutral" underline="none">
                {{ link }}
              </GrLink>
            </nav>
          </template>
          <template #center>
            <GrInput v-model="query" type="search" placeholder="Поиск по проектам" size="sm" aria-label="Поиск по проектам" class="w-full max-w-[320px]" />
          </template>
          <div class="flex items-center gap-2">
            <GrButton size="sm">
              <GrIcon><IconPlus /></GrIcon>
              Создать
            </GrButton>
            <GrAvatar name="Анна Соколова" size="sm" />
          </div>
        </GrNavbar>
      </div>
    </Specimen>

    <Specimen title="Заголовок раздела" note="настоящий заголовок страницы — по нему обходят структуру; вид от уровня не меняется">
      <div class="overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <GrNavbar title="Договоры" :heading-level="5">
          <template #left>
            <GrBadge tone="neutral" size="sm">
              12 активных
            </GrBadge>
          </template>
          <div class="flex items-center gap-1">
            <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Выгрузить список">
              <GrIcon><IconDownload /></GrIcon>
            </GrButton>
            <GrButton size="sm">
              Новый договор
            </GrButton>
          </div>
        </GrNavbar>
      </div>
    </Specimen>

    <Specimen title="Узкая шапка" note="действия не сжимаются никогда; разделам слева — прокрутка вбок, а не наложение">
      <div class="mx-auto w-full max-w-[360px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <GrNavbar title="Отчёты">
          <template #left>
            <nav aria-label="Виды отчётов" class="flex items-center gap-4">
              <GrLink v-for="link in reportLinks" :key="link" href="#" variant="muted" tone="neutral" underline="none" class="whitespace-nowrap">
                {{ link }}
              </GrLink>
            </nav>
          </template>
          <div class="flex items-center gap-1">
            <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Поиск по отчётам">
              <GrIcon><IconSearch /></GrIcon>
            </GrButton>
            <GrAvatar name="Анна Соколова" size="sm" />
          </div>
        </GrNavbar>
      </div>
    </Specimen>

    <Specimen title="Прилипание и кнопка меню" note="шапка остаётся наверху при прокрутке; кнопка меню — тач-цель 44px">
      <!-- `isolate`: слой липкой шапки — 900, и без своего контекста наложения она легла бы поверх липких вкладок страницы. -->
      <div class="isolate">
        <div
          role="region"
          tabindex="0"
          aria-label="Лента событий"
          class="mx-auto h-[280px] w-full max-w-[360px] overflow-y-auto rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
        >
          <GrNavbar title="Лента" sticky show-menu-button size="lg" @menu="menuOpen = true">
            <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Уведомления">
              <GrIcon><IconBell /></GrIcon>
            </GrButton>
          </GrNavbar>
          <ul class="flex flex-col gap-3 p-4">
            <li v-for="item in feed" :key="item.title" class="flex flex-col gap-0.5 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-3 py-2">
              <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">{{ item.title }}</span>
              <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.text }}</span>
            </li>
          </ul>
        </div>
      </div>
      <!-- Шторка уезжает в `body`, мимо делегированного `keepOnPage` корня, поэтому переход гасит сама ссылка. -->
      <GrDrawer v-model="menuOpen" title="Студия" side="left" size="sm">
        <nav aria-label="Разделы студии в меню" class="flex flex-col gap-3">
          <GrLink v-for="link in menuLinks" :key="link" href="#" tone="neutral" underline="none" @click.prevent="menuOpen = false">
            {{ link }}
          </GrLink>
        </nav>
      </GrDrawer>
    </Specimen>
  </div>
</template>
