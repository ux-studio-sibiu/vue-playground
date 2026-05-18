<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from '../field/fieldContext'
import { type SelectVariants, selectVariants } from '.'

interface Props {
  modelValue?: string | number | null
  size?: SelectVariants['size']
  id?: string
  invalid?: boolean
  class?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
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

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select :id="id" :value="modelValue ?? ''" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedBy" :class="cn(selectVariants({ size }), props.class)" v-bind="attrs" @change="onChange">
    <slot />
  </select>
</template>
