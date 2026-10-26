<script setup lang="ts">
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const shortcuts = [
  { action: 'Открыть палитру команд', keys: 'mod+K' },
  { action: 'Найти в документе', keys: 'mod+F' },
  { action: 'Отправить сообщение', keys: 'mod+enter' },
  { action: 'Показать все сочетания', keys: 'mod+/' },
  { action: 'Перейти во входящие', keys: 'g i' },
]

const kbdSteps = ['xs', 'sm', 'md', 'lg'] as const
const platformKeys = ['mod+shift+P', 'alt+backspace', 'ctrl+tab']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <dl class="flex flex-col gap-2.5">
      <div v-for="item in shortcuts.slice(0, 3)" :key="item.action" class="flex items-center justify-between gap-4">
        <dt class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
          {{ item.action }}
        </dt>
        <dd><GrKbd :keys="item.keys" platform="apple" /></dd>
      </div>
    </dl>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Справка по сочетаниям" note="одной плашкой — как пишет система; пробел в строке — шаги цепочки">
      <dl class="flex flex-col gap-2.5">
        <div v-for="item in shortcuts" :key="item.action" class="flex items-center justify-between gap-4">
          <dt class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            {{ item.action }}
          </dt>
          <dd><GrKbd :keys="item.keys" platform="apple" /></dd>
        </div>
      </dl>
    </Specimen>

    <Specimen title="Варианты" note="одна плашка, плашка на клавишу и «затем» между нажатиями">
      <dl class="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3">
        <dt class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          merged
        </dt>
        <dd><GrKbd keys="mod+shift+K" platform="apple" /></dd>
        <dt class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          split
        </dt>
        <dd><GrKbd keys="mod+shift+K" variant="split" platform="apple" /></dd>
        <dt class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          sequence
        </dt>
        <dd><GrKbd :keys="['G', 'I']" variant="sequence" /></dd>
      </dl>
    </Specimen>

    <Specimen title="Платформа" note="символы на macOS, слова на остальных; символ получает читаемое имя для диктора">
      <div class="grid grid-cols-2 gap-x-6 gap-y-3">
        <span class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">macOS</span>
        <span class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">Windows и Linux</span>
        <template v-for="keys in platformKeys" :key="keys">
          <GrKbd :keys="keys" platform="apple" class="justify-self-start" />
          <GrKbd :keys="keys" platform="other" class="justify-self-start" />
        </template>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="одиночная клавиша держит квадрат: ряд хоткеев не прыгает">
      <div class="flex flex-wrap items-end gap-3">
        <GrKbd v-for="step in kbdSteps" :key="step" keys="mod+K" :size="step" platform="apple" />
        <GrKbd v-for="step in kbdSteps" :key="`esc-${step}`" :size="step">
          Esc
        </GrKbd>
      </div>
    </Specimen>
  </div>
</template>
