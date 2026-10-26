<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import IconBell from '~icons/lucide/bell'
import IconCalendar from '~icons/lucide/calendar'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconDownload from '~icons/lucide/download'
import IconKanban from '~icons/lucide/kanban'
import IconList from '~icons/lucide/list'
import IconLogOut from '~icons/lucide/log-out'
import IconSettings from '~icons/lucide/settings'
import IconUser from '~icons/lucide/user'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

type DocumentView = 'list' | 'board' | 'calendar'

const viewOptions = [
  { value: 'list', label: 'Список', icon: IconList },
  { value: 'board', label: 'Доска', icon: IconKanban },
  { value: 'calendar', label: 'Календарь', icon: IconCalendar },
] as const
const documentView = ref<DocumentView>('list')

const columnOptions = [
  { value: 'author', label: 'Автор' },
  { value: 'date', label: 'Дата изменения' },
  { value: 'status', label: 'Статус' },
  { value: 'size', label: 'Размер' },
] as const
const columns = ref<string[]>(['author', 'date'])

function toggleColumn(value: string): void {
  columns.value = columns.value.includes(value)
    ? columns.value.filter(column => column !== value)
    : [...columns.value, value]
}

const viewSummary = computed(() => {
  const view = viewOptions.find(option => option.value === documentView.value)?.label ?? ''
  const visible = columnOptions.filter(option => columns.value.includes(option.value)).map(option => option.label.toLowerCase())
  return visible.length ? `${view} · ${visible.join(', ')}` : `${view} · без колонок`
})

const lastProfileAction = ref('')

const exportFormats = ['PDF', 'CSV', 'XLSX'] as const
const lastExport = ref('')
const exportHintId = useId()

