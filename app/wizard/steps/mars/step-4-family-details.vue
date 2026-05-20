<script setup lang="ts">
import { FieldArray } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { familyDetailsSchema } from '~~/shared/wizard/steps/mars'
import type { WizardFieldErrors } from '~~/shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
  isSubmitting: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>]; back: [] }>()

const form = useStepForm(
  familyDetailsSchema,
  () => ({ members: [], ...props.initialValues }),
  () => props.serverErrors,
)

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-4" novalidate @submit="onSubmit">
    <FieldArray name="members" v-slot="{ fields, push, remove }">
      <div v-for="(field, idx) in fields" :key="field.key" class="rounded border p-3 space-y-2">
        <Field :name="`members.${idx}.name`" :error="(form.errors.value as Record<string, string>)[`members.${idx}.name`]">
          <FieldLabel class="text-xs">Name</FieldLabel>
          <Input :model-value="(field.value as { name?: string }).name" size="sm" @update:model-value="form.setFieldValue(`members.${idx}.name` as never, $event as never)" />
          <FieldError class="text-xs" />
        </Field>
        <Field :name="`members.${idx}.role`" :error="(form.errors.value as Record<string, string>)[`members.${idx}.role`]">
          <FieldLabel class="text-xs">Role</FieldLabel>
          <Select :model-value="(field.value as { role?: string }).role" size="sm" @update:model-value="form.setFieldValue(`members.${idx}.role` as never, $event as never)">
            <option value="" disabled>Select…</option>
            <option value="spouse">spouse</option>
            <option value="child">child</option>
            <option value="parent">parent</option>
            <option value="sentient-pet">sentient pet</option>
          </Select>
          <FieldError class="text-xs" />
        </Field>
        <Button variant="btn-default" size="sm" class="text-xs text-destructive" @click="remove(idx)">Remove</Button>
      </div>
      <Button variant="btn-default" size="sm" :disabled="fields.length >= 4" @click="push({ name: '', role: 'child' })">+ Add dependent</Button>
    </FieldArray>
    <p v-if="(form.errors.value as Record<string, string>).members" class="text-sm text-destructive">{{ (form.errors.value as Record<string, string>).members }}</p>
  </form>
  <Teleport to="#wizard-footer-portal" defer>
    <div class="flex gap-2 px-6 py-4">
      <Button variant="btn-default" @click="$emit('back')">Back</Button>
      <Button variant="btn-primary" form="wizard-step-form" type="submit">Next</Button>
    </div>
  </Teleport>
</template>
