<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { reviewSchema } from '~~/shared/wizard/steps/mars'
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

const form = useStepForm(reviewSchema, () => props.initialValues, () => props.serverErrors)
const [ack, ackAttrs] = form.defineField('acknowledgesNoReturn')
const [signature, sigAttrs] = form.defineField('signature')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <Field name="acknowledgesNoReturn" :error="form.errors.value.acknowledgesNoReturn">
      <FieldLabel class="flex items-start gap-2 font-normal">
        <Checkbox v-model="ack" v-bind="ackAttrs" class="mt-1" />
        <span>I understand that the Mars Council does not offer return travel, refunds, or sympathy.</span>
      </FieldLabel>
      <FieldError />
    </Field>
    <Field name="signature" :error="form.errors.value.signature">
      <FieldLabel>Signature</FieldLabel>
      <Input v-model="signature" v-bind="sigAttrs" type="text" />
      <FieldError />
    </Field>
  </form>
  <Teleport to="#wizard-footer-portal" defer>
    <div class="flex gap-2 px-6 py-4">
      <Button variant="btn-default" @click="$emit('back')">Back</Button>
      <Button variant="btn-primary" form="wizard-step-form" type="submit">Review</Button>
    </div>
  </Teleport>
</template>
