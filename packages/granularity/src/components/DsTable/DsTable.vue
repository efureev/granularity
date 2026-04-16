<template>
  <div class="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--card)]">
    <table class="min-w-full text-sm">
      <thead class="bg-[var(--muted)] text-[var(--muted-fg)]">
        <slot name="head" />
      </thead>
      <tbody class="text-[var(--fg)]">
        <slot />
      </tbody>
    </table>
  </div>
</template>