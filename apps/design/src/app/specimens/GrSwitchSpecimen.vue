<script setup lang="ts">
import { reactive, ref } from 'vue'

import IconCheck from '~icons/lucide/check'
import IconX from '~icons/lucide/x'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const card = reactive({ autosave: true, sound: false })

const switches = reactive({ autosave: true, sound: false, sync: true, consent: false })

const SETTINGS = [
  { id: 'mentions', title: 'Упоминания', description: 'Когда вас отмечают в обсуждении', disabled: false },
  { id: 'documents', title: 'Изменения в документах', description: 'Только в тех, где вы автор', disabled: false },
  { id: 'sound', title: 'Звук', description: 'Меняет администратор пространства', disabled: true },
] as const
const settings = reactive({ mentions: true, documents: false, sound: true })

const offline = ref(true)

const stateText = reactive({ notifications: true, wifi: false, access: true })

const marked = reactive({ autosave: true, backup: false })
const backupSaving = ref(true)
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrSwitch v-model="card.autosave">
      Автосохранение
    </GrSwitch>
    <GrSwitch v-model="card.sound">
      Звук уведомлений
    </GrSwitch>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Тумблер действует сразу; пока изменение уходит, бегунок крутится.">
      <div class="flex flex-col gap-3">
        <GrSwitch v-model="switches.autosave">
          Автосохранение
        </GrSwitch>
        <GrSwitch v-model="switches.sound">
          Звук
        </GrSwitch>
        <GrSwitch v-model="switches.sync" loading loading-text="Подключаем синхронизацию">
          Синхронизация · подключаем
        </GrSwitch>
        <GrSwitch :model-value="true" disabled>
          Публичная ссылка · меняет владелец
        </GrSwitch>
        <GrSwitch :model-value="true" readonly>
          Вход по второму фактору · требует организация
        </GrSwitch>
        <GrFormField :error="switches.consent ? undefined : 'Без согласия отправить заявку нельзя'">
          <GrSwitch v-model="switches.consent" required>
            Согласие на обработку данных
          </GrSwitch>
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Список настроек" note="Настройка без «Сохранить» — тумблер в конце строки.">
      <div class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4">
        <GrSwitch
          v-for="row in SETTINGS"
          :key="row.id"
          v-model="settings[row.id]"
          :disabled="row.disabled"
          label-position="start"
          class="w-full justify-between border-b border-[var(--gr-brd)] py-3 text-start last:border-b-0"
        >
          <span class="flex flex-col items-start gap-0.5">
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-fg)]">{{ row.title }}</span>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ row.description }}</span>
          </span>
        </GrSwitch>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Дорожка и бегунок растут по шкале xs · sm · md · lg; подпись встаёт по центру дорожки.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <div class="min-w-0">
            <GrSwitch v-model="offline" :size="size">
              Офлайн-режим
            </GrSwitch>
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Подпись состояния" note="show-state-text кладёт «да / нет» в дорожку — только на md и lg; auto-width растягивает её под свой текст.">
      <div class="flex flex-col gap-3">
        <GrSwitch v-model="stateText.notifications" show-state-text>
          Уведомления
        </GrSwitch>
        <GrSwitch v-model="stateText.wifi" size="lg" show-state-text>
          Только по Wi-Fi
        </GrSwitch>
        <GrSwitch v-model="stateText.access" show-state-text auto-width checked-text="Включено" unchecked-text="Отключено">
          Доступ по ссылке
        </GrSwitch>
      </div>
    </Specimen>

    <Specimen title="Знак на бегунке" note="Слоты checked-icon и unchecked-icon; пока идёт запрос, знак уступает место спиннеру.">
      <div class="flex flex-col gap-3">
        <GrSwitch v-model="marked.autosave">
          <template #checked-icon>
            <IconCheck class="h-full w-full" />
          </template>
          <template #unchecked-icon>
            <IconX class="h-full w-full" />
          </template>
          Автосохранение
        </GrSwitch>
        <GrSwitch v-model="marked.backup" :loading="backupSaving" loading-text="Включаем резервную копию">
          <template #checked-icon>
            <IconCheck class="h-full w-full" />
          </template>
          <template #unchecked-icon>
            <IconX class="h-full w-full" />
          </template>
          Резервная копия{{ backupSaving ? ' · сохраняем' : '' }}
        </GrSwitch>
        <div>
          <GrButton size="sm" variant="ghost" tone="neutral" @click="backupSaving = !backupSaving">
            {{ backupSaving ? 'Завершить запрос' : 'Начать запрос' }}
          </GrButton>
        </div>
      </div>
    </Specimen>
  </div>
</template>
