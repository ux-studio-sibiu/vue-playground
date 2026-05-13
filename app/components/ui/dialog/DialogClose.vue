<script setup lang="ts">
import { DialogClose as DialogCloseRadix } from 'radix-vue'
</script>

<template>
  <DialogCloseRadix v-bind="$attrs">
    <slot />
  </DialogCloseRadix>
</template>
