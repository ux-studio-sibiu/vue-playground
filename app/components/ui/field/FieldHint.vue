<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from './fieldContext'

interface Props {
  class?: string
}
const props = defineProps<Props>()

const ctx = inject(FIELD_CONTEXT_KEY, null)
onMounted(() => ctx?.registerHint())
</script>

<template>
  <p :id="ctx?.hintId" :class="cn('text-xs text-muted-foreground', props.class)">
    <slot />
  </p>
</template>
