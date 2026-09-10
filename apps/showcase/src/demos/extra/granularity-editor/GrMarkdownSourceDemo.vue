<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrMarkdown`, `GrSplitter`, `GrTextarea` подставляются авто-импортом.

/**
 * Источник слева, результат справа — с подвижной границей.
 *
 * `GrSplitter` держит раскладку, клавиатуру и доступность разделителя: `Tab`
 * доводит до него, стрелки двигают, двойной клик возвращает к `defaultSize`.
 * Связь односторонняя: markdown — единственный источник правды, превью
 * пересобирается на каждом нажатии.
 */
const source = ref(`## Живой предпросмотр

Правьте текст слева — справа он **пересобирается сразу**. Потяните разделитель
между панелями: у него есть и клавиатура, стрелками.

- список
- [x] задача
- [ ] ещё не сделано

> [!TIP]
> Алерты, таблицы и сноски работают здесь так же, как в готовом документе.

| Что | Сколько |
| --- | ---: |
| блоков | видно справа |

\`\`\`ts
const doc = createMarkdownDocument()
\`\`\`
`)

/** Доля левой панели в процентах — `GrSplitter` поддерживает `v-model`. */
const split = ref(50)

const blocks = ref(0)
const symbols = computed(() => source.value.length)
</script>

<template>
  <div class="grid gap-5">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] p-4">
      <span class="showcase-demo-caption text-[11px]">Ширина панелей</span>
      <span class="showcase-demo-chip rounded-full border px-2.5 py-0.5 text-xs [font-variant-numeric:tabular-nums]">
        {{ Math.round(split) }} / {{ 100 - Math.round(split) }}
      </span>
      <p class="showcase-demo-text text-xs">
        Разделитель тянется мышью и стрелками с клавиатуры, двойной клик возвращает половину.
      </p>
    </div>

    <div class="h-[34rem]">
      <GrSplitter
        v-model="split"
        :min="25"
        :max="75"
        :min-end="25"
        aria-label="Граница между исходником и результатом"
      >
        <template #start>
          <div class="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2 pe-4">
            <div class="flex items-center justify-between gap-3">
              <span class="showcase-demo-caption text-[11px]">Источник markdown</span>
              <span class="showcase-demo-chip rounded-full border px-2.5 py-0.5 text-xs">
                {{ symbols }} символов
              </span>
            </div>

            <GrTextarea
              v-model="source"
              aria-label="Исходный markdown"
              class="h-full font-mono [&_textarea]:h-full [&_textarea]:resize-none"
            />
          </div>
        </template>

        <template #end>
          <div class="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2 ps-4">
            <div class="flex items-center justify-between gap-3">
              <span class="showcase-demo-caption text-[11px]">Результат</span>
              <span class="showcase-demo-chip rounded-full border px-2.5 py-0.5 text-xs">
                {{ blocks }} блоков
              </span>
            </div>

            <div class="overflow-auto rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] px-5 py-5 shadow-[var(--showcase-shadow-raised)]">
              <GrMarkdown
                :source="source"
                id-prefix="source-"
                aria-label="Предпросмотр"
                @parsed="(_, count) => (blocks = count)"
              >
                <template #empty>
                  <p class="showcase-demo-text text-sm">
                    Пустой источник — пустой документ.
                  </p>
                </template>
              </GrMarkdown>
            </div>
          </div>
        </template>
      </GrSplitter>
    </div>
  </div>
</template>
