<script setup lang="ts">
import { DialogDescription as DialogDescriptionRadix } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <DialogDescriptionRadix :class="cn('text-sm text-muted-foreground', props.class ?? '')">
    <slot />
  </DialogDescriptionRadix>
</template>
