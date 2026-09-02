<script setup lang="ts">
import { ref } from 'vue'

import { GrAffix, GrInput, GrSwitch } from '@feugene/granularity'

const sticky = ref(true)
const query = ref('')

const files = [
  'Договор поставки № 4417.pdf',
  'Акт сверки за март.xlsx',
  'Приложение № 2.docx',
  'Спецификация оборудования.pdf',
  'Счёт № 118 от 04.03.xlsx',
  'Протокол разногласий.docx',
  'Доверенность на получение.pdf',
  'Реестр отгрузок.xlsx',
  'Гарантийное письмо.pdf',
]
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <label class="flex w-fit items-center gap-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
      <GrSwitch v-model="sticky" />
      Панель прилипает
    </label>

    <!--
      Прилипание гасится пропом, а не `v-if` снаружи: размонтирование увело бы
      фокус из поля и стёрло введённый текст.
    -->
    <div
      class="h-[280px] overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
      tabindex="0"
      role="group"
      aria-label="Список вложений"
    >
      <GrAffix :disabled="!sticky">
        <div class="px-3 py-3">
          <GrInput v-model="query" size="sm" placeholder="Поиск по вложениям" aria-label="Поиск по вложениям" />
        </div>
      </GrAffix>

      <ul>
        <li
          v-for="file in files"
          :key="file"
          class="border-b border-[var(--gr-brd)] px-3 py-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] last:border-b-0"
        >
          {{ file }}
        </li>
      </ul>
    </div>
  </div>
</template>
