<script setup lang="ts">
import { reviewSchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const form = useStepForm(reviewSchema, () => props.initialValues, () => props.serverErrors)
const [ack, ackAttrs] = form.defineField('acknowledgesNoReturn')
const [signature, sigAttrs] = form.defineField('signature')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <label class="flex items-start gap-2">
      <input v-model="ack" v-bind="ackAttrs" type="checkbox" class="mt-1" />
      <span class="text-sm">I understand that the Mars Council does not offer return travel, refunds, or sympathy.</span>
    </label>
    <p v-if="form.errors.value.acknowledgesNoReturn" class="text-sm text-destructive">{{ form.errors.value.acknowledgesNoReturn }}</p>
    <label class="block">
      <span class="text-sm font-medium">Signature</span>
      <input v-model="signature" v-bind="sigAttrs" type="text" class="mt-1 w-full rounded border px-3 py-2" />
      <p v-if="form.errors.value.signature" class="mt-1 text-sm text-destructive">{{ form.errors.value.signature }}</p>
    </label>
  </form>
</template>
