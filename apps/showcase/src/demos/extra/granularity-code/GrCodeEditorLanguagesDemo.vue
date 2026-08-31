<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'

import { GrSegmented } from '@feugene/granularity'

/**
 * Три языка — три отдельных npm-пакета CodeMirror, и грузит их **приложение**.
 *
 * Встроенный набор либо тащил бы в бандл языки, которых приложению не нужно,
 * либо превращался в optional peer с динамическим импортом, ломающим сборку у
 * того, кто пакет не поставил. Поэтому проп `language` принимает тик — функцию с
 * промисом, — и границей импорта владеет тот, кто знает свои языки.
 */
const SNIPPETS = {
  ts: `interface Order {
  id: string
  total: number
  paid: boolean
}

export function unpaid(orders: Order[]): Order[] {
  return orders.filter(order => !order.paid)
}`,
  php: `<?php

final class OrderRepository
{
    public function unpaid(int $limit = 20): array
    {
        return $this->query
            ->where('paid', false)
            ->limit($limit)
            ->get();
    }
}`,
  // Отступы табами — как их и пишет `gofmt`; в исходнике демо они экранированы,
  // потому что литеральная табуляция в репозитории запрещена линтером.
  go: [
    'package orders',
    '',
    'import "context"',
    '',
    'func Unpaid(ctx context.Context, db *DB) ([]Order, error) {',
    '\trows, err := db.QueryContext(ctx, "select * from orders where paid = false")',
    '\tif err != nil {',
    '\t\treturn nil, err',
    '\t}',
    '',
    '\treturn scan(rows)',
    '}',
  ].join('\n'),
}

type Language = keyof typeof SNIPPETS

/**
 * Грамматики — тиком, а не готовым расширением: пакет языка приезжает только
 * когда его выбрали. Переключение между вкладками не грузит два остальных.
 */
const GRAMMARS: Record<Language, () => Promise<unknown>> = {
  ts: () => import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })),
  php: () => import('@codemirror/lang-php').then(m => m.php()),
  go: () => import('@codemirror/lang-go').then(m => m.go()),
}

const language = ref<Language>('ts')
const code = ref(SNIPPETS.ts)
const loaded = shallowRef(new Set<Language>())

watch(language, (next) => {
  code.value = SNIPPETS[next]
  loaded.value = new Set([...loaded.value, next])
}, { immediate: true })

const grammar = computed(() => GRAMMARS[language.value])

const loadedNote = computed(() => loaded.value.size === 3
  ? 'все три уже в памяти'
  : 'остальные приедут по выбору')
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="language"
      size="sm"
      :options="[
        { value: 'ts', label: 'TypeScript' },
        { value: 'php', label: 'PHP' },
        { value: 'go', label: 'Go' },
      ]"
    />

    <GrCodeEditor
      v-model="code"
      :language="grammar"
      :aria-label="`Код на ${language}`"
      line-numbers
      max-height="18rem"
    />

    <p class="showcase-demo-text text-sm">
      Загружено грамматик: <b>{{ loaded.size }}</b> из 3 — {{ loadedNote }}
    </p>
  </div>
</template>
