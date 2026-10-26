<script setup lang="ts">
import IconBell from '~icons/lucide/bell'
import IconCalendar from '~icons/lucide/calendar'
import IconChartColumn from '~icons/lucide/chart-column'
import IconCircleHelp from '~icons/lucide/circle-help'
import IconCreditCard from '~icons/lucide/credit-card'
import IconFileText from '~icons/lucide/file-text'
import IconFolder from '~icons/lucide/folder'
import IconHistory from '~icons/lucide/history'
import IconHouse from '~icons/lucide/house'
import IconPackage from '~icons/lucide/package'
import IconSearch from '~icons/lucide/search'
import IconSettings from '~icons/lucide/settings'
import IconShieldCheck from '~icons/lucide/shield-check'
import IconSquareCheckBig from '~icons/lucide/square-check-big'
import IconTruck from '~icons/lucide/truck'
import IconUsers from '~icons/lucide/users'

import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'
import { keepOnPage } from './support'

defineProps<{ preview?: boolean }>()

const sections = [
  { value: 'overview', label: 'Обзор', icon: IconHouse },
  { value: 'docs', label: 'Документы', icon: IconFileText, badge: 128 },
  { value: 'tasks', label: 'Задачи', icon: IconSquareCheckBig, badge: 9 },
]
const teamSections = [
  { value: 'people', label: 'Люди', icon: IconUsers },
  { value: 'calendar', label: 'Календарь', icon: IconCalendar },
]
const projects = [
  { value: 'spring', label: 'Запуск весной' },
  { value: 'archive', label: 'Архив 2025' },
]

const shellSection = ref('overview')
const shellCollapsed = ref(false)
const railSection = ref('docs')
const railCollapsed = ref(true)

const shellPath = [
  { label: 'Обзор', href: '#' },
  { label: 'Запуск весной', href: '#' },
  { label: 'Оплата' },
]

const tariffSteps = [
  { value: 'plan', label: 'Тариф' },
  { value: 'team', label: 'Команда' },
  { value: 'payment', label: 'Оплата' },
  { value: 'done', label: 'Готово' },
]
const tariffStep = ref('payment')

const financeSection = ref('incoming')
const financeExpanded = ref(true)
const invoicesExpanded = ref(true)

const orderParts = [
  { value: 'items', label: 'Состав', icon: IconPackage },
  { value: 'delivery', label: 'Доставка', icon: IconTruck },
  { value: 'payment', label: 'Оплата', icon: IconCreditCard },
  { value: 'history', label: 'История', icon: IconHistory },
]
const orderPart = ref('delivery')
const orderCollapsed = ref(false)
const orderPartLabel = computed(() => orderParts.find(item => item.value === orderPart.value)?.label ?? '')

const mobileSections = [
  { value: 'overview', label: 'Обзор', icon: IconHouse },
  { value: 'docs', label: 'Документы', icon: IconFileText, badge: 128 },
  { value: 'reports', label: 'Отчёты', icon: IconChartColumn },
  { value: 'settings', label: 'Настройки', icon: IconSettings },
]
const mobileSection = ref('overview')
const mobileMenu = ref(false)
const mobileTitle = computed(() => mobileSections.find(item => item.value === mobileSection.value)?.label ?? '')

