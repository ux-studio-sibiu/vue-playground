<script setup lang="ts">
import { identitySchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

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
    <label class="block">
      <span class="text-sm font-medium">Earth name</span>
      <input v-model="fullName" v-bind="fullNameAttrs" type="text" class="mt-1 w-full rounded border px-3 py-2" />
      <p v-if="form.errors.value.fullName" class="mt-1 text-sm text-destructive">{{ form.errors.value.fullName }}</p>
    </label>
    <label class="block">
      <span class="text-sm font-medium">Preferred Martian alias</span>
      <input v-model="martianAlias" v-bind="aliasAttrs" type="text" class="mt-1 w-full rounded border px-3 py-2" />
      <p v-if="form.errors.value.martianAlias" class="mt-1 text-sm text-destructive">{{ form.errors.value.martianAlias }}</p>
    </label>
  </form>
</template>
