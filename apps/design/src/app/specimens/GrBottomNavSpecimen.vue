<script setup lang="ts">
import IconHouse from '~icons/lucide/house'
import IconMessageSquare from '~icons/lucide/message-square'
import IconSearch from '~icons/lucide/search'
import IconShoppingBag from '~icons/lucide/shopping-bag'
import IconSquareCheckBig from '~icons/lucide/square-check-big'
import IconUser from '~icons/lucide/user'
import IconWallet from '~icons/lucide/wallet'

import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'
import { keepOnPage, portrait } from './support'

defineProps<{ preview?: boolean }>()

const mobileSections = [
  { value: 'feed', label: 'Лента', icon: IconHouse },
  { value: 'search', label: 'Поиск', icon: IconSearch },
  { value: 'tasks', label: 'Задачи', icon: IconSquareCheckBig, badge: 9 },
  { value: 'chat', label: 'Сообщения', icon: IconMessageSquare, badge: 3 },
  { value: 'profile', label: 'Профиль', icon: IconUser },
]
const mobileSection = ref('tasks')
const mobileTitle = computed(() => mobileSections.find(item => item.value === mobileSection.value)?.label ?? '')
const mobileTasks = ['Согласовать смету', 'Отправить макеты в печать', 'Созвон с подрядчиком']

const previewSections = mobileSections.slice(0, 4)
const previewSection = ref('tasks')

const shopSections = [
  { value: 'home', label: 'Главная', icon: IconHouse },
  { value: 'catalog', label: 'Каталог', icon: IconSearch },
  { value: 'cart', label: 'Корзина', icon: IconShoppingBag, badge: 2 },
  { value: 'profile', label: 'Профиль', icon: IconUser },
]
const compactSection = ref('catalog')
const roomySection = ref('catalog')

const photoAnna = portrait('hsl(24, 62%, 62%)', 'hsl(352, 48%, 46%)')
const linkSections = [
  { value: 'home', label: 'Главная', icon: IconHouse, href: '#' },
  { value: 'wallet', label: 'Кошелёк', icon: IconWallet, href: '#', disabled: true },
  { value: 'chat', label: 'Чаты', icon: IconMessageSquare, href: '#' },
  { value: 'me', label: 'Анна', href: '#', ariaLabel: 'Профиль: Анна Соколова' },
]
const linkSection = ref('me')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="mx-auto w-full max-w-[320px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
      <GrBottomNav
        v-model="previewSection"
        :items="previewSections"
        position="static"
        hide-above="none"
        aria-label="Разделы мобильного приложения"
      />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Мобильный экран" note="панель встроена в макет: обычный блок в потоке, видна на любой ширине">
      <div class="mx-auto flex h-[300px] w-full max-w-[360px] flex-col overflow-hidden rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <div class="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <p class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
            {{ mobileTitle }}
          </p>
          <div
            v-for="task in mobileTasks"
            :key="task"
            class="rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-3 py-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
          >
            {{ task }}
          </div>
        </div>
        <GrBottomNav
          v-model="mobileSection"
          :items="mobileSections"
          position="static"
          hide-above="none"
          aria-label="Разделы мобильного приложения"
        />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs и lg: меняются полоса, глиф и кегль, а цель для пальца — 44px на любой ступени">
      <div class="mx-auto flex w-full max-w-[360px] flex-col gap-4">
        <div class="overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
          <GrBottomNav
            v-model="compactSection"
            :items="shopSections"
            size="xs"
            position="static"
            hide-above="none"
            aria-label="Разделы магазина, компактно"
          />
        </div>
        <div class="overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
          <GrBottomNav
            v-model="roomySection"
            :items="shopSections"
            size="lg"
            position="static"
            hide-above="none"
            aria-label="Разделы магазина, крупно"
          />
        </div>
      </div>
    </Specimen>

    <Specimen title="Свой пункт, ссылки и недоступный раздел" note="аватар на месте иконки профиля; пункты — ссылки, «Кошелёк» выпал из порядка Tab">
      <div class="mx-auto w-full max-w-[360px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <GrBottomNav
          v-model="linkSection"
          :items="linkSections"
          position="static"
          hide-above="none"
          aria-label="Разделы кошелька"
        >
          <template #item="{ item }">
            <GrAvatar v-if="item.value === 'me'" name="Анна Соколова" :src="photoAnna" :size="20" />
            <component :is="item.icon" v-else class="block h-5 w-5 shrink-0" aria-hidden="true" />
            <span class="max-w-full truncate leading-none">{{ item.label }}</span>
          </template>
        </GrBottomNav>
      </div>
    </Specimen>
  </div>
</template>
