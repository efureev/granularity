<script setup lang="ts">
import {DsAvatar} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <DsAvatar :size="32">AD</DsAvatar>
      <DsAvatar :size="40">AD</DsAvatar>
      <DsAvatar :size="56">AD</DsAvatar>
      <DsAvatar :size="72">AD</DsAvatar>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <DsAvatar :size="40" shape="square">QA</DsAvatar>
      <DsAvatar :size="56" shape="square">PM</DsAvatar>
      <DsAvatar :size="72" shape="square">UX</DsAvatar>
    </div>
  </div>
</template>
