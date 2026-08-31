<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrSwitch } from '@feugene/granularity'
import type { GrDiffHunk } from '@feugene/granularity-code'

/**
 * Дифф, посчитанный на сервере: git отдал участки, считать заново нечего.
 *
 * `hunks` сильнее `before`/`after` — компонент только нумерует строки и рисует.
 */
const HUNKS: GrDiffHunk[] = [
  { op: 'equal', lines: ['def deploy(env):', '    check_health(env)'] },
  { op: 'remove', lines: ['    rollout(env, strategy="recreate")'] },
  { op: 'add', lines: ['    rollout(env, strategy="rolling")', '    wait_for_ready(env, timeout=120)'] },
  { op: 'equal', lines: ['    notify(env)', '    return True'] },
]

const empty = ref(false)
const copied = ref<string | null>(null)

const hunks = computed(() => empty.value ? [] : HUNKS)

function copyLine(text: string): void {
  copied.value = text.trim()
}
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="empty" size="sm">
      Сервер вернул пустой ответ
    </GrSwitch>

    <GrDiff :hunks="hunks" language="text">
      <!-- Своя сводка вместо встроенной: слот получает готовые числа. -->
      <template #summary="{ added, removed }">
        <span class="showcase-demo-text text-sm">
          Ревизия <b>a81f3c</b> · <b>+{{ added }}</b> / <b>−{{ removed }}</b>
        </span>
      </template>

      <!-- Пустое сравнение: своё состояние вместо встроенного текста. -->
      <template #empty>
        <div class="showcase-demo-text px-3 py-4 text-sm">
          Ревизия ещё не собрана — сравнивать нечего
        </div>
      </template>

      <!--
        Действие на строке: в обзоре кода тут живут «обсудить» и «скопировать».
        Слот получает саму строку, поэтому решать, кому действие нужно, может
        потребитель — здесь оно только у изменённых.
      -->
      <template #row-actions="{ line }">
        <GrButton v-if="line.op !== 'equal'" size="xs" variant="ghost" @click="copyLine(line.text)">
          копировать
        </GrButton>
      </template>
    </GrDiff>

    <p class="showcase-demo-text text-sm">
      Последняя скопированная строка: <b>{{ copied ?? '—' }}</b>
    </p>
  </div>
</template>
