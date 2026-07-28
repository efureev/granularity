<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import {
  GrAlert,
  GrBadge,
  GrButton,
  GrCard,
  GrCheckbox,
  GrFormField,
  GrInput,
  GrLink,
  GrSegmented,
  GrSwitch,
} from '@feugene/granularity'
import { grThemeTokens } from '@feugene/granularity/tokens'

import { APP_THEMES, useAppTheme, type AppTheme } from './theme'

const { theme, setTheme } = useAppTheme()

const themeOptions = APP_THEMES.map(name => ({
  label: name,
  value: name,
  ariaLabel: `Тема ${name}`,
}))

const tones = ['success', 'warning', 'danger', 'info', 'slate', 'azure'] as const

const projectName = ref('Ocean')
const compact = ref(true)
const notify = ref(false)

/**
 * Живые значения ролей берём из вычисленных стилей: так видно, что тема
 * действительно применилась, а не просто объявлена в CSS.
 */
const roleValues = ref<Record<string, string>>({})

function readRoleValues(): void {
  const styles = getComputedStyle(document.documentElement)

  roleValues.value = Object.fromEntries(
    grThemeTokens.map(token => [token.name, styles.getPropertyValue(token.name).trim()]),
  )
}

onMounted(readRoleValues)
// Значения читаются после того, как браузер применил новый селектор темы.
watch(theme, () => requestAnimationFrame(readRoleValues))

const surfaceRoles = computed(() =>
  grThemeTokens.filter(token => token.section === 'Surface roles'),
)
const statusRoles = computed(() =>
  grThemeTokens.filter(token => token.section === 'Status roles'),
)

function onThemeChange(next: string | number): void {
  setTheme(next as AppTheme)
}
</script>

<template>
  <main class="min-h-screen bg-[var(--gr-bg)] text-[var(--gr-fg)]">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm text-[var(--gr-muted-fg)]">
            playground-theme
          </p>
          <h1 class="text-2xl font-semibold">
            Кастомная тема поверх пакета
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--gr-muted-fg)]">
            Тема <code>ocean</code> объявлена в <code>src/styles/theme-ocean.css</code> и
            подключена обычным импортом CSS в <code>src/main.ts</code> — третью тему
            через пресет добавить нельзя. Ни один компонент про неё не знает: они
            читают семантические роли.
          </p>
        </div>

        <GrFormField label="Тема">
          <GrSegmented
            :model-value="theme"
            :options="themeOptions"
            @update:model-value="onThemeChange"
          />
        </GrFormField>
      </header>

      <GrAlert tone="info">
        Переключайте темы и смотрите на этот экран целиком: ошибки в суффиксах
        ролей видны в соседстве компонентов, а не по отдельности.
      </GrAlert>

      <!-- Плотный экран из docs/theming.md → «Проверка перед выкладкой», п. 3 -->
      <section class="grid gap-4 lg:grid-cols-2">
        <GrCard class="p-4">
          <div class="flex flex-col gap-4">
            <h2 class="text-base font-semibold">
              Заливки и текст на них
            </h2>

            <div class="flex flex-wrap gap-2">
              <GrButton
                v-for="tone in tones"
                :key="tone"
                :tone="tone"
                size="sm"
              >
                {{ tone }}
              </GrButton>
            </div>

            <div class="flex flex-wrap gap-2">
              <GrBadge
                v-for="tone in tones"
                :key="`solid-${tone}`"
                :tone="tone"
                variant="solid"
              >
                {{ tone }}
              </GrBadge>
            </div>

            <div class="flex flex-wrap gap-2">
              <GrBadge
                v-for="tone in tones"
                :key="`soft-${tone}`"
                :tone="tone"
                variant="soft"
              >
                {{ tone }}
              </GrBadge>
            </div>

            <p class="text-sm text-[var(--gr-muted-fg)]">
              Вторичный текст на карточке — самый частый провал контраста в
              кастомной теме.
            </p>
          </div>
        </GrCard>

        <GrCard class="p-4">
          <div class="flex flex-col gap-4">
            <h2 class="text-base font-semibold">
              Контролы
            </h2>

            <GrFormField label="Название проекта">
              <GrInput v-model="projectName" />
            </GrFormField>

            <GrCheckbox v-model="compact">
              Компактные строки
            </GrCheckbox>

            <GrSwitch v-model="notify">
              Уведомления
            </GrSwitch>

            <p class="text-sm">
              Ссылка внутри текста:
              <GrLink href="https://example.com" tone="primary">
                тональная ссылка
              </GrLink>
            </p>
          </div>
        </GrCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <GrAlert tone="success" title="Готово">
          Мягкая подложка <code>-light</code> и текст <code>-text</code> на ней.
        </GrAlert>
        <GrAlert tone="danger" title="Ошибка">
          Тот же паттерн в тревожном тоне.
        </GrAlert>
      </section>

      <!-- Роли темы живьём: значения читаются из getComputedStyle -->
      <GrCard class="p-5">
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="text-base font-semibold">
              Роли текущей темы
            </h2>
            <p class="mt-1 text-sm text-[var(--gr-muted-fg)]">
              Список ролей приходит из <code>@feugene/granularity/tokens</code>, значения —
              из вычисленных стилей. Пропусти роль в теме — здесь появится значение
              светлой темы, унаследованное от <code>:root</code>.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="group in [
                { title: 'Surface roles', tokens: surfaceRoles },
                { title: 'Status roles', tokens: statusRoles },
              ]"
              :key="group.title"
            >
              <h3 class="mb-2 text-sm font-semibold text-[var(--gr-muted-fg)]">
                {{ group.title }}
              </h3>

              <ul class="flex flex-col gap-1">
                <li
                  v-for="token in group.tokens"
                  :key="token.name"
                  class="flex items-center gap-2 text-xs"
                >
                  <span
                    class="h-4 w-4 shrink-0 rounded border border-[var(--gr-brd)]"
                    :style="{ background: `var(${token.name})` }"
                    aria-hidden="true"
                  />
                  <code class="shrink-0">{{ token.name }}</code>
                  <span class="text-[var(--gr-muted-fg)]">{{ roleValues[token.name] }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </GrCard>
    </div>
  </main>
</template>
