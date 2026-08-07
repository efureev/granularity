import type { ShowcaseComponentExampleDoc } from '../types'

export const grAvatarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'avatar-size-shape',
    title: 'Sizes and circle/square shapes',
    description: 'Минимальный набор размеров и форм помогает быстро понять, как `GrAvatar` ведёт себя для людей и для team/workspace сущностей.',
    status: 'ready',
    previewKey: 'gr-avatar-size-shape',
    code: `<script setup lang="ts">
import { GrAvatar } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <GrAvatar :size="32">AD</GrAvatar>
    <GrAvatar :size="40">AD</GrAvatar>
    <GrAvatar :size="56">AD</GrAvatar>
    <GrAvatar :size="72">AD</GrAvatar>
    <GrAvatar :size="56" shape="square">QA</GrAvatar>
  </div>
</template>`,
  },
  {
    id: 'avatar-image-fallback',
    title: 'Image mode with default-slot fallback',
    description: 'Показываем основной contract компонента: `src` рендерит изображение, а при его отсутствии тот же размер сохраняется для fallback-контента.',
    status: 'ready',
    previewKey: 'gr-avatar-image-fallback',
    code: `<script setup lang="ts">
import {GrAvatar, GrCard} from "@feugene/granularity";

const avatarSvg = encodeURIComponent(\`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="24" fill="#dbeafe" />
    <circle cx="48" cy="36" r="16" fill="#2563eb" opacity="0.18" />
    <path d="M18 80c6-15 18-23 30-23s24 8 30 23" fill="#2563eb" opacity="0.26" />
    <circle cx="48" cy="36" r="13" fill="#2563eb" />
  </svg>
\`)

const avatarImageSrc = \`data:image/svg+xml;charset=UTF-8,\${avatarSvg}\`
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
    <div class="flex flex-wrap items-center gap-4">
      <GrAvatar :size="40" :src="avatarImageSrc" alt="Alex Doe" />
      <GrAvatar :size="56" :src="avatarImageSrc" alt="Alex Doe" status="online" />
      <GrAvatar :size="72" shape="square" :src="avatarImageSrc" alt="Alex Doe" />

      <!-- Битая ссылка — основной сценарий отказа: показываются инициалы из \`name\`. -->
      <GrAvatar :size="56" src="/broken-avatar.png" name="Alex Doe" />
      <GrAvatar :size="56" src="/broken-avatar.png" :fallback-src="avatarImageSrc" name="Alex Doe" />
    </div>

    <GrCard class="grid gap-2 p-4 text-sm text-[var(--gr-muted-fg)]">
      <div class="font-semibold text-[var(--gr-fg)]">
        Fallback contract
      </div>
      <div>
        A broken \`src\` falls back to \`fallbackSrc\`, then to initials from \`name\` — the browser never shows its
        broken-image icon. Without \`src\` the default slot is rendered as before.
      </div>
    </GrCard>
  </div>
</template>`,
  },
  {
    id: 'avatar-team-row',
    title: 'Composition inside user or team rows',
    description: 'На практике `GrAvatar` почти всегда живёт рядом с именем, ролью и secondary text — поэтому документируем и такой composed layout.',
    status: 'ready',
    previewKey: 'gr-avatar-team-row',
    code: `<script setup lang="ts">
import { GrAvatar, GrAvatarGroup, GrCard } from '@feugene/granularity'

const team = [
  { name: 'Alex Doe', status: 'online' as const },
  { name: 'Quinn Ali', status: 'busy' as const },
  { name: 'Sam Rivera', status: 'away' as const },
  { name: 'Noor Haddad', status: 'offline' as const },
]
</script>

<template>
  <div class="grid gap-3">
    <GrCard class="grid gap-3 p-4">
      <div class="flex items-center gap-3">
        <GrAvatar :size="44" name="Alex Doe" status="online" />
        <div>
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Alex Doe
          </div>
          <div class="text-sm text-[var(--gr-muted-fg)]">
            Engineering lead
          </div>
        </div>
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Release squad
      </div>
      <GrAvatarGroup :max="3" :total="9" size="md" aria-label="Release squad">
        <GrAvatar v-for="member in team" :key="member.name" :name="member.name" :status="member.status" />
      </GrAvatarGroup>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Стекинг с «+N»: группа объявляет диктору и имя, и число скрытых участников.
      </div>
    </GrCard>
  </div>
</template>`,
  },
]
