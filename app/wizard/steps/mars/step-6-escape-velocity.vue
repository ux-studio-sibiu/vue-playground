<script setup lang="ts">
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { escapeVelocitySchema } from '~~/shared/wizard/steps/mars'
import type { WizardFieldErrors } from '~~/shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'
import { Button } from '@/components/ui/button'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
  isSubmitting: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>]; back: [] }>()

const form = useStepForm(escapeVelocitySchema, () => props.initialValues, () => props.serverErrors)
const [vel, attrs] = form.defineField('escapeVelocityKmS')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <Field name="escapeVelocityKmS" :error="form.errors.value.escapeVelocityKmS">
      <FieldLabel>Earth escape velocity (km/s)</FieldLabel>
      <Input v-model.number="vel" v-bind="attrs" type="number" step="0.01" />
      <FieldError />
    </Field>
  </form>
  <Teleport to="#wizard-footer-portal" defer>
    <div class="flex gap-2 px-6 py-4">
      <Button variant="btn-default" @click="$emit('back')">Back</Button>
      <Button variant="btn-primary" form="wizard-step-form" type="submit">Next</Button>
    </div>
  </Teleport>
</template>
