<script setup lang="ts">
import DocSection from '../parts/DocSection.vue'
import ThemeIslands from '../parts/ThemeIslands.vue'
import { foundationSection } from '../tokens'

const spacing = foundationSection('Layout: spacing scale').filter(token => Number.parseInt(token.value) <= 96)
const layers = foundationSection('Layering: z-index scale')
const breakpoints = foundationSection('Layout: breakpoints')
const containers = foundationSection('Layout: containers')

const radii = [
  { name: '--gr-radius-sm', use: 'клавиши, мелкие плашки' },
  { name: '--gr-radius-control', use: 'поля, селекты, кнопки, подсказки, пагинация' },
  { name: '--gr-radius-md', use: 'алерты, выпадающие панели, загрузка файлов' },
  { name: '--gr-radius-lg', use: 'карточки, таблицы, тосты' },
  { name: '--gr-radius-xl', use: 'модальные окна' },
  { name: '--gr-radius-full', use: 'чипы, бейджи, аватары, переключатели' },
]
const radiusValues = new Map(foundationSection('Shapes: radii and compatibility aliases').map(token => [token.name, token.value]))

const shadows = [
  { name: '--gr-shadow-1', use: 'кнопки с заливкой, карточки, клавиши, бегунки, подсказки' },
  { name: '--gr-shadow-2', use: 'модальные окна, шторки, тосты' },
  { name: '--gr-shadow-3', use: 'про запас: компонентами не используется' },
]

const layerUse: Record<string, string> = {
  '--gr-z-bottom-nav': 'нижняя навигация',
  '--gr-z-navbar': 'верхняя панель',
  '--gr-z-dropdown': 'выпадающие списки, поповеры, меню',
  '--gr-z-tooltip': 'подсказки',
  '--gr-z-modal': 'модальные окна, шторки',
  '--gr-z-loading': 'полноэкранная загрузка',
  '--gr-z-toast': 'уведомления',
}
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection title="Отступы" lead="Шаг — 4px. Отступы и зазоры берутся со шкалы: соседние блоки, собранные разными людьми, совпадают без договорённостей.">
      <ul class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] py-2">
        <li v-for="token in spacing" :key="token.name" class="grid grid-cols-[120px_64px_minmax(0,1fr)] items-center gap-4 px-5 py-1.5">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ token.name.replace('--gr-', '') }}</code>
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ token.value }}</span>
          <span class="h-3 rounded-[var(--gr-radius-xs)] bg-[var(--gr-primary)]" :style="{ width: `var(${token.name})` }" />
        </li>
      </ul>
    </DocSection>

    <DocSection title="Радиусы" lead="Радиус выбирается по назначению, а не по размеру: чем крупнее и самостоятельнее поверхность, тем мягче угол.">
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="radius in radii"
          :key="radius.name"
          class="flex items-center gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4"
        >
          <span
            class="h-16 w-16 shrink-0 border-2 border-[var(--gr-primary)] bg-[var(--gr-accent)]"
            :style="{ borderRadius: `var(${radius.name})` }"
          />
          <span class="flex min-w-0 flex-col gap-0.5">
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ radius.name }} · {{ radiusValues.get(radius.name) }}</code>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ radius.use }}</span>
          </span>
        </li>
      </ul>
    </DocSection>

    <DocSection title="Тени" lead="Три уровня. В тёмной теме тени плотнее: светлая тень на тёмном фоне не читается.">
      <ThemeIslands>
        <div class="grid gap-5 sm:grid-cols-3">
          <div
            v-for="shadow in shadows"
            :key="shadow.name"
            class="flex min-h-[120px] flex-col justify-end gap-1 rounded-[var(--gr-radius-lg)] bg-[var(--gr-card)] p-4"
            :style="{ boxShadow: `var(${shadow.name})` }"
          >
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ shadow.name }}</code>
            <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ shadow.use }}</span>
          </div>
        </div>
      </ThemeIslands>
    </DocSection>

    <DocSection title="Слои" lead="Только со шкалы. Литерал z-index в компоненте ловит гейт пакета: два «999» от разных авторов не договорятся, кто сверху.">
      <ol class="flex flex-col-reverse gap-1.5">
        <li
          v-for="(layer, index) in layers"
          :key="layer.name"
          class="grid grid-cols-[minmax(0,220px)_64px_minmax(0,1fr)] items-center gap-4 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-4 py-2.5"
          :style="{ marginInlineStart: `${index * 12}px` }"
        >
          <code class="truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ layer.name }}</code>
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]">{{ layer.value }}</span>
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ layerUse[layer.name] }}</span>
        </li>
      </ol>
    </DocSection>

    <DocSection title="Сетка страницы" lead="Ширины контейнера и точки перелома — для раскладки приложения. Своих брейкпоинтов у компонентов нет: режим узкого экрана компоненту передаёт приложение.">
      <div class="grid gap-4 md:grid-cols-2">
        <dl class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
          <template v-for="token in containers" :key="token.name">
            <dt class="font-[var(--gr-font-mono)]">
              {{ token.name }}
            </dt>
            <dd class="font-[var(--gr-font-mono)] text-[var(--gr-muted-fg)]">
              {{ token.value }}
            </dd>
          </template>
        </dl>
        <dl class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">
          <template v-for="token in breakpoints" :key="token.name">
            <dt class="font-[var(--gr-font-mono)]">
              {{ token.name }}
            </dt>
            <dd class="font-[var(--gr-font-mono)] text-[var(--gr-muted-fg)]">
              {{ token.value }}
            </dd>
          </template>
        </dl>
      </div>
    </DocSection>
  </div>
</template>
