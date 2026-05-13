<script setup lang="ts">
import { DialogTrigger as DialogTriggerRadix } from 'radix-vue'
</script>

<template>
  <DialogTriggerRadix v-bind="$attrs">
    <slot />
  </DialogTriggerRadix>
</template>
