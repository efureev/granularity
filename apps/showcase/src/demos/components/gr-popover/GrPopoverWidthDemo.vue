<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPopover, GrSegmented } from '@feugene/granularity'

/**
 * Ширина панели — две независимые оси, и демо показывает именно их
 * независимость: потолок переключается слева, источник ширины — справа, и
 * любое сочетание осмысленно.
 *
 * Триггер намеренно широкий: при узком разница между «по содержимому» и «по
 * триггеру» не видна вовсе, а именно она тут и предмет.
 *
 * Хук приезжает через `contentClass`, а не инлайновым стилем на `GrPopover`:
 * панель телепортируется в портал, и кастомное свойство с обёртки триггера до
 * неё не наследуется — она ей не потомок.
 */
const ceiling = ref<'default' | 'none'>('default')
const source = ref<'content' | 'trigger' | 'trigger-min'>('content')

const ceilingOptions = [
  { value: 'default', label: 'Потолок 22rem' },
  { value: 'none', label: 'Потолок снят' },
]

const sourceOptions = [
  { value: 'content', label: 'По содержимому' },
  { value: 'trigger', label: 'По триггеру' },
  { value: 'trigger-min', label: 'Минимум — триггер' },
]

const LONG = 'Панель с длинным текстом, по которому видно, где именно проходит потолок ширины: '
  + 'по умолчанию это 22rem — читаемая ширина колонки, дальше строка переносится.'
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <label class="grid gap-1 text-[length:var(--gr-control-text-sm)]">
        <span class="showcase-demo-text">Потолок содержимого — хук</span>
        <GrSegmented v-model="ceiling" :options="ceilingOptions" size="sm" />
      </label>

      <label class="grid gap-1 text-[length:var(--gr-control-text-sm)]">
        <span class="showcase-demo-text">Источник ширины — проп</span>
        <GrSegmented v-model="source" :options="sourceOptions" size="sm" />
      </label>
    </div>

    <div>
      <GrPopover
        :key="`${ceiling}-${source}`"
        :match-width="source === 'trigger' ? true : source === 'trigger-min' ? 'min' : false"
        :content-class="ceiling === 'none' ? '[--gr-popover-max-width:100vw]' : undefined"
        placement="bottom-start"
        aria-label="Ширина панели"
        size="sm"
      >
        <template #trigger="{ triggerProps }">
          <GrButton variant="outline" v-bind="triggerProps" class="w-[26rem]">
            Широкий триггер — 26rem
          </GrButton>
        </template>

        <template #content>
          <div class="text-[var(--gr-fg)]">{{ LONG }}</div>
        </template>
      </GrPopover>
    </div>

    <p class="showcase-demo-text text-sm">
      <b>Потолок</b> — значение, поэтому это CSS-хук <code>--gr-popover-max-width</code>, а не проп:
      его можно менять по брейкпоинту и по теме, и он не спорит по специфичности с классом панели.
      Снимают его значением <code>100vw</code>, а не <code>none</code>: <code>min(none, …)</code> —
      невалидный CSS.

      <br><br>

      Доставляется хук <b>через <code>contentClass</code></b>, потому что панель живёт в портале:
      инлайновый стиль на <code>&lt;GrPopover&gt;</code> ляжет на обёртку триггера, а панель ей не
      потомок — свойство до неё не дойдёт и молча ничего не сделает. Глобально (в теме, на
      <code>:root</code>) хук работает как обычно: портал лежит в <code>body</code>.
    </p>

    <p class="showcase-demo-text text-sm">
      <b>Источник</b> — поведение, поэтому проп <code>matchWidth</code>. Оси сочетаются, но
      разрешаются по-разному, и это следствие CSS: «по триггеру» с потолком даёт
      <b>352px</b> — <code>width</code> от триггера срезан <code>max-width</code>;
      «минимум — триггер» даёт <b>416px</b>, потому что <code>min-width</code> в CSS сильнее
      <code>max-width</code>. Пол выигрывает у потолка — и это смысл режима, а не изъян:
      <code>min</code> задаёт нижнюю границу ширины, а не саму ширину. Переключите оба и сравните
      числа.
    </p>

    <p class="showcase-demo-text text-sm">
      <b>Не шире вьюпорта</b> не настраивается ничем: <code>calc(100vw - 1rem)</code> стоит вторым
      операндом <code>min()</code>, и снятый потолок его не отменяет — сузьте окно и убедитесь.
    </p>
  </div>
</template>
