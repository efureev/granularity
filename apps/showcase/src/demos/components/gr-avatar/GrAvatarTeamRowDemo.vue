<script setup lang="ts">
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
</template>
