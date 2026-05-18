<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from './fieldContext'

interface Props {
  class?: string
}
const props = defineProps<Props>()

const ctx = inject(FIELD_CONTEXT_KEY, null)
onMounted(() => ctx?.registerError())
</script>

<template>
  <p v-if="ctx?.error.value" :id="ctx.errorId" role="alert" :class="cn('text-sm text-destructive', props.class)">
    {{ ctx.error.value }}
  </p>
</template>
