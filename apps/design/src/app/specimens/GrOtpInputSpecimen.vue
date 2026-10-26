<script setup lang="ts">
import { ref, watch } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewCode = ref('4829')

const code = ref('')
const codeNote = ref('')

function onComplete(value: string): void {
  codeNote.value = `Код ${value} принят — проверка ушла без кнопки «Отправить»`
}

// `complete` приходит в том же тике, что и обновление модели, а наблюдатель срабатывает
// после него: сбрасывать подпись можно только у недописанного кода.
watch(code, (value) => {
  if (value.length < 6)
    codeNote.value = ''
})

const rejectedCode = ref('482913')
const lockedCode = ref('')
const shownCode = ref('731046')

const pin = ref('')
const invite = ref('')
const stepCode = ref('27')
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Код из SMS">
      <GrOtpInput v-model="previewCode" :length="4" size="sm" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Код из SMS" note="Одно поле под ячейками: код из сообщения подставляется сам, вставка «123-456» даёт 123456.">
      <GrFormField label="Код из SMS" hint="Отправили на +7 ··· ··· 12-34">
        <GrOtpInput v-model="code" :length="6" :groups="[3, 3]" one-time-code @complete="onComplete" />
      </GrFormField>
      <p role="status" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        {{ codeNote }}
      </p>
    </Specimen>

    <Specimen title="Состояния" note="Ошибка красит рамку всех ячеек; только чтение оставляет код выделяемым.">
      <GrFormField label="Код подтверждения" error="Код не подошёл — запросите новый">
        <GrOtpInput v-model="rejectedCode" :length="6" :groups="[3, 3]" />
      </GrFormField>
      <GrFormField label="Код из письма" hint="Новый код — через 40 секунд" disabled>
        <GrOtpInput v-model="lockedCode" :length="6" :groups="[3, 3]" />
      </GrFormField>
      <GrFormField label="Код доступа к сейфу" readonly>
        <GrOtpInput v-model="shownCode" :length="6" :groups="[3, 3]" />
      </GrFormField>
    </Specimen>

    <Specimen title="PIN" note="Точки вместо цифр — значение остаётся настоящим кодом.">
      <GrFormField label="PIN-код карты" hint="Четыре цифры">
        <GrOtpInput v-model="pin" :length="4" masked />
      </GrFormField>
    </Specimen>

    <Specimen title="Буквы и цифры" note="Латиница приводится к верхнему регистру, пустая ячейка показывает знак-заполнитель.">
      <GrFormField label="Код приглашения" hint="Из письма от владельца пространства">
        <GrOtpInput v-model="invite" :length="6" :groups="[3, 3]" type="alphanumeric" placeholder="·" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Сторона ячейки равна высоте поля той же ступени — код встаёт в линию с формой." wide>
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex items-center gap-3">
          <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
          <GrOtpInput v-model="stepCode" :size="size" :length="4" :aria-label="`Код, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
