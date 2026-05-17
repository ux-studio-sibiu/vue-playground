<script setup lang="ts">
import { dependentsSchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const form = useStepForm(dependentsSchema, () => props.initialValues, () => props.serverErrors)
const [hasFamily, attrs] = form.defineField('hasFamily')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <label class="flex items-center gap-2">
      <input v-model="hasFamily" v-bind="attrs" type="checkbox" />
      <span class="text-sm">I will bring dependents to Mars</span>
    </label>
    <p v-if="form.errors.value.hasFamily" class="text-sm text-destructive">{{ form.errors.value.hasFamily }}</p>
  </form>
</template>