function openMobileSection(value: string): void {
  mobileSection.value = value
  mobileMenu.value = false
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex h-[104px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
      <GrSidebar landmark="navigation" aria-label="Разделы приложения" width="184px" class="h-full shrink-0">
        <GrSidebarItem label="Обзор" :icon="IconHouse" active />
        <GrSidebarItem label="Документы" :icon="IconFileText" :badge="128" />
      </GrSidebar>
      <div class="flex min-w-0 flex-1 flex-col gap-2 p-3" aria-hidden="true">
        <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">Обзор</span>
        <span class="h-2 w-4/5 rounded-[var(--gr-radius-full)] bg-[var(--gr-muted)]" />
        <span class="h-2 w-3/5 rounded-[var(--gr-radius-full)] bg-[var(--gr-muted)]" />
      </div>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Оболочка приложения" note="GrSidebar · GrNavbar: разделы со счётчиками, путь и действия в шапке" wide>
      <div class="flex h-[460px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <GrSidebar
          v-model:collapsed="shellCollapsed"
          landmark="navigation"
          aria-label="Разделы приложения"
          title="Студия"
          subtitle="Команда «Лён»"
          show-toggle-button
          class="h-full shrink-0"
        >
          <GrSidebarItem
            v-for="item in sections"
            :key="item.value"
            :label="item.label"
            :icon="item.icon"
            :badge="item.badge"
            :active="shellSection === item.value"
            @click="shellSection = item.value"
          />
          <GrSidebarItem label="Проекты" :icon="IconFolder">
            <GrSidebarItem
              v-for="item in projects"
              :key="item.value"
              :label="item.label"
              :active="shellSection === item.value"
              @click="shellSection = item.value"
            />
          </GrSidebarItem>
          <GrSidebarGroup label="Команда">
            <GrSidebarItem
              v-for="item in teamSections"
              :key="item.value"
              :label="item.label"
              :icon="item.icon"
              :active="shellSection === item.value"
              @click="shellSection = item.value"
            />
          </GrSidebarGroup>
          <GrSidebarGroup label="Пространство">
            <GrSidebarItem
              label="Настройки"
              :icon="IconSettings"
              :active="shellSection === 'settings'"
              @click="shellSection = 'settings'"
            />
          </GrSidebarGroup>
        </GrSidebar>

        <div class="flex min-w-0 flex-1 flex-col">
          <GrNavbar>
            <template #left>
              <GrBreadcrumbs :items="shellPath" size="sm" aria-label="Путь в оболочке" />
            </template>
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

          <div class="flex min-h-0 flex-1 flex-col gap-6 p-6">
            <div class="flex flex-col gap-1">
              <h5 class="text-[length:var(--gr-text-2xl)] font-500 leading-[var(--gr-leading-tight)]">
                Оформление тарифа
              </h5>
              <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
                Тариф «Команда» · 12 мест · списание 1-го числа
              </p>
            </div>
            <GrSteps v-model="tariffStep" :steps="tariffSteps" aria-label="Шаги оформления тарифа" />
            <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
              <div class="flex items-baseline justify-between gap-4">
                <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">К оплате за месяц</span>
                <span class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">4 800 ₽</span>
              </div>
              <div class="h-px bg-[var(--gr-brd)]" />
              <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
                Карта •• 4417 · счёт для бухгалтерии придёт на почту
              </p>
            </div>
          </div>
        </div>
      </div>
    </Specimen>

    <Specimen title="Свёрнутая панель" note="значки, имя раздела — в подсказке по наведению и по фокусу">
      <div class="flex items-start gap-5">
        <div class="h-[300px] shrink-0 overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)]">
          <GrSidebar
            v-model:collapsed="railCollapsed"
            landmark="navigation"
            aria-label="Разделы, свёрнутая панель"
            title="Студия"
            show-toggle-button
            class="h-full"
          >
            <GrSidebarItem
              v-for="item in sections"
              :key="item.value"
              :label="item.label"
              :icon="item.icon"
              :badge="item.badge"
              :active="railSection === item.value"
              @click="railSection = item.value"
            />
            <GrSidebarGroup label="Команда">
              <GrSidebarItem
                v-for="item in teamSections"
                :key="item.value"
                :label="item.label"
                :icon="item.icon"
                :active="railSection === item.value"
                @click="railSection = item.value"
              />
            </GrSidebarGroup>
          </GrSidebar>
        </div>
        <p class="max-w-[32ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Рейл держит навигацию под рукой на узком экране. Группы разделяет линия, а кнопка в шапке возвращает панели ширину.
        </p>
      </div>
    </Specimen>

    <Specimen title="Вложенные пункты" note="ветки раскрываются на месте, глубина — по разметке; ссылка и недоступный пункт">
      <div class="h-[384px] w-fit overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)]">
        <GrSidebar landmark="navigation" aria-label="Разделы бухгалтерии" title="Бухгалтерия" class="h-full">
          <GrSidebarItem label="Обзор" :icon="IconHouse" :active="financeSection === 'overview'" @click="financeSection = 'overview'" />
          <GrSidebarItem v-model:expanded="financeExpanded" label="Финансы" :icon="IconCreditCard">
            <GrSidebarItem v-model:expanded="invoicesExpanded" label="Счета">
              <GrSidebarItem label="Входящие" :badge="4" :active="financeSection === 'incoming'" @click="financeSection = 'incoming'" />
              <GrSidebarItem label="Исходящие" :active="financeSection === 'outgoing'" @click="financeSection = 'outgoing'" />
            </GrSidebarItem>
            <GrSidebarItem label="Возвраты" :active="financeSection === 'refunds'" @click="financeSection = 'refunds'" />
          </GrSidebarItem>
          <GrSidebarItem label="Аудит" :icon="IconShieldCheck" disabled />
          <GrSidebarItem label="Справка" :icon="IconCircleHelp" href="#" />
        </GrSidebar>
      </div>
    </Specimen>

    <Specimen title="Панель справа" note="дополняющий блок: шапка слотами, шеврон зеркалится, граница — на внутренней стороне">
      <div class="flex h-[300px] overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <div class="flex min-w-0 flex-1 flex-col gap-1 p-5">
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Заказ № 4821</span>
          <span class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">{{ orderPartLabel }}</span>
          <p class="max-w-[36ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
            Курьер привезёт заказ 22 октября с 10 до 14 и позвонит за полчаса.
          </p>
        </div>
        <GrSidebar
          v-model:collapsed="orderCollapsed"
          position="right"
          aria-label="Детали заказа"
          width="220px"
          show-toggle-button
          class="h-full shrink-0"
        >
          <template #title>
            <span class="flex items-center gap-2">
              Заказ
              <GrBadge tone="success" size="xs">
                Оплачен
              </GrBadge>
            </span>
          </template>
          <template #subtitle>
            20 октября · 3 позиции
          </template>
          <GrSidebarItem
            v-for="item in orderParts"
            :key="item.value"
            :label="item.label"
            :icon="item.icon"
            :active="orderPart === item.value"
            @click="orderPart = item.value"
          />
        </GrSidebar>
      </div>
    </Specimen>

    <Specimen title="Слоем на узком экране" note="GrSidebar · GrNavbar: кнопка меню открывает панель модальным слоем — Esc, подложка, ловушка фокуса">
      <div class="mx-auto flex h-[300px] w-full max-w-[360px] flex-col overflow-hidden rounded-[var(--gr-radius-xl)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]">
        <GrNavbar title="Студия" show-menu-button size="lg" @menu="mobileMenu = true">
          <GrAvatar name="Анна Соколова" size="sm" />
        </GrNavbar>
        <div class="flex min-h-0 flex-1 flex-col gap-2 p-4">
          <p class="text-[length:var(--gr-text-lg)] font-600 leading-[var(--gr-leading-lg)]">
            {{ mobileTitle }}
          </p>
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
            На узком экране панель не занимает место: она открывается поверх страницы и возвращает фокус на кнопку меню.
          </p>
        </div>
      </div>
      <GrSidebar
        v-model:open="mobileMenu"
        overlay
        landmark="navigation"
        aria-label="Разделы мобильного приложения"
        title="Студия"
        subtitle="Команда «Лён»"
        show-toggle-button
      >
        <GrSidebarItem
          v-for="item in mobileSections"
          :key="item.value"
          :label="item.label"
          :icon="item.icon"
          :badge="item.badge"
          :active="mobileSection === item.value"
          @click="openMobileSection(item.value)"
        />
      </GrSidebar>
    </Specimen>
  </div>
</template>
