import type { ShowcaseComponentExampleDoc } from '../types'

export const grButtonExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'button-slots-and-states',
    title: 'Слоты, block и состояния',
    description: '`#prefix`/`#suffix` вместо одного слота, `block` на всю ширину, объявление загрузки и одинаковое приглушение у отключённых кнопки и ссылки.',
    status: 'ready',
    previewKey: 'gr-button-slots-and-states',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrIcon, GrKbd } from '@feugene/granularity'
import IconPlus from '~icons/lucide/plus'

const saving = ref(false)

async function save(): Promise<void> {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 1200))
  saving.value = false
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <!-- Иконка и текст больше не валятся в один слот. -->
      <GrButton>
        <template #prefix>
          <GrIcon size="sm" aria-hidden="true">
            <IconPlus />
          </GrIcon>
        </template>
        Добавить проект
        <template #suffix>
          <GrKbd keys="mod+N" size="xs" />
        </template>
      </GrButton>

      <!-- Во время загрузки спиннер занимает место префикса. -->
      <GrButton :loading="saving" loading-text="Сохраняем отчёт" @click="save">
        <template #prefix>
          <GrIcon size="sm" aria-hidden="true">
            <IconPlus />
          </GrIcon>
        </template>
        Сохранить
      </GrButton>

      <GrButton disabled>
        Отключённая кнопка
      </GrButton>

      <GrButton href="https://example.com" disabled>
        Отключённая ссылка
      </GrButton>
    </div>

    <GrButton block variant="outline">
      Кнопка на всю ширину
    </GrButton>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Отключённые кнопка и ссылка гасятся одной парой токенов — раньше ссылке не доставалось ничего,
      потому что нативный \`disabled\` к ней неприменим. Во время загрузки к имени кнопки добавляется
      скрытый текст: \`aria-busy\` сам по себе объявляет не всякий скринридер.
    </div>
  </div>
</template>`,
  },
  {
    id: 'button-builder',
    title: 'Interactive button constructor',
    description: 'Живой playground для всех ключевых пропсов `GrButton`: меняйте `variant`, `tone`, size, type и состояния без переключения между отдельными demo-картами.',
    status: 'ready',
    previewKey: 'gr-button-builder',
    code: '',
    note: 'Лучший формат для дизайн-ревью и QA: один сценарий сразу покрывает все пропсы компонента и помогает быстро проверить доступность icon-only режима.',
  },
  {
    id: 'button-state-matrix',
    title: 'Tone × variant state matrix',
    description: 'Полная матрица по всем `tone` и `variant`, включая live, `hover`, `focus` и `active` для дизайн-ревью и визуальной регрессии.',
    status: 'ready',
    previewKey: 'gr-button-state-matrix',
    code: '',
    note: 'Это тот же сценарий, который раньше жил в `playground-5`: удобно сравнивать новые tones и проверять state-contract без ручного наведения.',
  },
]
