<script setup lang="ts">
const { data: projects } = await useFetch('/api/projects')
const duplicatedProjects = computed(() => projects.value ? [...projects.value, ...projects.value] : [])
</script>

<template>
  <div class="projects-page">
    <div v-for="(project, i) in duplicatedProjects" :key="i" class="project-item">
      <div class="project-info">
        <h2 class="project-title">{{ project.title }}</h2>
        <p v-if="project.address" class="project-address">{{ project.address }}</p>
        <p v-if="project.year" class="project-year">{{ project.year }}</p>
      </div>
      <img v-if="project.mainImage" :src="project.mainImage" :alt="project.title" class="project-image" />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./projects.scss"></style>
