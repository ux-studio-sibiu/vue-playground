<script setup lang="ts">
import { bloodTypeSchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const

const form = useStepForm(bloodTypeSchema, () => props.initialValues, () => props.serverErrors)
const [bloodType, attrs] = form.defineField('bloodType')

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <label class="block">
      <span class="text-sm font-medium">Blood type</span>
      <select v-model="bloodType" v-bind="attrs" class="mt-1 w-full rounded border px-3 py-2">
        <option value="" disabled>Select…</option>
        <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
      </select>
      <p v-if="form.errors.value.bloodType" class="mt-1 text-sm text-destructive">{{ form.errors.value.bloodType }}</p>
    </label>
  </form>
</template>
