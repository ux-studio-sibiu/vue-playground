<script setup lang="ts">
import { escapeVelocitySchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const form = useStepForm(escapeVelocitySchema, () => props.initialValues, () => props.serverErrors)
const [vel, attrs] = form.defineField('escapeVelocityKmS')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <label class="block">
      <span class="text-sm font-medium">Earth escape velocity (km/s)</span>
      <input v-model.number="vel" v-bind="attrs" type="number" step="0.01" class="mt-1 w-full rounded border px-3 py-2" />
      <p v-if="form.errors.value.escapeVelocityKmS" class="mt-1 text-sm text-destructive">{{ form.errors.value.escapeVelocityKmS }}</p>
    </label>
  </form>
</template>
