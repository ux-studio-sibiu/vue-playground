<script setup lang="ts">
import { computed, provide, ref, useId } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from './fieldContext'

interface Props {
  /** Optional explicit id; auto-generated when omitted. */
  id?: string
  /** Human field name (used for aria + matching server errors). */
  name?: string
  /** Current error message, if any. */
  error?: string
  /** Extra classes for the wrapper. */
  class?: string
}
const props = defineProps<Props>()

const autoId = useId()
const id = computed(() => props.id ?? `field-${autoId}`)
const error = computed(() => (props.error && props.error.length > 0 ? props.error : undefined))

const hasHint = ref(false)
const hasError = ref(false)
const hintId = computed(() => `${id.value}-hint`)
const errorId = computed(() => `${id.value}-error`)

const describedBy = computed(() => {
  const ids: string[] = []
  if (hasHint.value) ids.push(hintId.value)
  if (hasError.value && error.value) ids.push(errorId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

provide(FIELD_CONTEXT_KEY, {
  id: id.value,
  name: props.name,
  error,
  describedBy,
  hintId: hintId.value,
  errorId: errorId.value,
  registerHint: () => { hasHint.value = true },
  registerError: () => { hasError.value = true },
})
</script>

<template>
  <div :class="cn('space-y-1', props.class)">
    <slot />
  </div>
</template>
