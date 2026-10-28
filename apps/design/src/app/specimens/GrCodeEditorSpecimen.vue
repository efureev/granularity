<script setup lang="ts">
import type { GrCodeIssue } from '@feugene/granularity-code'
import { StreamLanguage } from '@codemirror/language'
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewConfig = ref(`{
  "retries": 3,
  "timeoutMs": 3000
}`)

const webhook = ref(`{
  "url": "https://api.len.studio/hooks/invoices",
  "events": ["invoice.paid", "invoice.overdue"],
  "retries": 3,
}`)

/** Проверка — обычный проп: сюда же отдают схему или ответ серверной валидации. */
function validateJson(value: string): GrCodeIssue[] {
  try {
    JSON.parse(value)
    return []
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const position = /position (\d+)/.exec(message)
    const from = position ? Number(position[1]) : 0
    return [{ from, to: Math.min(from + 1, value.length), severity: 'error', message }]
  }
}

const states = reactive({
  empty: '',
  invalid: '{ "retries": -1 }',
  readonly: '{ "region": "eu-central", "replicas": 2 }',
  disabled: '{ "billing": "monthly" }',
})

const bySize = reactive<Record<typeof SIZES[number], string>>({
  xs: '{ "seats": 5 }',
  sm: '{ "seats": 5 }',
  md: '{ "seats": 5 }',
  lg: '{ "seats": 5 }',
})

/**
 * Грамматика собрана на месте: подстановки шаблона письма. Имена токенов у
 * `StreamLanguage` — из CodeMirror 5: `property` таблица переводит в тег поля,
 * а современное имя осталось бы без цвета.
 */
const templateLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match('{{')) {
      while (!stream.eol() && !stream.match('}}', false))
        stream.next()
      stream.match('}}')
      return 'property'
    }
    stream.next()
    return null
  },
})

const letter = ref(`Здравствуйте, {{ client.name }}!

Счёт {{ invoice.id }} на {{ invoice.total }} ₽ оплачен.
Закрывающие документы придут на {{ client.email }}.`)

const yaml = ref(`service: billing
replicas: 2
env:
  LOG_LEVEL: info`)
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCodeEditor v-model="previewConfig" language="json" size="sm" aria-label="Настройки сервиса" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Проверка на лету" note="Замечание видно трижды: волна под местом, метка в жёлобе и пункт под полем со строкой и столбцом — связан с редактором для диктора.">
      <GrFormField label="Вебхук оплаты" hint="JSON: лишняя запятая в конце объекта">
        <GrCodeEditor v-model="webhook" language="json" :validate="validateJson" max-height="16rem" />
      </GrFormField>
    </Specimen>

    <Specimen title="Грамматика от приложения" note="Язык приносит приложение: строка — встроенный разбор JSON, объект — грамматика CodeMirror. Здесь подстановки письма собраны на месте.">
      <GrFormField label="Шаблон письма об оплате">
        <GrCodeEditor v-model="letter" :language="templateLanguage" wrap />
      </GrFormField>
    </Specimen>

    <Specimen title="Состояния" note="Тот же контракт, что у полей ядра: подпись, ошибка, недоступность и только чтение приходят из GrFormField." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Переопределение конфига" hint="Пусто — берутся значения по умолчанию">
            <GrCodeEditor v-model="states.empty" language="json" placeholder="{ }" size="sm" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Политика повторов" error="Сервер не принял: retries не меньше нуля" required>
            <GrCodeEditor v-model="states.invalid" language="json" size="sm" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Размещение" hint="Задаёт инфраструктура" readonly>
            <GrCodeEditor v-model="states.readonly" language="json" size="sm" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Тариф" hint="Меняет владелец аккаунта" disabled>
            <GrCodeEditor v-model="states.disabled" language="json" size="sm" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Кегль кода и высота строки — по шкале полей ввода.">
      <div v-for="size in SIZES" :key="size" class="flex items-start gap-3">
        <span class="w-6 shrink-0 pt-1 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrCodeEditor v-model="bySize[size]" language="json" :size="size" :line-numbers="false" :aria-label="`Места в тарифе, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Отступ по Tab" note="По умолчанию Tab уводит фокус дальше по форме; с tabIndents вставляет отступ, а Esc возвращает клавише переход — подсказка об этом стоит под полем.">
      <GrFormField label="Манифест сервиса" hint="Строка yaml — только имя языка: без грамматики текст одноцветный">
        <GrCodeEditor v-model="yaml" language="yaml" tab-indents />
      </GrFormField>
    </Specimen>
  </div>
</template>
