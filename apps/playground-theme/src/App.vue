<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useTheme } from '@feugene/granularity'
import { grRoleTokens } from '@feugene/granularity-tokens'
import themeManifest from 'virtual:granum/themes'

const { mode, modes, setMode } = useTheme()

const modeOptions = modes.map(entry => ({
  label: entry.title ?? entry.name,
  value: entry.name,
  ariaLabel: `Режим ${entry.title ?? entry.name}`,
}))

const preview = themeManifest.previews?.[0]

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
    grRoleTokens.map(token => [token.name, styles.getPropertyValue(token.name).trim()]),
  )
}

onMounted(readRoleValues)
// Значения читаются после того, как браузер применил новую пару режима.
watch(mode, () => requestAnimationFrame(readRoleValues))

const surfaceRoles = computed(() =>
  grRoleTokens.filter(token => token.section === 'Surface roles'),
)
const statusRoles = computed(() =>
  grRoleTokens.filter(token => token.section === 'Status roles'),
)

function onModeChange(next: string | number): void {
  setMode(String(next))
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
            Свои режимы и своя тема
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-[var(--gr-muted-fg)]">
            <code>ocean</code> и <code>contrast</code> — режимы темы «Сланец» из
            <code>modes.define</code>, описанные данными в <code>theme.config.ts</code>.
            <code>ocean</code> берёт за базу тёмный режим (<code>extendMode</code>) —
            незаявленная роль приходит из него. <code>contrast</code> собран с нуля
            (<code>createMode</code>) и обязан объявить все роли сам: не хватит одной —
            сборка упадёт, а не подмешает палитру светлого режима. Ни один компонент
            про них не знает: они читают семантические роли.
          </p>
        </div>

        <GrFormField label="Режим">
          <GrSegmented
            :model-value="mode"
            :options="modeOptions"
            @update:model-value="onModeChange"
          />
        </GrFormField>
      </header>

      <GrAlert tone="info">
        Переключайте режимы и смотрите на этот экран целиком: ошибки в суффиксах
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
                dark
              >
                {{ tone }}
              </GrBadge>
            </div>

            <div class="flex flex-wrap gap-2">
              <GrBadge
                v-for="tone in tones"
                :key="`soft-${tone}`"
                :tone="tone"
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

      <!-- Своя тема приложения — превью: её пары собраны в CSS, корень она не занимает -->
      <GrCard v-if="preview" class="p-5">
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="text-base font-semibold">
              Тема «{{ preview.theme.title }}» — превью
            </h2>
            <p class="mt-1 text-sm text-[var(--gr-muted-fg)]">
              Папка <code>src/themes/{{ preview.theme.id }}/</code> объявляет только отличия от
              «Сланца». Активная тема у сборки одна, поэтому своя тема показана островами:
              <code>&lt;GrConfigProvider theme="{{ preview.theme.id }}" mode="…"&gt;</code>.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <GrConfigProvider
              v-for="entry in preview.modes"
              :key="entry.name"
              :theme="preview.theme.id"
              :mode="entry.name"
            >
              <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4 text-[var(--gr-fg)]">
                <p class="text-xs text-[var(--gr-muted-fg)]">
                  {{ entry.title ?? entry.name }} · <code>{{ entry.value }}</code>
                </p>
                <div class="flex flex-wrap gap-2">
                  <GrButton>Основное действие</GrButton>
                  <GrButton variant="secondary">
                    Второе
                  </GrButton>
                  <GrBadge tone="success">
                    Бейдж
                  </GrBadge>
                </div>
                <GrInput model-value="Поле ввода" aria-label="Поле ввода" />
              </div>
            </GrConfigProvider>
          </div>
        </div>
      </GrCard>

      <!-- Роли темы живьём: значения читаются из getComputedStyle -->
      <GrCard class="p-5">
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="text-base font-semibold">
              Роли текущего режима
            </h2>
            <p class="mt-1 text-sm text-[var(--gr-muted-fg)]">
              Список ролей приходит из <code>@feugene/granularity-tokens</code>, значения —
              из вычисленных стилей. Пропусти роль в режиме — здесь появится значение
              светлого режима, унаследованное от <code>:root</code>.
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
