<script setup lang="ts">
import type { GrCheckboxGroupOption } from '@feugene/granularity'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const CARD_OPTIONS: GrCheckboxGroupOption[] = [
  { value: 'mentions', label: 'Упоминания' },
  { value: 'replies', label: 'Ответы' },
  { value: 'digest', label: 'Сводка' },
]
const card = ref(['mentions', 'replies'])

const NOTIFY_OPTIONS: GrCheckboxGroupOption[] = [
  { value: 'mentions', label: 'Упоминания' },
  { value: 'replies', label: 'Ответы в обсуждениях' },
  { value: 'digest', label: 'Еженедельная сводка' },
]
const notify = ref(['mentions', 'replies'])

const CHANNEL_OPTIONS: GrCheckboxGroupOption[] = [
  { value: 'app', label: 'В приложении' },
  { value: 'mail', label: 'Почта' },
  { value: 'telegram', label: 'Телеграм', disabled: true },
]
const channels = ref<string[]>([])
const channelsError = computed(() => (channels.value.length ? undefined : 'Выберите хотя бы один канал'))

const ROLE_RIGHTS: GrCheckboxGroupOption[] = [
  { value: 'read', label: 'Чтение' },
  { value: 'comment', label: 'Комментарии' },
  { value: 'edit', label: 'Правка' },
]
const EXPORT_OPTIONS: GrCheckboxGroupOption[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Таблица' },
]

const RIGHTS = [
  { value: 'read', title: 'Чтение', description: 'Видит документы и комментарии' },
  { value: 'edit', title: 'Правка', description: 'Меняет документы, но не удаляет' },
  { value: 'invite', title: 'Приглашения', description: 'Зовёт новых участников в проект' },
]
const rights = ref(['read', 'edit'])

const DAYS: GrCheckboxGroupOption[] = [
  { value: 'mon', label: 'Пн' },
  { value: 'tue', label: 'Вт' },
  { value: 'wed', label: 'Ср' },
  { value: 'thu', label: 'Чт' },
  { value: 'fri', label: 'Пт' },
]
const days = ref(['mon', 'wed', 'fri'])
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Уведомления">
      <GrCheckboxGroup v-model="card" :options="CARD_OPTIONS" direction="horizontal" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="В поле" note="Группа подписана, как поле, — заголовком над колонкой.">
      <GrFormField label="Уведомления">
        <GrCheckboxGroup v-model="notify" :options="NOTIFY_OPTIONS" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ошибка" note="Одна строка под группой; недоступный вариант гаснет отдельно.">
      <GrFormField label="Каналы" :error="channelsError" required>
        <GrCheckboxGroup v-model="channels" :options="CHANNEL_OPTIONS" direction="horizontal" />
      </GrFormField>
    </Specimen>

    <Specimen title="Только чтение и недоступная" note="readonly оставляет выбор видимым, но не даёт его менять; disabled гасит всю группу.">
      <GrFormField label="Права роли" hint="Задаёт владелец пространства">
        <GrCheckboxGroup :model-value="['read', 'comment']" :options="ROLE_RIGHTS" direction="horizontal" readonly />
      </GrFormField>
      <GrFormField label="Форматы выгрузки" hint="Доступно на тарифе «Команда»" disabled>
        <GrCheckboxGroup :model-value="['pdf']" :options="EXPORT_OPTIONS" direction="horizontal" />
      </GrFormField>
    </Specimen>

    <Specimen title="Своя разметка" note="Флажки слотом — когда подписи нужна вторая строка; модель и состояния раздаёт группа.">
      <GrFormField label="Права участника">
        <GrCheckboxGroup v-model="rights">
          <GrCheckbox v-for="item in RIGHTS" :key="item.value" :value="item.value">
            <span class="flex flex-col gap-0.5">
              <span class="text-[var(--gr-fg)]">{{ item.title }}</span>
              <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.description }}</span>
            </span>
          </GrCheckbox>
        </GrCheckboxGroup>
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Ступень задаётся группе и доходит до каждого флажка." wide>
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ size }}
          </span>
          <GrCheckboxGroup v-model="days" :options="DAYS" :size="size" direction="horizontal" :aria-label="`Дни рассылки, ступень ${size}`" />
        </template>
      </div>
    </Specimen>
  </div>
</template>
