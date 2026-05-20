<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { marsSteps } from '~~/shared/wizard/steps/mars'
import WizardDialog from '~/wizard/components/wizard-dialog.vue'
import { marsStepRegistry } from '~/wizard/steps/mars/registry'

definePageMeta({ layout: 'blank' })

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Share+Tech+Mono&family=Cinzel:wght@400;600;700;900&display=swap',
    },
  ],
})

const open = ref(false)

const route = useRoute()
const router = useRouter()
const THEMES = [{ value: '', label: 'Default (light)' }, { value: 'dark', label: 'Dark' }, { value: 'mars', label: 'Mars (rust)' }] as const
type StyleParam = '' | 'dark' | 'mars'
const CLASS_MAP: Record<StyleParam, string> = { '': '', 'dark': 'dark', 'mars': 'theme-mars' }

const styleParam = computed<StyleParam>({
  get() {
    const s = route.query.style
    if (s === 'dark' || s === 'mars') return s
    return ''
  },
  set(value: StyleParam) {
    router.replace({ query: value ? { style: value } : {} })
  },
})

const themeClass = computed(() => CLASS_MAP[styleParam.value])

watch(themeClass, (newClass, oldClass) => {
  if (!import.meta.client) return
  const root = document.documentElement
  if (oldClass) root.classList.remove(oldClass)
  if (newClass) root.classList.add(newClass)
}, { immediate: true })

onBeforeUnmount(() => {
  if (!import.meta.client) return
  if (themeClass.value) document.documentElement.classList.remove(themeClass.value)
})
</script>

<template>
  <main class="mars-page flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
    <h1 class="mars-page-title text-center font-bold tracking-tight">Mars Relocation Program — 2026</h1>
    <p class="mars-page-subtitle max-w-md text-center text-muted-foreground">Apply for a one-way ticket to humanity's red and dusty future. Applications close when Earth does.</p>

    <div class="flex flex-wrap items-center justify-center gap-3">
      <label class="flex items-center gap-2 text-sm">
        <span class="text-muted-foreground">Theme</span>
        <Select v-model="styleParam" class="w-44">
          <option v-for="t in THEMES" :key="t.value" :value="t.value">{{ t.label }}</option>
        </Select>
      </label>
      <Button variant="btn-primary" size="lg" @click="open = true">Begin application</Button>
    </div>

    <WizardDialog v-model:open="open" :steps="marsSteps" :step-registry="marsStepRegistry" fallback-title="Mars Relocation Application">
      <template #review="{ wizard: w }">
        <h3 class="text-lg font-semibold">Ready for launch?</h3>
        <p class="mt-2 text-sm text-muted-foreground">All required steps completed. There is no return flight.</p>
        <div class="mt-4 flex gap-2">
          <Button variant="btn-default" :disabled="w.isSubmitting.value" @click="w.back">Back</Button>
          <Button variant="btn-primary" :disabled="w.isSubmitting.value" @click="w.finalize">Launch</Button>
        </div>
      </template>

      <template #done="{ payload }">
        <h3 class="text-lg font-semibold">Application transmitted to Mars Control.</h3>
        <p class="mt-2 text-sm text-muted-foreground">Keep this confirmation for your records. There is no return flight.</p>
        <pre class="mt-4 overflow-auto rounded bg-muted p-3 text-xs">{{ JSON.stringify(payload, null, 2) }}</pre>
      </template>
    </WizardDialog>
  </main>
</template>

<style scoped lang="scss" src="./mars.scss"></style>
<style scoped lang="scss" src="./mars.theme-dark.scss"></style>
<style scoped lang="scss" src="./mars.theme-mars.scss"></style>
