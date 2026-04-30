<script setup lang="ts">
import {GrAvatar, GrCard} from "@feugene/granularity";

const avatarSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="24" fill="#dbeafe" />
    <circle cx="48" cy="36" r="16" fill="#2563eb" opacity="0.18" />
    <path d="M18 80c6-15 18-23 30-23s24 8 30 23" fill="#2563eb" opacity="0.26" />
    <circle cx="48" cy="36" r="13" fill="#2563eb" />
  </svg>
`)

const avatarImageSrc = `data:image/svg+xml;charset=UTF-8,${avatarSvg}`
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
    <div class="flex flex-wrap items-center gap-4">
      <GrAvatar :size="40" :src="avatarImageSrc" alt="Alex Doe" />
      <GrAvatar :size="56" :src="avatarImageSrc" alt="Alex Doe" />
      <GrAvatar :size="72" shape="square" :src="avatarImageSrc" alt="Alex Doe" />
    </div>

    <GrCard class="grid gap-2 p-4 text-sm text-[var(--muted-fg)]">
      <div class="font-semibold text-[var(--fg)]">
        Fallback contract
      </div>
      <div>
        When `src` is omitted, the component renders the default slot so initials and icons remain accessible.
      </div>
    </GrCard>
  </div>
</template>
