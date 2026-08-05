<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInputTag } from '@feugene/granularity'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const KNOWN_DOMAINS = ['example.com', 'granularity.dev']

const recipients = ref(['ops@example.com'])
const error = ref('')

// Проверка асинхронная намеренно: так же выглядит обращение к серверу за
// «существует ли такой адрес». На время проверки поле показывает спиннер.
async function beforeAdd(tag: string): Promise<boolean> {
  error.value = ''

  if (!EMAIL_RE.test(tag)) {
    error.value = `«${tag}» не похож на адрес`
    return false
  }

  await new Promise(resolve => setTimeout(resolve, 500))

  const domain = tag.split('@')[1] ?? ''
  if (!KNOWN_DOMAINS.includes(domain)) {
    error.value = `Домен ${domain} не в списке разрешённых`
    return false
  }

  return true
}
</script>

<template>
  <div class="grid gap-3">
    <GrFormField
      label="Получатели"
      hint="Enter или запятая — добавить. Разрешены домены example.com и granularity.dev"
      :error="error"
    >
      <GrInputTag
        v-model="recipients"
        :before-add="beforeAdd"
        :separators="[',', ' ']"
        clearable
        placeholder="name@example.com"
        tag-tone="primary"
        @clear="error = ''"
      />
    </GrFormField>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Крестики чипов — одна остановка `Tab`: между ними ходят стрелки влево-вправо, удаляет `Delete`.
      Из пустого поля на последний чип уводит стрелка влево.
    </div>
  </div>
</template>
