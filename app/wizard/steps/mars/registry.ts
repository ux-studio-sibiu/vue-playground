import { defineAsyncComponent, type Component } from 'vue'

export const marsStepRegistry: Record<string, Component> = {
  'step-1-identity': defineAsyncComponent(() => import('./step-1-identity.vue')),
  'step-2-blood-type': defineAsyncComponent(() => import('./step-2-blood-type.vue')),
  'step-3-dependents': defineAsyncComponent(() => import('./step-3-dependents.vue')),
  'step-4-family-details': defineAsyncComponent(() => import('./step-4-family-details.vue')),
  'step-5-skills': defineAsyncComponent(() => import('./step-5-skills.vue')),
  'step-6-escape-velocity': defineAsyncComponent(() => import('./step-6-escape-velocity.vue')),
  'step-7-review': defineAsyncComponent(() => import('./step-7-review.vue')),
}
