<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrMdHeading } from '@feugene/granularity-editor'

// `GrMarkdown`, `GrFormField`, `GrRadioGroup`, `GrSwitch` подставляются авто-импортом.

/**
 * Документ целиком: заголовки с якорями, списки, задачи, таблица, код, цитата,
 * алерт, сноска.
 *
 * Раскладка демо — три уровня: панель настроек, «бумага» с документом и
 * подложка превью между ними. Без бумаги отрендеренный markdown сливался бы со
 * страницей витрины, которая набрана такими же заголовками и абзацами.
 */
const source = `# Заметки о релизе

Короткое вступление, чтобы было видно **меру строки**: длинная строка читается
плохо, поэтому текстовые блоки её держат, а таблица и код выходят на всю ширину.

## Что изменилось

- разбор идёт по блокам, и правка абзаца стоит абзаца;
- ссылка с чужой схемой [не станет ссылкой](javascript:alert(1)) — останется текстом;
- сырой HTML показывается как есть: <b>жирным он не станет</b>.

> [!NOTE]
> Алерт узнаётся по маркеру в начале цитаты и красится тоном темы.

> [!WARNING]
> Тон несёт и подпись, а не только цвет — иначе это была бы потеря смысла.

### Список задач

- [x] дерево вместо строки HTML
- [x] кэш по блокам
- [ ] мост в редактор

### Таблица

| Приём | Что даёт | Цена |
| --- | --- | ---: |
| Кэш по блокам | правка стоит одного блока | ключ от текста |
| \`content-visibility\` | длинный документ листается | оценка высоты |
| Хвостовой разбор | стриминг не зависит от длины | только дописывание |

### Код

\`\`\`ts
const doc = createMarkdownDocument({ streaming: true })
doc.update(chunk)
\`\`\`

Сноска поясняет то, чему не место в строке[^1].

[^1]: Нумерация идёт по порядку первого упоминания — как на GitHub.
`

const density = ref<'comfortable' | 'compact'>('comfortable')
const anchors = ref(true)
const headingOffset = ref(0)

/**
 * Ширина колонки — тремя значениями, а не переключателем «вкл/выкл».
 *
 * При ширине карточки в ~750px ограничение в 68ch почти не срабатывает: разница
 * выходила в 9% и на глаз не читалась вовсе. Узкое значение показывает, что
 * именно делает токен `--gr-markdown-measure`, а «без ограничения» даёт с чем
 * сравнить.
 */
const measure = ref<'48ch' | '68ch' | 'none'>('68ch')

const measureOptions = [
  { value: '48ch', label: 'Узкая' },
  { value: '68ch', label: 'Обычная' },
  { value: 'none', label: 'Без предела' },
]

const densityOptions = [
  { value: 'comfortable', label: 'Свободная' },
  { value: 'compact', label: 'Плотная' },
]

const offsetOptions = [
  { value: 0, label: 'h1' },
  { value: 1, label: 'h2' },
  { value: 2, label: 'h3' },
]

const measureHint = computed(() => (measure.value === 'none'
  ? 'строка тянется во всю ширину'
  : `не длиннее ${measure.value.replace('ch', '')} символов`))

const densityHint = computed(() => (density.value === 'compact'
  ? 'между блоками 0.6em — для ленты комментариев'
  : 'между блоками 1em — для статьи'))

const headings = ref<GrMdHeading[]>([])
const blocks = ref(0)

function onParsed(next: GrMdHeading[], count: number) {
  headings.value = next
  blocks.value = count
}
</script>

<template>
  <div class="grid gap-5">
    <!--
      У каждого переключателя своя подсказка: без неё «мера строки» и
      «плотность» — типографский жаргон, по которому непонятно ни что они
      делают, ни зачем их трогать.
    -->
    <div class="grid gap-4 rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-muted)] p-4 sm:grid-cols-3">
      <div class="grid gap-1.5">
        <GrFormField label="Ширина колонки">
          <GrRadioGroup v-model="measure" :options="measureOptions" variant="button" size="sm" />
        </GrFormField>
        <p class="showcase-demo-text text-xs">
          {{ measureHint }}
        </p>
      </div>

      <div class="grid gap-1.5">
        <GrFormField label="Отбивка блоков">
          <GrRadioGroup v-model="density" :options="densityOptions" variant="button" size="sm" />
        </GrFormField>
        <p class="showcase-demo-text text-xs">
          {{ densityHint }}
        </p>
      </div>

      <div class="grid gap-1.5">
        <GrFormField label="Верхний заголовок">
          <GrRadioGroup v-model="headingOffset" :options="offsetOptions" variant="button" size="sm" />
        </GrFormField>
        <p class="showcase-demo-text text-xs">
          сдвиг уровней: документ внутри страницы, где h1 уже занят
        </p>
      </div>

      <div class="grid gap-1.5 sm:col-span-3">
        <GrSwitch v-model="anchors" size="sm">
          Якоря у заголовков
        </GrSwitch>
        <p class="showcase-demo-text text-xs">
          ссылка на раздел, появляется при наведении на заголовок и по фокусу с клавиатуры
        </p>
      </div>
    </div>

    <!-- «Бумага»: документ обязан читаться как артефакт, а не как часть страницы. -->
    <div class="overflow-hidden rounded-2xl border border-[var(--showcase-brd-strong)] bg-[var(--gr-card)] shadow-[var(--showcase-shadow-raised)]">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--gr-brd)] px-5 py-2.5 sm:px-8">
        <span class="showcase-demo-caption text-[11px]">Отрендеренный документ</span>
        <span class="showcase-demo-chip rounded-full border px-2.5 py-0.5 text-xs">
          {{ blocks }} блоков · {{ headings.length }} заголовков
        </span>
      </div>

      <div
        class="px-5 py-6 sm:px-8 sm:py-8"
        :style="measure === 'none' ? undefined : { '--gr-markdown-measure': measure }"
      >
        <GrMarkdown
          :source="source"
          :density="density"
          :measure="measure !== 'none'"
          :anchors="anchors"
          :heading-offset="headingOffset"
          id-prefix="basic-"
          aria-label="Заметки о релизе"
          @parsed="onParsed"
        />
      </div>
    </div>
  </div>
</template>
