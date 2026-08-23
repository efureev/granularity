<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrEmptyState, GrTable } from '@feugene/granularity'
import type { GrCodeResult } from '@feugene/granularity-media'

/**
 * Приёмка: коробки сканируют подряд, и одинаковых среди них большинство.
 *
 * Здесь видно, зачем `continuous`: без него второй такой же штрихкод не дал бы
 * события вовсе, и кладовщик решил бы, что сканер не сработал. С ним повтор —
 * законная вторая единица товара.
 */
/**
 * Справочник — `Map`, а не объект: ключ штрихкода это строка, и у объекта она
 * превратилась бы в число. Код с ведущим нулём (UPC-A, записанный как EAN-13)
 * потерял бы его молча — и позиция перестала бы находиться.
 */
const CATALOG = new Map([
  ['4600051000057', 'Кофе зерновой, 1 кг'],
  ['5901234123457', 'Бумага А4, 500 л'],
  ['4008400402222', 'Батарейки AA, 4 шт'],
])

interface Position {
  code: string
  title: string
  count: number
}

const positions = ref<Position[]>([])

const total = computed(() => positions.value.reduce((sum, item) => sum + item.count, 0))

function onDetect(codes: GrCodeResult[]) {
  for (const code of codes) {
    const found = positions.value.find(item => item.code === code.value)

    if (found) {
      found.count += 1
      continue
    }

    positions.value = [
      { code: code.value, title: CATALOG.get(code.value) ?? 'Неизвестная позиция', count: 1 },
      ...positions.value,
    ]
  }
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-3">
      <GrCodeScanner continuous :formats="['ean_13', 'code_128', 'qr_code']" @detect="onDetect" />
      <p class="showcase-demo-text text-sm">
        Наводите на штрихкоды подряд — повтор увеличивает количество, новый код добавляет строку.
      </p>
    </div>

    <div class="grid content-start gap-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600">
          Принято: {{ total }} шт
        </span>
        <GrButton
          size="xs"
          variant="outline"
          :disabled="positions.length === 0"
          @click="positions = []"
        >
          Очистить
        </GrButton>
      </div>

      <GrTable v-if="positions.length > 0" :column-count="3">
        <template #header>
          <tr>
            <th class="text-left">
              Позиция
            </th>
            <th class="text-left">
              Код
            </th>
            <th class="text-right">
              Кол-во
            </th>
          </tr>
        </template>

        <tr v-for="item in positions" :key="item.code">
          <td>{{ item.title }}</td>
          <td><code class="showcase-demo-text text-xs">{{ item.code }}</code></td>
          <td class="text-right">
            <GrBadge size="sm" :tone="item.count > 1 ? 'success' : 'neutral'">
              {{ item.count }}
            </GrBadge>
          </td>
        </tr>
      </GrTable>

      <GrEmptyState
        v-else
        title="Пока ничего не отсканировано"
        description="Три кода из справочника опознаются по названию, остальные попадут как «Неизвестная позиция» — на складе это отдельная задача приёмщика."
      />
    </div>
  </div>
</template>
