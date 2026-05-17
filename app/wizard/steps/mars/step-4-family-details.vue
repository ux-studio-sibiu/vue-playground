<script setup lang="ts">
import { FieldArray } from 'vee-validate'
import { familyDetailsSchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

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
        <label class="block">
          <span class="text-xs font-medium">Name</span>
          <input :value="(field.value as { name?: string }).name" class="mt-1 w-full rounded border px-2 py-1" @input="form.setFieldValue(`members.${idx}.name` as never, ($event.target as HTMLInputElement).value as never)" />
          <p v-if="(form.errors.value as Record<string, string>)[`members.${idx}.name`]" class="mt-1 text-xs text-destructive">{{ (form.errors.value as Record<string, string>)[`members.${idx}.name`] }}</p>
        </label>
        <label class="block">
          <span class="text-xs font-medium">Role</span>
          <select :value="(field.value as { role?: string }).role" class="mt-1 w-full rounded border px-2 py-1" @change="form.setFieldValue(`members.${idx}.role` as never, ($event.target as HTMLSelectElement).value as never)">
            <option value="" disabled>Select…</option>
            <option value="spouse">spouse</option>
            <option value="child">child</option>
            <option value="parent">parent</option>
            <option value="sentient-pet">sentient pet</option>
          </select>
          <p v-if="(form.errors.value as Record<string, string>)[`members.${idx}.role`]" class="mt-1 text-xs text-destructive">{{ (form.errors.value as Record<string, string>)[`members.${idx}.role`] }}</p>
        </label>
        <button type="button" class="text-xs text-destructive underline" @click="remove(idx)">Remove</button>
      </div>
      <button type="button" class="rounded border px-3 py-1 text-sm" :disabled="fields.length >= 4" @click="push({ name: '', role: 'child' })">+ Add dependent</button>
    </FieldArray>
    <p v-if="(form.errors.value as Record<string, string>).members" class="text-sm text-destructive">{{ (form.errors.value as Record<string, string>).members }}</p>
  </form>
</template>
