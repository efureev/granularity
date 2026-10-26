<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import type { GrPopoverSize } from '@feugene/granularity'
import IconArchive from '~icons/lucide/archive'
import IconCalendar from '~icons/lucide/calendar'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconShare from '~icons/lucide/share-2'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const shareOpen = ref(false)
const inviteEmail = ref('')
const inviteError = ref<string>()
const linkAccess = ref(true)
const invited = ref<string[]>([])

function invite(): void {
  const email = inviteEmail.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    inviteError.value = 'Нужна почта вида name@company.ru'
    return
  }
  invited.value = [...invited.value, email]
  inviteEmail.value = ''
  inviteError.value = undefined
  shareOpen.value = false
}

const archiveOpen = ref(false)
const archived = ref(false)
const archiveTitleId = useId()

function archive(): void {
  archived.value = true
  archiveOpen.value = false
}

const PERIODS = [
  { value: '7', label: 'Последние 7 дней' },
  { value: '30', label: 'Последние 30 дней' },
  { value: '90', label: 'Последний квартал' },
  { value: '365', label: 'Последний год' },
]
const period = ref('30')
const periodLabel = computed(() => PERIODS.find(option => option.value === period.value)?.label ?? '')

const SIZES: readonly GrPopoverSize[] = ['sm', 'md', 'lg']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrPopover aria-label="Поделиться документом" placement="bottom-start">
        <template #trigger="{ triggerProps }">
          <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
            <template #prefix>
              <IconShare />
            </template>
            Поделиться
          </GrButton>
        </template>
        <template #content>
          <p class="w-64 max-w-full text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            Читать сможет любой, у кого есть ссылка.
          </p>
        </template>
      </GrPopover>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Доступ по ссылке
      </p>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Форма у кнопки" note="Своё содержимое у якоря; Esc и щелчок мимо закрывают, Tab уводит наружу — ловушки нет.">
      <div class="flex flex-wrap items-center gap-3">
        <GrPopover v-model:open="shareOpen" aria-label="Поделиться документом" placement="bottom-start">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" v-bind="triggerProps">
              <template #prefix>
                <IconShare />
              </template>
              Поделиться
            </GrButton>
          </template>
          <template #content>
            <form class="flex w-80 max-w-full flex-col gap-3" novalidate @submit.prevent="invite">
              <GrFormField label="Пригласить" :error="inviteError">
                <div class="flex gap-2">
                  <GrInput
                    v-model="inviteEmail"
                    type="email"
                    size="sm"
                    autocomplete="email"
                    placeholder="Почта коллеги"
                  />
                  <GrButton type="submit" size="sm">
                    Отправить
                  </GrButton>
                </div>
              </GrFormField>
              <GrSwitch v-model="linkAccess" size="sm">
                Доступ по ссылке
              </GrSwitch>
              <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                {{ linkAccess ? 'Читать сможет любой, у кого есть ссылка' : 'Открыть смогут только приглашённые' }}
              </p>
            </form>
          </template>
        </GrPopover>
        <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ invited.length ? `Приглашены: ${invited.join(', ')}` : 'Пока никого не пригласили' }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Подтверждение у кнопки" note="modal: фон уходит в inert, Tab ходит по кругу внутри, фокус — в панели. Окно для этого не нужно.">
      <div class="flex flex-wrap items-center gap-3">
        <GrPopover v-model:open="archiveOpen" modal :disabled="archived" :labelled-by="archiveTitleId" placement="top-start" size="sm">
          <template #trigger="{ triggerProps }">
            <GrButton variant="outline" tone="danger" v-bind="triggerProps">
              <template #prefix>
                <IconArchive />
              </template>
              Архивировать задачи
            </GrButton>
          </template>
          <template #content>
            <div class="flex w-64 max-w-full flex-col gap-3">
              <p :id="archiveTitleId" class="font-500">
                Убрать в архив 12 закрытых задач?
              </p>
              <p class="text-[var(--gr-muted-fg)]">
                Их можно будет вернуть из архива.
              </p>
              <div class="flex justify-end gap-2">
                <GrButton variant="ghost" tone="neutral" size="xs" @click="archiveOpen = false">
                  Отмена
                </GrButton>
                <GrButton tone="danger" size="xs" @click="archive">
                  Архивировать
                </GrButton>
              </div>
            </div>
          </template>
        </GrPopover>
        <GrButton v-if="archived" variant="ghost" tone="neutral" size="sm" @click="archived = false">
          Вернуть
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ archived ? 'Задачи в архиве' : '12 задач закрыты больше месяца' }}
      </p>
    </Specimen>

    <Specimen title="По наведению" note="Карточка открывается с задержкой и не гаснет, пока курсор едет к ней; клик и клавиатура открывают её тоже.">
      <div class="flex flex-wrap items-baseline gap-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
        <span>Отчёт подготовил</span>
        <GrPopover trigger="hover" :open-delay="200" :close-delay="300" aria-label="Карточка сотрудника" placement="bottom-start">
          <template #trigger="{ triggerProps }">
            <GrLink as="button" type="button" v-bind="triggerProps">
              Иван Петров
            </GrLink>
          </template>
          <template #content>
            <div class="flex w-64 max-w-full flex-col gap-3">
              <div class="flex items-center gap-3">
                <span aria-hidden="true" class="flex">
                  <GrAvatar name="Иван Петров" size="md" />
                </span>
                <div class="flex min-w-0 flex-col">
                  <span class="font-500">Иван Петров</span>
                  <span class="text-[var(--gr-muted-fg)]">Аналитик, отдел продаж</span>
                </div>
              </div>
              <GrButton variant="secondary" tone="neutral" size="sm">
                Написать
              </GrButton>
            </div>
          </template>
        </GrPopover>
      </div>
    </Specimen>

    <Specimen title="Во всю ширину поля" note="block растягивает обёртку триггера, match-width ведёт панель по его ширине — у поля она не уже его.">
      <div class="flex flex-col gap-1.5">
        <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">Период отчёта</span>
        <GrPopover block match-width aria-label="Период отчёта" placement="bottom-start">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" block v-bind="triggerProps">
              <template #prefix>
                <IconCalendar />
              </template>
              {{ periodLabel }}
              <template #suffix>
                <IconChevronDown />
              </template>
            </GrButton>
          </template>
          <template #content>
            <GrRadioGroup v-model="period" :options="PERIODS" aria-label="Период отчёта" />
          </template>
        </GrPopover>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="sm · md · lg задают поля и кегль панели по шкале контролов.">
      <div class="flex flex-wrap items-center gap-2">
        <GrPopover v-for="size in SIZES" :key="size" :size="size" :aria-label="`Панель ступени ${size}`" placement="bottom-start">
          <template #trigger="{ triggerProps }">
            <GrButton variant="secondary" tone="neutral" size="sm" v-bind="triggerProps">
              {{ size }}
            </GrButton>
          </template>
          <template #content>
            <p class="w-56 max-w-full">
              Ступень {{ size }}: поля и кегль панели растут вместе с ней.
            </p>
          </template>
        </GrPopover>
      </div>
    </Specimen>
  </div>
</template>
