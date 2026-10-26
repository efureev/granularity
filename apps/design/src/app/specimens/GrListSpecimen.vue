<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref } from 'vue'
import type { GrTone } from '@feugene/granularity'
import IconBell from '~icons/lucide/bell'
import IconFilePenLine from '~icons/lucide/file-pen-line'
import IconFileSpreadsheet from '~icons/lucide/file-spreadsheet'
import IconLogOut from '~icons/lucide/log-out'
import IconReceipt from '~icons/lucide/receipt'
import IconShieldCheck from '~icons/lucide/shield-check'
import IconUser from '~icons/lucide/user'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const money = new Intl.NumberFormat('ru-RU')

function rub(value: number): string {
  return `${money.format(value)}\u00A0₽`
}

const documents: readonly { id: string, icon: Component, title: string, meta: string, status: string, tone: GrTone }[] = [
  { id: 'inv-1046', icon: IconReceipt, title: 'Счёт СЧ-1046', meta: `Студия «Лён» · ${rub(48_000)}`, status: 'Оплачен', tone: 'success' },
  { id: 'kd-0418', icon: IconFilePenLine, title: 'Договор КД-2026/0418', meta: 'ООО «Ромашка» · подписан 3 окт', status: 'Подписан', tone: 'success' },
  { id: 'act-q3', icon: IconFileSpreadsheet, title: 'Акт сверки за III квартал', meta: 'Типография «Строка» · ждёт подписи', status: 'Черновик', tone: 'neutral' },
  { id: 'inv-1044', icon: IconReceipt, title: 'Счёт СЧ-1044', meta: `Иван Петров · ${rub(7_900)}`, status: 'Просрочен', tone: 'danger' },
]

// В превью — строки с короткими заголовками: длинный перенёсся бы и вытолкнул вторую строку из карточки.
const previewDocuments = [documents[0]!, documents[3]!]

const settings: readonly { id: string, icon: Component, title: string, description: string }[] = [
  { id: 'profile', icon: IconUser, title: 'Профиль', description: 'Имя, почта и часовой пояс' },
  { id: 'security', icon: IconShieldCheck, title: 'Безопасность', description: 'Пароль и вход по коду' },
  { id: 'notifications', icon: IconBell, title: 'Уведомления', description: 'Почта и пуш — по событиям' },
]

const members = ['Анна Соколова', 'Илья Орлов', 'Мария Белова', 'Олег Смирнов']

const signedOut = ref(false)

type QueueMode = 'items' | 'loading' | 'empty'

// Пустой список по умолчанию не открыт: текст пустоты лежит внутри role="list", и axe считает его чужим потомком.
const queueMode = ref<QueueMode>('items')
const queueModes: { value: QueueMode, label: string }[] = [
  { value: 'items', label: 'Заявки' },
  { value: 'loading', label: 'Загрузка' },
  { value: 'empty', label: 'Пусто' },
]
const queue = computed(() => (queueMode.value === 'empty'
  ? []
  : [
      { id: 'r-318', title: 'Заявка №318', meta: 'Возврат оплаты · 12 400 ₽' },
      { id: 'r-317', title: 'Заявка №317', meta: 'Смена реквизитов' },
    ]))

type Build = { id: number, title: string, meta: string }

const builds: Build[] = Array.from({ length: 1000 }, (_, index) => {
  const number = 4210 - index
  return { id: number, title: `Сборка №${number}`, meta: index % 7 === 0 ? 'упала на тестах' : 'прошла · 3 мин 12 с' }
})

// Ссылки образцов ведут на «#»: переход по нему бросил бы страницу к началу.
function keepOnPage(event: MouseEvent): void {
  if (event.target instanceof Element && event.target.closest('a[href="#"]'))
    event.preventDefault()
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrList>
      <GrListItem v-for="doc in previewDocuments" :key="doc.id" :title="doc.title">
        <template #prefix>
          <span class="flex text-[var(--gr-muted-fg)]">
            <GrIcon>
              <component :is="doc.icon" />
            </GrIcon>
          </span>
        </template>
        <GrBadge :tone="doc.tone" size="sm">
          {{ doc.status }}
        </GrBadge>
      </GrListItem>
    </GrList>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2" @click="keepOnPage">
    <Specimen title="Строки" note="Иконка слева, заголовок с описанием, статус меткой справа — разметку строки писать не нужно.">
      <GrList>
        <GrListItem v-for="doc in documents" :key="doc.id" :title="doc.title" :description="doc.meta">
          <template #prefix>
            <span class="flex text-[var(--gr-muted-fg)]">
              <GrIcon>
                <component :is="doc.icon" />
              </GrIcon>
            </span>
          </template>
          <GrBadge :tone="doc.tone" size="sm">
            {{ doc.status }}
          </GrBadge>
        </GrListItem>
      </GrList>
    </Specimen>

    <Specimen title="Кликабельные строки" note="href даёт ссылку, clickable — кнопку; роль пункта остаётся на обёртке. Недоступная строка гаснет фоном, а не прозрачностью.">
      <GrList>
        <GrListItem v-for="item in settings" :key="item.id" :title="item.title" :description="item.description" href="#">
          <template #prefix>
            <span class="flex text-[var(--gr-muted-fg)]">
              <GrIcon>
                <component :is="item.icon" />
              </GrIcon>
            </span>
          </template>
        </GrListItem>
        <GrListItem title="Интеграции" description="Доступны на тарифе «Команда»" disabled clickable />
        <GrListItem :title="signedOut ? 'Вы вышли — нажмите, чтобы вернуться' : 'Выйти'" clickable @click="signedOut = !signedOut">
          <template #prefix>
            <span class="flex text-[var(--gr-danger-text)]">
              <GrIcon>
                <IconLogOut />
              </GrIcon>
            </span>
          </template>
        </GrListItem>
      </GrList>
    </Specimen>

    <Specimen title="Плотно и без линий" note="density=compact — 8 px по вертикали; divided=false снимает линии между строками.">
      <GrList :divided="false">
        <GrListItem v-for="name in members" :key="name" :title="name" density="compact" hoverable />
      </GrList>
    </Specimen>

    <Specimen title="Загрузка и пусто" note="Загрузка сильнее пустоты — скелетоны той же плотности; пустоту список видит по слоту сам, без v-if снаружи.">
      <div class="flex flex-col gap-3">
        <GrSegmented v-model="queueMode" :options="queueModes" size="sm" aria-label="Состояние очереди заявок" />
        <GrList :loading="queueMode === 'loading'" :loading-rows="2">
          <GrListItem v-for="request in queue" :key="request.id" :title="request.title" :description="request.meta" />
          <template #empty>
            <span>Ни одной заявки — новые появятся здесь.</span>
          </template>
        </GrList>
      </div>
    </Specimen>

    <Specimen title="Тысяча строк" note="items, virtual и max-height: в DOM только окно вокруг видимого, диктору — aria-setsize и aria-posinset." wide>
      <div role="region" aria-label="Сборки за месяц">
        <GrList :items="builds" item-key="id" virtual :max-height="280">
          <template #item="{ item, aria }">
            <GrListItem v-bind="aria" :title="item.title" :description="item.meta" density="compact" />
          </template>
        </GrList>
      </div>
    </Specimen>
  </div>
</template>
