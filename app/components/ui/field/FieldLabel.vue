<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from './fieldContext'

interface Props {
  /** Extra classes. */
  class?: string
}
const props = defineProps<Props>()

const ctx = inject(FIELD_CONTEXT_KEY, null)
</script>

<template>
  <label :for="ctx?.id" :class="cn('text-sm font-medium', props.class)">
    <slot />
  </label>
</template>
