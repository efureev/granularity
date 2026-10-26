<script setup lang="ts">
import type { GrTreeKey } from '@feugene/granularity/components/GrTree'

import { ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewPermissions = [
  {
    id: 'perm-docs',
    label: 'Документы',
    children: [
      { id: 'perm-docs-read', label: 'Просмотр' },
      { id: 'perm-docs-edit', label: 'Редактирование' },
    ],
  },
]
const previewGranted = ref<GrTreeKey[]>(['perm-docs-read'])

const permissions = [
  {
    id: 'perm-docs',
    label: 'Документы',
    children: [
      { id: 'perm-docs-read', label: 'Просмотр' },
      {
        id: 'perm-docs-edit',
        label: 'Редактирование',
        children: [
          { id: 'perm-docs-edit-own', label: 'Свои' },
          { id: 'perm-docs-edit-all', label: 'Все' },
        ],
      },
      { id: 'perm-docs-delete', label: 'Удаление' },
    ],
  },
  {
    id: 'perm-money',
    label: 'Финансы',
    children: [
      { id: 'perm-money-invoices', label: 'Счета' },
      { id: 'perm-money-refunds', label: 'Возвраты' },
    ],
  },
  {
    id: 'perm-team',
    label: 'Команда',
    children: [
      { id: 'perm-team-invite', label: 'Приглашение участников' },
      { id: 'perm-team-roles', label: 'Назначение ролей' },
    ],
  },
]
const grantedPermissions = ref<GrTreeKey[]>(['perm-docs-read', 'perm-docs-edit-own', 'perm-money-invoices'])

const settings = [
  {
    id: 'set-account',
    label: 'Аккаунт',
    children: [
      { id: 'set-profile', label: 'Профиль' },
      { id: 'set-security', label: 'Безопасность', children: [{ id: 'set-password', label: 'Пароль' }, { id: 'set-sessions', label: 'Сеансы' }] },
    ],
  },
  {
    id: 'set-workspace',
    label: 'Пространство',
    children: [
      { id: 'set-members', label: 'Участники' },
      { id: 'set-billing', label: 'Оплата и счета' },
      { id: 'set-integrations', label: 'Интеграции' },
    ],
  },
]
const currentSetting = ref<GrTreeKey | undefined>('set-sessions')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTreeSections
      v-model:checked-keys="previewGranted"
      :data="previewPermissions"
      :heading-level="5"
      size="sm"
      show-checkbox
      show-count
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Права доступа" note="рубрики — заголовками, под ними — деревья с отметками; отметки складываются по группам">
      <GrTreeSections
        v-model:checked-keys="grantedPermissions"
        :data="permissions"
        :heading-level="5"
        :default-expanded-keys="['perm-docs-edit']"
        show-checkbox
        show-count
      />
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Выдано прав: {{ grantedPermissions.length }}
      </p>
    </Specimen>

    <Specimen title="Разделы настроек" note="выбранный узел один на все группы; у каждой группы своё кольцо стрелок, между ними — Tab">
      <GrTreeSections
        v-model:current-key="currentSetting"
        :data="settings"
        :heading-level="5"
        :default-expanded-keys="['set-security']"
        branch-line="elbow"
      />
    </Specimen>
  </div>
</template>
