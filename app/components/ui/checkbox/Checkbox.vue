<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { cn } from '~/lib/utils'
import { FIELD_CONTEXT_KEY } from '../field/fieldContext'

interface Props {
  modelValue?: boolean
  id?: string
  class?: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const ctx = inject(FIELD_CONTEXT_KEY, null)
const id = computed(() => props.id ?? ctx?.id)
const ariaInvalid = computed(() => (ctx?.error.value ? true : undefined))
const ariaDescribedBy = computed(() => ctx?.describedBy.value)

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <input :id="id" type="checkbox" :checked="modelValue" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedBy" :class="cn('h-4 w-4 rounded border-input text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', props.class)" v-bind="attrs" @change="onChange">
</template>
