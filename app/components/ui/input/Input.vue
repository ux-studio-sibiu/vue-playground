<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from '../field/fieldContext'
import { type InputVariants, inputVariants } from '.'

interface Props {
  modelValue?: string | number | null
  size?: InputVariants['size']
  /** Override the auto-bound id from Field context. */
  id?: string
  /** Override the field error state. */
  invalid?: boolean
  class?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const ctx = inject(FIELD_CONTEXT_KEY, null)
const id = computed(() => props.id ?? ctx?.id)
const ariaInvalid = computed(() => {
  if (props.invalid !== undefined) return props.invalid || undefined
  return ctx?.error.value ? true : undefined
})
const ariaDescribedBy = computed(() => ctx?.describedBy.value)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  // Preserve number behavior when input is type="number"
  if (target.type === 'number') {
    emit('update:modelValue', target.valueAsNumber)
  }
  else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <input :id="id" :value="modelValue" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedBy" :class="cn(inputVariants({ size }), props.class)" v-bind="attrs" @input="onInput">
</template>