const digestOpen = ref(false)
const digest = ref<'daily' | 'weekly' | 'off'>('daily')
const digestOptions = [
  { value: 'daily', label: 'Каждый день' },
  { value: 'weekly', label: 'Раз в неделю' },
  { value: 'off', label: 'Не присылать' },
] as const
const digestLabel = computed(() => digestOptions.find(option => option.value === digest.value)?.label ?? '')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrDropdown :close-on-content-click="false" placement="bottom-start" width="15rem">
      <template #trigger="{ triggerProps }">
        <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
          Вид таблицы
          <template #suffix>
            <IconChevronDown />
          </template>
        </GrButton>
      </template>
      <template #content>
        <GrDropdownMenuList>
          <GrDropdownMenuItem
            v-for="option in viewOptions"
            :key="option.value"
            role="menuitemradio"
            :icon="option.icon"
            :checked="documentView === option.value"
            @click="documentView = option.value"
          >
            {{ option.label }}
          </GrDropdownMenuItem>
        </GrDropdownMenuList>
      </template>
    </GrDropdown>
    <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      {{ viewSummary }}
    </p>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Своя панель" note="Пункты пишете вы, слой и клавиатуру берёт компонент; выбор вида и колонок панель не закрывает.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdown :close-on-content-click="false" placement="bottom-start" width="15rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
              Вид таблицы
              <template #suffix>
                <IconChevronDown />
              </template>
            </GrButton>
          </template>
          <template #content>
            <GrDropdownMenuList>
              <GrDropdownMenuGroup title="Вид">
                <GrDropdownMenuItem
                  v-for="option in viewOptions"
                  :key="option.value"
                  role="menuitemradio"
                  :icon="option.icon"
                  :checked="documentView === option.value"
                  @click="documentView = option.value"
                >
                  {{ option.label }}
                </GrDropdownMenuItem>
              </GrDropdownMenuGroup>
              <GrDropdownMenuDivider />
              <GrDropdownMenuGroup title="Колонки">
                <GrDropdownMenuItem
                  v-for="option in columnOptions"
                  :key="option.value"
                  role="menuitemcheckbox"
                  :checked="columns.includes(option.value)"
                  @click="toggleColumn(option.value)"
                >
                  {{ option.label }}
                </GrDropdownMenuItem>
              </GrDropdownMenuGroup>
            </GrDropdownMenuList>
          </template>
        </GrDropdown>
        <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ viewSummary }}
        </p>
      </div>
    </Specimen>

    <Specimen title="По наведению" note="Задержки отличают намерение от пролёта курсора и держат панель на пути к ней; клик и клавиатура работают тоже.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdown trigger="hover" :open-delay="150" :close-delay="250" width="14rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="ghost" tone="neutral" v-bind="triggerProps">
              <!-- Имя уже в тексте кнопки: инициалы аватара диктору ни к чему. -->
              <template #prefix>
                <span aria-hidden="true" class="flex">
                  <GrAvatar name="Анна Соколова" size="xs" />
                </span>
              </template>
              Анна Соколова
            </GrButton>
          </template>
          <template #content>
            <GrDropdownMenuList>
              <GrDropdownMenuItem :icon="IconUser" @click="lastProfileAction = 'Профиль'">
                Профиль
              </GrDropdownMenuItem>
              <GrDropdownMenuItem :icon="IconSettings" @click="lastProfileAction = 'Настройки'">
                Настройки
              </GrDropdownMenuItem>
              <GrDropdownMenuDivider />
              <GrDropdownMenuItem :icon="IconLogOut" @click="lastProfileAction = 'Выйти'">
                Выйти
              </GrDropdownMenuItem>
            </GrDropdownMenuList>
          </template>
        </GrDropdown>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ lastProfileAction ? `Выбрано: ${lastProfileAction}` : 'Наведите на имя' }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Недоступно" note="Триггер остаётся в таб-порядке с aria-disabled: с клавиатуры его находят и слышат, почему меню закрыто.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdown disabled placement="bottom-start">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps" :aria-describedby="exportHintId">
              <template #prefix>
                <IconDownload />
              </template>
              Выгрузить
            </GrButton>
          </template>
          <template #content>
            <GrDropdownMenuList>
              <GrDropdownMenuItem v-for="format in exportFormats" :key="format">
                {{ format }}
              </GrDropdownMenuItem>
            </GrDropdownMenuList>
          </template>
        </GrDropdown>
        <p :id="exportHintId" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Выгрузка откроется после проверки отчёта
        </p>
      </div>
    </Specimen>

    <Specimen title="Сторона и ширина" note="placement — предпочтение: не хватит места, панель перевернётся. Ширина — CSS-длиной или auto по содержимому.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdown placement="bottom-start" width="12rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
              Выгрузить
              <template #suffix>
                <IconChevronDown />
              </template>
            </GrButton>
          </template>
          <template #content>
            <GrDropdownMenuList>
              <GrDropdownMenuItem v-for="format in exportFormats" :key="format" @click="lastExport = format">
                {{ format }}
              </GrDropdownMenuItem>
            </GrDropdownMenuList>
          </template>
        </GrDropdown>
        <GrDropdown placement="top-end" width="auto">
          <template #trigger="{ triggerProps }">
            <GrButton variant="ghost" tone="neutral" v-bind="triggerProps">
              Сверху, по содержимому
            </GrButton>
          </template>
          <template #content>
            <GrDropdownMenuList>
              <GrDropdownMenuItem v-for="format in exportFormats" :key="format" @click="lastExport = format">
                Выгрузить в {{ format }}
              </GrDropdownMenuItem>
            </GrDropdownMenuList>
          </template>
        </GrDropdown>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ lastExport ? `Готовим файл ${lastExport}` : 'Формат пока не выбран' }}
      </p>
    </Specimen>

    <Specimen title="Управление снаружи" note="v-model:open отдаёт состояние родителю: меню открывает и кнопка рядом, и сам триггер.">
      <div class="flex flex-wrap items-center gap-3">
        <GrDropdown v-model:open="digestOpen" placement="bottom-start" width="14rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
              <template #prefix>
                <IconBell />
              </template>
              Дайджест: {{ digestLabel.toLowerCase() }}
            </GrButton>
          </template>
          <template #content>
            <GrDropdownMenuList>
              <GrDropdownMenuItem
                v-for="option in digestOptions"
                :key="option.value"
                role="menuitemradio"
                :checked="digest === option.value"
                @click="digest = option.value"
              >
                {{ option.label }}
              </GrDropdownMenuItem>
            </GrDropdownMenuList>
          </template>
        </GrDropdown>
        <GrButton variant="ghost" tone="neutral" size="sm" @click="digestOpen = true">
          Открыть из кода
        </GrButton>
      </div>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Меню {{ digestOpen ? 'открыто' : 'закрыто' }}
      </p>
    </Specimen>
  </div>
</template>
