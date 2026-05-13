<script setup lang="ts">
import { DialogTitle as DialogTitleRadix } from 'radix-vue'
import { cn } from '~/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <DialogTitleRadix :class="cn('text-lg font-semibold leading-none tracking-tight', props.class ?? '')">
    <slot />
  </DialogTitleRadix>
</template>
