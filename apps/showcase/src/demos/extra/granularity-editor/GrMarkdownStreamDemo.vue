<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'

// `GrMarkdown`, `GrButton` подставляются авто-импортом.

/**
 * Стриминг: текст набегает кусками, как ответ языковой модели.
 *
 * Два счётчика — предмет демо, а не украшение. Они читают
 * `data-gr-markdown-block` из DOM и показывают, сколько блоков в документе и
 * сколько сменилось на последнем куске. Второе число держится на единице при
 * любой длине уже написанного.
 */
const FULL = `## Ответ приходит потоком

Первый абзац уже дописан целиком, и трогать его больше незачем.

Второй абзац тоже закончен: пустая строка закрыла его, и он ушёл в стабильный
префикс документа.

- пункт списка
- ещё один

\`\`\`ts
// незакрытая ограда не мигает: хвост рисуется как блок кода сразу
const x = 1
\`\`\`

Последний абзац дописывается прямо сейчас, символ за символом, и только он
пересобирается на каждом куске.`

const source = ref('')
const changed = ref(0)
const total = ref(0)
const running = ref(false)

const paper = useTemplateRef<HTMLElement>('paper')
let seen = new Set<string>()
let timer: ReturnType<typeof setInterval> | undefined

async function measure() {
  await nextTick()
  const keys = [...(paper.value?.querySelectorAll('[data-gr-markdown-block]') ?? [])]
    .map(node => node.getAttribute('data-gr-markdown-block') ?? '')

  changed.value = keys.filter(key => !seen.has(key)).length
  total.value = keys.length
  seen = new Set(keys)
}

function stop() {
  clearInterval(timer)
  timer = undefined
  running.value = false
}

function start() {
  stop()
  source.value = ''
  seen = new Set()
  changed.value = 0
  total.value = 0
  running.value = true

  timer = setInterval(() => {
    if (source.value.length >= FULL.length) {
      stop()
      return
    }
    source.value = FULL.slice(0, source.value.length + 3)
    void measure()
  }, 40)
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-3 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] p-4">
      <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <GrButton size="sm" :disabled="running" @click="start">
          Пустить поток
        </GrButton>
        <GrButton size="sm" variant="ghost" :disabled="!running" @click="stop">
          Остановить
        </GrButton>
      </div>

      <div class="ms-auto flex flex-wrap items-stretch gap-2">
        <div class="min-w-[8.5rem] rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] px-3 py-1.5">
          <div class="showcase-demo-caption text-[10px]">
            Блоков в документе
          </div>
          <div class="text-lg font-semibold [font-variant-numeric:tabular-nums]">
            {{ total }}
          </div>
        </div>

        <div class="min-w-[8.5rem] rounded-xl border border-[var(--gr-primary)] bg-[var(--gr-card)] px-3 py-1.5">
          <div class="showcase-demo-caption text-[10px]">
            Перерисовано на куске
          </div>
          <div class="text-lg font-semibold text-[var(--gr-primary-text)] [font-variant-numeric:tabular-nums]">
            {{ changed }}
          </div>
        </div>
      </div>
      </div>

      <p class="showcase-demo-text text-xs">
        Второе число — предмет демо: сколько бы ни было написано выше, на каждом
        куске пересобирается один блок. Наивная реализация перерисовывала бы весь
        документ, и цена росла бы вместе с ответом.
      </p>
    </div>

    <div
      ref="paper"
      class="min-h-[20rem] overflow-hidden rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] shadow-[var(--showcase-shadow-raised)]"
    >
      <div class="flex items-center justify-between gap-3 border-b border-[var(--gr-brd)] px-5 py-2.5 sm:px-8">
        <span class="showcase-demo-caption text-[11px]">Ответ модели</span>
        <span
          v-if="running"
          class="showcase-demo-chip flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[var(--gr-primary)]" aria-hidden="true" />
          идёт поток
        </span>
      </div>

      <div class="px-5 py-6 sm:px-8 sm:py-8">
        <GrMarkdown :source="source" streaming id-prefix="stream-">
          <template #empty>
            <p class="showcase-demo-text text-sm">
              Нажмите «Пустить поток» — текст начнёт набегать кусками.
            </p>
          </template>
          <template #caret>
            <span
              v-if="running"
              class="ms-0.5 inline-block h-[1.05em] w-[2px] animate-pulse bg-[var(--gr-primary)] align-text-bottom"
              aria-hidden="true"
            />
          </template>
        </GrMarkdown>
      </div>
    </div>
  </div>
</template>
