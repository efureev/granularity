<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { GrSegmented, GrSwitch } from '@feugene/granularity'
import { diffLines, GR_DIFF_DEFAULT_BUDGET } from '@feugene/granularity-code/diff'

const lineCount = ref(1000)
const expandStep = ref(10)
const diverged = ref(false)
const degraded = ref(false)

const before = computed(() =>
  Array.from({ length: lineCount.value }, (_, index) => `  "field_${index}": "value ${index}",`).join('\n'))

/**
 * Две ревизии одного файла — и сравнение с чужим файлом.
 *
 * Разница не в размере, а в **дистанции редактирования**: одна правка на тысячу
 * строк считается мгновенно при любом объёме, а сотни расхождений упираются в
 * предел. Показать отказ на файле с одной правкой нельзя — бюджету нечего
 * исчерпывать.
 */
const after = computed(() => diverged.value
  ? Array.from({ length: lineCount.value }, (_, index) =>
      `  "field_${index}": "${index % 3 === 0 ? `rewritten ${index}` : `value ${index}`}",`).join('\n')
  : before.value.replace('"value 500"', '"value 500 changed"'))

/**
 * Бюджет — предел работы алгоритма, а не украшение: два больших разных файла без
 * него это замершая вкладка. За пределом разбор огрубляется и говорит об этом.
 */
const budget = computed(() => diverged.value ? 20 : GR_DIFF_DEFAULT_BUDGET)

// Сообщение об огрублении живёт до следующего входа, а не до конца сессии.
watch([lineCount, diverged], () => {
  degraded.value = false
})

/** Тот же счёт, что делает компонент: сколько строк вообще в сравнении. */
const stats = computed(() => {
  const result = diffLines(before.value, after.value, { budget: budget.value })

  return { total: result.lines.length, added: result.added, removed: result.removed }
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented
        v-model="lineCount"
        size="sm"
        :options="[
          { value: 200, label: '200 строк' },
          { value: 1000, label: '1000' },
          { value: 5000, label: '5000' },
        ]"
      />
      <GrSegmented
        v-model="expandStep"
        size="sm"
        :options="[
          { value: 5, label: 'по 5' },
          { value: 10, label: 'по 10' },
          { value: 50, label: 'по 50' },
        ]"
      />
      <GrSwitch v-model="diverged" size="sm">
        Чужой файл, низкий бюджет
      </GrSwitch>
    </div>

    <p class="showcase-demo-text text-sm">
      Строк в сравнении: <b>{{ stats.total }}</b>, изменено: {{ stats.added }} добавлено,
      {{ stats.removed }} удалено. В DOM при этом — десятки строк: неизменное свёрнуто,
      а остальное режется окном отрисовки.
      <template v-if="degraded">
        <b>Бюджет исчерпан</b> — разбор огрублён: это отказ, который видит пользователь, а не
        замершая вкладка.
      </template>
    </p>

    <GrDiff
      :before="before"
      :after="after"
      :context="2"
      :expand-step="expandStep"
      :budget="budget"
      language="json"
      max-height="20rem"
      @budget-exceeded="degraded = true"
    />
  </div>
</template>
