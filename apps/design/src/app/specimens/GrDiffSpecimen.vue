<script setup lang="ts">
import type { GrDiffHunk } from '@feugene/granularity-code'
import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const PREVIEW_BEFORE = 'plan: team\nseats: 5'
const PREVIEW_AFTER = 'plan: team\nseats: 12'

const CONFIG_BEFORE = `service: billing
replicas: 2
resources:
  cpu: 500m
  memory: 512Mi
env:
  LOG_LEVEL: info
  TIMEOUT_MS: 3000
  RETRIES: 3`

const CONFIG_AFTER = `service: billing
replicas: 4
resources:
  cpu: 1000m
  memory: 512Mi
env:
  LOG_LEVEL: info
  TIMEOUT_MS: 3000
  RETRIES: 5`

/** Ревизии записи из журнала аудита: одна пришла из API, другая собрана формой — ключи в разном порядке. */
const REVISION_BEFORE = { id: 41, title: 'Договор поставки', status: 'draft', amount: 120000, signed: false }
const REVISION_AFTER = { status: 'signed', title: 'Договор поставки № 41', id: 41, signed: true, amount: 120000 }

const LONG_BEFORE = Array.from({ length: 40 }, (_, index) => `FEATURE_${String(index + 1).padStart(2, '0')}=off`).join('\n')
const LONG_AFTER = LONG_BEFORE
  .replace('FEATURE_08=off', 'FEATURE_08=on')
  .replace('FEATURE_31=off', 'FEATURE_31=on')

/** Участки, посчитанные на сервере: компонент только нумерует строки и рисует. */
const HUNKS: GrDiffHunk[] = [
  { op: 'equal', lines: ['def deploy(env):', '    check_health(env)'] },
  { op: 'remove', lines: ['    rollout(env, strategy="recreate")'] },
  { op: 'add', lines: ['    rollout(env, strategy="rolling")', '    wait_for_ready(env, timeout=120)'] },
  { op: 'equal', lines: ['    notify(env)'] },
]
const discussed = ref('')

const SAME = 'LOG_LEVEL: info\nRETRIES: 3'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrDiff :before="PREVIEW_BEFORE" :after="PREVIEW_AFTER" size="sm" aria-label="Изменение тарифа" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Одной колонкой" note="unified — строки со знаками + и −, внутри изменённой строки отмечено изменённое слово; сводка над диффом — живой регион." wide>
      <GrDiff :before="CONFIG_BEFORE" :after="CONFIG_AFTER" :context="Infinity" aria-label="Конфиг billing: прошлая и новая ревизия" />
    </Specimen>

    <Specimen title="Двумя колонками" note="split — «было» и «стало» рядом; знак правки стоит в каждой колонке, чтобы смысл не держался на одном цвете." wide>
      <GrDiff :before="CONFIG_BEFORE" :after="CONFIG_AFTER" mode="split" :context="Infinity" aria-label="Конфиг billing, две колонки" />
    </Specimen>

    <Specimen title="Записи-объекты" note="Объект сериализуется устойчивым порядком ключей: перестановка не считается правкой, видно только то, что действительно меняли.">
      <GrDiff :before="REVISION_BEFORE" :after="REVISION_AFTER" aria-label="Ревизии договора № 41" />
    </Specimen>

    <Specimen title="Схлопывание" note="Вокруг правки остаётся context строк, остальное — пропуск; он раскрывается шагами с любого края.">
      <GrDiff :before="LONG_BEFORE" :after="LONG_AFTER" :context="1" :expand-step="5" language="text" aria-label="Флаги окружения" />
    </Specimen>

    <Specimen title="Готовые участки" note="hunks с бэкенда сильнее before и after: считать заново нечего. Слот строки — под действие рецензента.">
      <GrDiff :hunks="HUNKS" language="text" aria-label="Ревизия a81f3c, deploy.py">
        <template #row-actions="{ line }">
          <GrButton v-if="line.op !== 'equal'" size="xs" variant="ghost" @click="discussed = `Обсуждение: ${line.text.trim()}`">
            Обсудить
          </GrButton>
        </template>
      </GrDiff>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ discussed }}
      </p>
    </Specimen>

    <Specimen title="Изменений нет" note="Совпавшие стороны: сводка так и говорит, а строки остаются на виду — сверить, что сравнивали то, что нужно.">
      <GrDiff :before="SAME" :after="SAME" aria-label="Конфиг после отката" />
    </Specimen>

    <Specimen title="Ступени" note="Кегль и отступы строк — по шкале контролов.">
      <div v-for="size in SIZES" :key="size" class="flex items-start gap-3">
        <span class="w-6 shrink-0 pt-1 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrDiff :before="PREVIEW_BEFORE" :after="PREVIEW_AFTER" :size="size" :context="0" :aria-label="`Изменение тарифа, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
