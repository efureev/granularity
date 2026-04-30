<script setup lang="ts">
import {GrAvatar} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrAvatar :size="32">AD</GrAvatar>
      <GrAvatar :size="40">AD</GrAvatar>
      <GrAvatar :size="56">AD</GrAvatar>
      <GrAvatar :size="72">AD</GrAvatar>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <GrAvatar :size="40" shape="square">QA</GrAvatar>
      <GrAvatar :size="56" shape="square">PM</GrAvatar>
      <GrAvatar :size="72" shape="square">UX</GrAvatar>
    </div>
  </div>
</template>
