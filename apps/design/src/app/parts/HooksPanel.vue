<script setup lang="ts">
import { computed, ref } from 'vue'

import { componentTokens } from '../tokenRegistry'
import IconSearch from '~icons/lucide/search'

import { plural } from '../plural'
import CopyButton from './CopyButton.vue'
import DocSection from './DocSection.vue'
import HookTable from './HookTable.vue'

/**
 * Хуки компонентов — ручки приложения поверх любой темы. Тема их не задаёт:
 * значение темы для хука — находка doctor `theme-token-foreign`. Компонент
 * читает хук с запасным значением, приложение ставит его в своём CSS на корень
 * или поддерево.
 */
const props = defineProps<{
  /** Компоненты, чьи хуки показать. */
  owners: readonly string[]
  /** Поиск и выбор компонента — когда компонентов много. */
  filters?: boolean
}>()

const ALL = '*'

const hooks = computed(() => componentTokens.filter(token => token.kind === 'hook' && props.owners.includes(token.owner)))
const owners = computed(() => props.owners.filter(owner => hooks.value.some(hook => hook.owner === owner)))

const search = ref('')
const owner = ref(ALL)
const ownerOptions = computed(() => [{ value: ALL, label: 'все компоненты' }, ...owners.value.map(item => ({ value: item, label: item }))])

const query = computed(() => search.value.trim().toLowerCase())
const groups = computed(() => owners.value
  .filter(item => owner.value === ALL || owner.value === item)
  .map(item => ({
    owner: item,
    hooks: hooks.value.filter(hook => hook.owner === item && (query.value === ''
      || hook.name.includes(query.value)
      || hook.description.toLowerCase().includes(query.value))),
  }))
  .filter(group => group.hooks.length > 0))

/** Хук ставится в CSS приложения и действует на элемент и всё под ним. */
const example = computed(() => (hooks.value[0] ? `.toolbar { ${hooks.value[0].name}: …; }` : undefined))

const summary = computed(() => `${plural(hooks.value.length, ['хук', 'хука', 'хуков'])} у ${plural(owners.value.length, ['компонента', 'компонентов', 'компонентов'])}`)
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
      <h2 class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
        {{ hooks.length > 0 ? `Хуки · ${summary}` : 'Хуков нет' }}
      </h2>
      <p v-if="hooks.length === 0" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
        Ручек приложения у компонента нет: его вид задают тема — роли и токены — и пропсы.
      </p>
      <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)]">
        <dt class="font-600">
          Токен
        </dt>
        <dd class="text-[var(--gr-muted-fg)]">
          значение задаёт тема — у каждой темы и режима своё.
        </dd>
        <dt class="font-600">
          Хук
        </dt>
        <dd class="text-[var(--gr-muted-fg)]">
          тема его не задаёт: без значения приложения действует запасное — обычно токен темы, с ним — значение приложения в любой теме.
        </dd>
        <template v-if="example">
          <dt class="self-center font-600">
            Как задать
          </dt>
          <dd class="flex min-w-0 items-center gap-1">
            <code class="min-w-0 truncate rounded-[var(--gr-radius-sm)] bg-[var(--gr-muted)] px-2 py-0.5 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ example }}</code>
            <CopyButton :text="example" label="Скопировать пример" />
          </dd>
        </template>
      </dl>
      <div v-if="filters" class="flex flex-wrap items-end gap-3 pt-1">
        <GrFormField label="Поиск" size="sm" class="w-[260px]">
          <GrInput v-model="search" type="search" size="sm" clearable placeholder="имя или описание">
            <template #prefix>
              <GrIcon><IconSearch /></GrIcon>
            </template>
          </GrInput>
        </GrFormField>
        <GrFormField label="Компонент" size="sm" class="w-[220px]">
          <GrSelect v-model="owner" size="sm" filterable :options="ownerOptions" />
        </GrFormField>
      </div>
    </div>

    <DocSection v-for="group in groups" :key="group.owner" :title="`${group.owner} · ${group.hooks.length}`">
      <HookTable :hooks="group.hooks" :label="`Хуки ${group.owner}`" />
    </DocSection>

    <GrEmptyState
      v-if="groups.length === 0"
      title="Ничего не нашлось"
      :description="`Нет хуков с «${search.trim()}» в имени или описании.`"
    />
  </div>
</template>
