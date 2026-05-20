<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { dependentsSchema } from '~~/shared/wizard/steps/mars'
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

const form = useStepForm(dependentsSchema, () => props.initialValues, () => props.serverErrors)
const [hasFamily, attrs] = form.defineField('hasFamily')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <Field name="hasFamily" :error="form.errors.value.hasFamily">
      <FieldLabel class="flex items-center gap-2 font-normal">
        <Checkbox v-model="hasFamily" v-bind="attrs" />
        <span>I will bring dependents to Mars</span>
      </FieldLabel>
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
