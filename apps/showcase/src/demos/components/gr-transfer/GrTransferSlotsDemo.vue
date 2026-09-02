<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrEmptyState, GrTransfer } from '@feugene/granularity'

import IconInbox from '~icons/lucide/inbox'

const recipients = ref<string[]>([])

const contacts = [
  { id: 'ops', label: 'Дежурная смена', mail: 'ops@example.com' },
  { id: 'dev', label: 'Разработка', mail: 'dev@example.com' },
  { id: 'sales', label: 'Продажи', mail: 'sales@example.com' },
  { id: 'legal', label: 'Юристы', mail: 'legal@example.com' },
]

function allKeys(): string[] {
  return contacts.map(contact => contact.id)
}
</script>

<template>
  <div class="w-full">
    <GrTransfer
      v-model="recipients"
      :items="contacts"
      :searchable="false"
      source-title="Адресаты"
      target-title="Рассылка"
      aria-label="Получатели рассылки"
    >
      <!-- Своя шапка: счётчик формулируется словами, а не «0 of 4». -->
      <template #header="{ side, title, selected, total }">
        <div class="flex items-baseline gap-2 border-b border-[var(--gr-brd)] px-3 py-2">
          <span class="min-w-0 flex-1 truncate font-600">{{ title }}</span>
          <span class="shrink-0 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ selected > 0 ? `отмечено ${selected}` : `всего ${total}` }}
            <template v-if="side === 'target' && total === 0">— пусто</template>
          </span>
        </div>
      </template>

      <!-- Своя строка: имя и адрес в две строки. -->
      <template #item="{ item }">
        <span class="min-w-0 flex-1">
          <span class="block truncate">{{ item.label }}</span>
          <span class="block truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ item.mail }}
          </span>
        </span>
      </template>

      <!-- Свои кнопки: «взять всех» и «очистить» вместо пары стрелок. -->
      <template #actions>
        <div class="flex flex-col gap-2">
          <GrButton size="sm" variant="secondary" @click="recipients = allKeys()">
            Все
          </GrButton>
          <GrButton size="sm" variant="ghost" @click="recipients = []">
            Сброс
          </GrButton>
        </div>
      </template>

      <!-- Своя пустота: у каждой панели она значит разное. -->
      <template #empty="{ side }">
        <GrEmptyState
          v-if="side === 'target'"
          title="Рассылка пуста"
          description="Отметьте адресатов слева и нажмите «Все»."
          variant="ghost"
        >
          <template #icon>
            <IconInbox class="h-6 w-6" aria-hidden="true" />
          </template>
        </GrEmptyState>
        <p v-else class="px-4 py-6 text-center text-[var(--gr-muted-fg)]">
          Все адресаты уже в рассылке.
        </p>
      </template>
    </GrTransfer>
  </div>
</template>
