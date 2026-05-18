<script setup lang="ts">
import { cn } from '~/lib/utils'
import { type StepperItemState, stepperItemVariants } from '.'

interface Props {
  /** Visual + interaction state. */
  state: StepperItemState
  /** 1-based index, displayed before the label. */
  index: number
  /** Disable the button (e.g. while submitting). */
  disabled?: boolean
  class?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" :class="cn(stepperItemVariants({ state: props.state }), props.class)" :disabled="props.disabled || props.state !== 'visited'" :aria-current="props.state === 'current' ? 'step' : undefined" @click="emit('click')">
    <span class="mr-2 text-xs">{{ props.index }}.</span><slot />
  </button>
</template>
