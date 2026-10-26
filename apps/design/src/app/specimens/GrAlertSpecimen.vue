<script setup lang="ts">
import { ref } from 'vue'

import type { GrTone } from '@feugene/granularity'

import IconRocket from '~icons/lucide/rocket'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const ALERT_SAMPLES: { tone: GrTone, title: string, text: string }[] = [
  { tone: 'info', title: 'Плановые работы в субботу', text: 'С 02:00 до 04:00 сервис будет только для чтения.' },
  { tone: 'success', title: 'Домен подтверждён', text: 'Письма команды теперь уходят с адреса studio.ru.' },
  { tone: 'warning', title: 'Место почти закончилось', text: 'Занято 92 % из 50 ГБ — удалите старые выгрузки.' },
  { tone: 'danger', title: 'Оплата не прошла', text: 'Банк отклонил карту — проверьте её или выберите другую.' },
  { tone: 'neutral', title: 'Документ открыт только для чтения', text: 'Редактирует Иван Петров — правки станут доступны позже.' },
]
const ALERT_VARIANTS = [
  { variant: 'soft', title: 'Мягкая заливка', note: 'Тонированная подложка; warning и danger объявляются сразу, остальные ждут паузы.' },
  { variant: 'outline', title: 'Рамка', note: 'Рамка тона на фоне страницы — для спокойных пояснений рядом с другими сообщениями.' },
] as const

const hiddenAlerts = ref<string[]>([])

function hideAlert(key: string): void {
  if (!hiddenAlerts.value.includes(key))
    hiddenAlerts.value.push(key)
}

function isAlertShown(key: string): boolean {
  return !hiddenAlerts.value.includes(key)
}

function hasHiddenAlerts(prefix: string): boolean {
  return hiddenAlerts.value.some(key => key.startsWith(prefix))
}

function restoreAlerts(prefix: string): void {
  hiddenAlerts.value = hiddenAlerts.value.filter(key => !key.startsWith(prefix))
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrAlert tone="info" title="Плановые работы в субботу">
      С 02:00 до 04:00 сервис только для чтения.
    </GrAlert>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Заголовок и действия" note="Заголовок — факт, текст — что делать. Действия — обычные кнопки sm под текстом.">
      <GrAlert
        tone="warning"
        title="Пробный период заканчивается через 3 дня"
        closable
        :visible="isAlertShown('lead:trial')"
        @close="hideAlert('lead:trial')"
      >
        Выберите тариф, чтобы команда не потеряла доступ к проектам.
        <template #actions>
          <GrButton size="sm" tone="neutral" @click="hideAlert('lead:trial')">
            Выбрать тариф
          </GrButton>
          <GrButton size="sm" variant="ghost" tone="neutral" @click="hideAlert('lead:trial')">
            Позже
          </GrButton>
        </template>
      </GrAlert>
      <GrAlert
        tone="danger"
        title="Выгрузка не удалась"
        closable
        :visible="isAlertShown('lead:export')"
        @close="hideAlert('lead:export')"
      >
        Сервис отчётов ответил ошибкой 502 — данные не потеряны.
        <template #actions>
          <GrButton size="sm" tone="danger" @click="hideAlert('lead:export')">
            Повторить
          </GrButton>
          <GrButton size="sm" variant="outline" tone="danger" @click="hideAlert('lead:export')">
            Открыть журнал
          </GrButton>
        </template>
      </GrAlert>
      <GrAlert
        tone="neutral"
        closable
        :visible="isAlertShown('lead:draft')"
        @close="hideAlert('lead:draft')"
      >
        Черновик сохранён в 14:32 — его видите только вы.
      </GrAlert>
      <div v-if="hasHiddenAlerts('lead:')">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="restoreAlerts('lead:')">
          Вернуть сообщения
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Иконка" note="Глиф выбирается по тону; слот icon подменяет его, icon=false убирает — там, где сообщений много.">
      <GrAlert tone="success" title="Релиз 2.4 выкачен">
        Новые отчёты уже доступны всей команде.
        <template #icon>
          <IconRocket class="h-5 w-5" />
        </template>
      </GrAlert>
      <GrAlert tone="slate" :icon="false">
        Черновик сохраняется автоматически каждые 30 секунд.
      </GrAlert>
      <GrAlert tone="azure" :icon="false" title="Доступ из внешней команды">
        Подрядчик видит только раздел «Макеты».
      </GrAlert>
    </Specimen>

    <Specimen
      v-for="group in ALERT_VARIANTS"
      :key="group.variant"
      :title="group.title"
      :note="group.note"
    >
      <GrAlert
        v-for="sample in ALERT_SAMPLES"
        :key="sample.tone"
        :tone="sample.tone"
        :variant="group.variant"
        :title="sample.title"
        closable
        :visible="isAlertShown(`${group.variant}:${sample.tone}`)"
        @close="hideAlert(`${group.variant}:${sample.tone}`)"
      >
        {{ sample.text }}
      </GrAlert>
      <div v-if="hasHiddenAlerts(`${group.variant}:`)">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="restoreAlerts(`${group.variant}:`)">
          Вернуть сообщения
        </GrButton>
      </div>
    </Specimen>
  </div>
</template>
