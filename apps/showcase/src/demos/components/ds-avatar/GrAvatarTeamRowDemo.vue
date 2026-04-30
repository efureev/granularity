<script setup lang="ts">
import {GrAvatar, GrCard} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-3">
    <GrCard class="grid gap-3 p-4">
      <div class="flex items-center gap-3">
        <GrAvatar :size="44">AD</GrAvatar>
        <div>
          <div class="text-sm font-semibold text-[var(--fg)]">Alex Doe</div>
          <div class="text-sm text-[var(--muted-fg)]">Engineering lead</div>
        </div>
      </div>
    </GrCard>

    <GrCard class="grid gap-3 p-4">
      <div class="flex items-center gap-3">
        <GrAvatar :size="44" shape="square">QA</GrAvatar>
        <div>
          <div class="text-sm font-semibold text-[var(--fg)]">Quality squad</div>
          <div class="text-sm text-[var(--muted-fg)]">Square avatars help differentiate team entities from
            people.
          </div>
        </div>
      </div>
    </GrCard>
  </div>
</template>
