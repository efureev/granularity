<script setup lang="ts">
import { ref } from 'vue'

import { GrAlert, GrButton, GrCard, GrOtpInput } from '@feugene/granularity'

const code = ref('')
const verified = ref<string | null>(null)

const pin = ref('')
const grouped = ref('')

/** Проверка «на сервере»: задержка нарочно заметная, иначе состояние не увидеть. */
function verify(value: string): void {
  verified.value = null
  setTimeout(() => {
    verified.value = value
  }, 600)
}
</script>

<template>
  <div class="grid gap-6">
    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Код из SMS
      </div>
      <GrOtpInput v-model="code" aria-label="Код из SMS" @complete="verify" />
      <GrAlert v-if="verified" tone="success" :title="`Код ${verified} отправлен на проверку`" />
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Кнопки «Отправить» нет: <code>complete</code> наступает сам, как только
        набран последний символ. Попробуйте вставить «123-456» — лишнее отсеется.
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Группы и маска
      </div>
      <div class="flex flex-wrap items-center gap-6">
        <GrOtpInput v-model="grouped" :groups="[3, 3]" aria-label="Код группами" />
        <GrOtpInput v-model="pin" :length="4" masked aria-label="PIN" />
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Маска визуальная: значение остаётся настоящим кодом, иначе сломалось бы
        автозаполнение из сообщения.
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Состояния
      </div>
      <div class="flex flex-wrap items-center gap-6">
        <GrOtpInput :model-value="'12'" invalid aria-label="Неверный код" />
        <GrOtpInput :model-value="'1234'" disabled aria-label="Недоступно" />
        <GrOtpInput :model-value="'99'" readonly aria-label="Только чтение" />
      </div>
      <GrButton size="xs" variant="ghost" @click="code = ''; grouped = ''; pin = ''">
        Очистить всё
      </GrButton>
    </GrCard>
  </div>
</template>
