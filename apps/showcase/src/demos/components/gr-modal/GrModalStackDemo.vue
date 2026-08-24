<script setup lang="ts">
import { nextTick, ref } from 'vue'

import { GrButton, GrDialog, GrModal } from '@feugene/granularity'

/**
 * Лесенка окон: каждое следующее открывается изнутри предыдущего.
 *
 * Все четыре объявлены статически, то есть в контейнер портала попадают в
 * порядке **создания**. Высоту им даёт не он, а стек слоёв — иначе окно,
 * открытое позже, оказалось бы под соседом, хотя стек считает верхним именно
 * его и гасит остальные `inert`.
 */
/** Размеры по убыванию: так видно все четыре окна разом, а не только верхнее. */
const LEVELS = [
  { level: 1, size: 'xl' },
  { level: 2, size: 'lg' },
  { level: 3, size: 'md' },
  { level: 4, size: 'sm' },
] as const

const open = ref<boolean[]>([false, false, false, false])
const strategyOpen = ref(false)
const layers = ref<string[]>([])

/** Фактическая высота слоёв — читается из DOM, а не пересчитывается заново. */
async function readLayers() {
  await nextTick()
  layers.value = [...document.querySelectorAll<HTMLElement>('[data-gr-overlay-root]')]
    .map(root => root.style.zIndex)
    .filter(Boolean)
}

async function openLevel(index: number) {
  open.value[index] = true
  await readLayers()
}

async function closeLevel(index: number) {
  open.value[index] = false
  await readLayers()
}

async function closeAll() {
  open.value = [false, false, false, false]
  strategyOpen.value = false
  await readLayers()
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid content-start gap-3">
      <GrButton @click="openLevel(0)">
        Открыть лесенку
      </GrButton>
      <GrButton variant="outline" @click="closeAll">
        Закрыть всё
      </GrButton>

      <p class="showcase-demo-text text-sm">
        Каждое следующее окно меньше предыдущего, поэтому видно все четыре сразу. Открываются они
        по очереди, а объявлены статически — в портал попали в порядке создания.
      </p>
    </div>

    <div class="showcase-demo-panel grid content-start gap-2 rounded-[var(--gr-radius-lg)] border p-4">
      <p class="showcase-demo-text text-sm">
        Высота открытых слоёв, как её видит браузер:
      </p>
      <ul v-if="layers.length > 0" class="grid gap-1">
        <li v-for="(z, index) in layers" :key="index">
          <code class="showcase-demo-text text-xs">{{ index + 1 }}: {{ z }}</code>
        </li>
      </ul>
      <p v-else class="showcase-demo-text text-sm">
        Пока ничего не открыто.
      </p>
    </div>

    <GrModal
      v-for="(item, index) in LEVELS"
      :key="item.level"
      v-model="open[index]"
      :size="item.size"
    >
      <template #title>
        Окно {{ item.level }}
      </template>

      <div class="grid gap-3">
        <p class="showcase-demo-text text-sm">
          Уровень {{ item.level }}. Верхнее окно отвечает на клики, нижние ушли в
          <code>inert</code> — и лежат ниже по высоте, а не только в стеке.
        </p>

        <div class="flex flex-wrap gap-2">
          <GrButton
            v-if="index + 1 < LEVELS.length"
            size="sm"
            @click="openLevel(index + 1)"
          >
            Открыть окно {{ item.level + 1 }}
          </GrButton>
          <GrButton
            v-if="item.level === 1"
            size="sm"
            variant="outline"
            @click="strategyOpen = true; readLayers()"
          >
            Диалог поверх окна
          </GrButton>
          <GrButton size="sm" variant="outline" @click="closeLevel(index)">
            Закрыть
          </GrButton>
        </div>
      </div>
    </GrModal>

    <!--
      Тот самый случай из заявки потребителя: диалог объявлен раньше окон, а
      открывается позже. По порядку узлов в портале он оказался бы под ними.
    -->
    <GrDialog v-model="strategyOpen" title="Выбор стратегии" size="sm">
      <p class="showcase-demo-text text-sm">
        Диалог объявлен в шаблоне раньше окон, а открыт позже — и всё равно виден поверх.
        Раньше он попадал под окно и оставался невидимым, хотя именно он отвечал на клики.
      </p>

      <template #footer>
        <GrButton size="sm" @click="strategyOpen = false; readLayers()">
          Понятно
        </GrButton>
      </template>
    </GrDialog>
  </div>
</template>
