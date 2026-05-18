<script setup lang="ts">
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { identitySchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'
import { Button } from '@/components/ui/button'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
  isSubmitting: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>]; back: [] }>()

const form = useStepForm(
  identitySchema,
  () => props.initialValues,
  () => props.serverErrors,
)
const [fullName, fullNameAttrs] = form.defineField('fullName')
const [martianAlias, aliasAttrs] = form.defineField('martianAlias')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>

  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <Field name="fullName" :error="form.errors.value.fullName">
      <FieldLabel>Earth name</FieldLabel>
      <Input v-model="fullName" v-bind="fullNameAttrs" type="text" />
      <FieldError />
    </Field>
    <Field name="martianAlias" :error="form.errors.value.martianAlias">
      <FieldLabel>Preferred Martian alias</FieldLabel>
      <Input v-model="martianAlias" v-bind="aliasAttrs" type="text" />
      <FieldError />
    </Field>

  </form>
  <Teleport to="#wizard-footer-portal" defer>
    <div class="flex gap-2 px-6 py-4">
      <Button variant="btn-primary" form="wizard-step-form" type="submit">Next</Button>
    </div>
  </Teleport>
</template>
