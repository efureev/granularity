<script setup lang="ts">
import type { GrCodeLine, GrCodeRole, GrCodeTokenizer } from '@feugene/granularity-code'
import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewInvoice = { id: 'СЧ-1046', paid: true }

const invoiceResponse = {
  id: 'СЧ-1046',
  status: 'paid',
  client: { name: 'Студия «Лён»', inn: '7704123456' },
  amount: { value: 48000, vat: 8000, currency: 'RUB' },
  items: [
    { sku: 'DS-01', title: 'Фирменный стиль', qty: 1 },
    { sku: 'DS-07', title: 'Вёрстка презентации', qty: 2 },
  ],
  overdue: false,
  comment: null,
}
const copied = ref('')

const SIZE_SAMPLE = '{ "sku": "DS-07", "qty": 2, "paid": true }'

const GATEWAY_LOG = [
  '2026-10-24T10:42:04.881Z WARN  gateway upstream=invoices-api attempt=3 status=502 latency_ms=1841 trace=7f3a91c0b28d4e15 message="bad gateway, retrying with backoff"',
  '2026-10-24T10:42:06.204Z INFO  gateway upstream=invoices-api attempt=4 status=200 latency_ms=212 trace=7f3a91c0b28d4e15',
].join('\n')

const TS_SOURCE = `// Пересчёт счёта после смены скидки
export interface Invoice {
  total: number
  discount?: number
}

export function payable(invoice: Invoice): number {
  const discount = invoice.discount ?? 0
  return Math.max(invoice.total - discount, 0)
}`

const TS_KEYWORDS = new Set(['export', 'interface', 'function', 'const', 'return'])
const TS_PRIMITIVES = new Set(['number', 'string', 'boolean'])
const TS_LITERALS = new Set(['true', 'false', 'null', 'undefined'])
/** Последняя ветка ловит любой знак, не взятый раньше: пропущенный знак выпал бы из показа. */
const TS_TOKEN = /(\/\/.*$)|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Z_$][\w$]*)|(\s+)|(\S)/gi

function tsRole(match: RegExpExecArray, line: string): GrCodeRole {
  const [text, comment, string, number, word] = match
  if (comment)
    return 'comment'
  if (string)
    return 'string'
  if (number)
    return 'number'
  if (word) {
    if (TS_KEYWORDS.has(word))
      return 'keyword'
    if (TS_LITERALS.has(word))
      return 'literal'
    if (TS_PRIMITIVES.has(word) || /^[A-Z]/.test(word))
      return 'type'
    return line[match.index + word.length] === '(' ? 'function' : 'variable'
  }
  return text.trim() === '' ? 'plain' : 'punctuation'
}

const tsHighlighter: GrCodeTokenizer = code => code.split('\n').map<GrCodeLine>(line =>
  [...line.matchAll(TS_TOKEN)].map(match => ({ text: match[0], role: tsRole(match, line) })))

/** Данные из БД бывают любыми: цикл, BigInt и поле, чтение которого бросает. */
const brokenRecord: Record<string, unknown> = {
  id: 'СЧ-1047',
  ledgerId: 9_007_199_254_740_993n,
  author: { name: 'Анна Соколова' },
  get signature(): string {
    throw new Error('подпись ещё не загружена')
  },
}
brokenRecord.parent = brokenRecord
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCodeBlock :code="previewInvoice" size="sm" line-numbers aria-label="Ответ API: счёт" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ответ API" note="Объект печатается с отступом; номера строк — CSS-счётчик, поэтому в выделение и буфер они не попадают, а кнопка копирует исходный текст.">
      <GrCodeBlock
        :code="invoiceResponse"
        line-numbers
        max-height="16rem"
        aria-label="Ответ API: счёт СЧ-1046"
        @copy="copied = 'Ответ скопирован в буфер'"
      />
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ copied }}
      </p>
    </Specimen>

    <Specimen title="Ступени" note="Кегль кода и внутренние отступы — по шкале контролов.">
      <div v-for="size in SIZES" :key="size" class="flex items-start gap-3">
        <span class="w-6 shrink-0 pt-1 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrCodeBlock :code="SIZE_SAMPLE" :size="size" :copyable="false" :aria-label="`Позиция счёта, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Прокрутка и перенос" note="Без переноса длинная строка уходит в горизонтальную прокрутку, и блок встаёт в порядок Tab; с переносом лог ложится в ширину колонки.">
      <GrCodeBlock :code="GATEWAY_LOG" language="text" line-numbers aria-label="Лог шлюза, без переноса" />
      <GrCodeBlock :code="GATEWAY_LOG" language="text" line-numbers wrap aria-label="Лог шлюза, с переносом" />
    </Specimen>

    <Specimen title="Подсветка приложения" note="Встроенно разбираются JSON и текст; другой язык красит функция-токенизатор приложения, а цвет каждой роли даёт тема.">
      <GrCodeBlock :code="TS_SOURCE" language="ts" :highlighter="tsHighlighter" line-numbers aria-label="Пересчёт счёта, TypeScript" />
    </Specimen>

    <Specimen title="Сбой сериализации" note="Повторная ссылка — «[Circular]», BigInt — с суффиксом n, поле, чтение которого бросает, — «[Unserializable]» на своём месте; соседние поля остаются." wide>
      <GrCodeBlock :code="brokenRecord" :copyable="false" aria-label="Запись с циклом и сломанным полем" />
    </Specimen>
  </div>
</template>
