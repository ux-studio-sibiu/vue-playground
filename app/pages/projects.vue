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

<style scoped lang="scss">
.projects-page {
}

.project-item {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding-bottom: 5rem;
}

.project-info {
  font-size: 1.4rem;
  flex: 1;
}

.project-title {
  font-size: 1.5rem;
  color: #000;
}

.project-address {
  line-height: 2rem;
  color: #888;
  margin: 0;
}

.project-year {
  line-height: 2rem;
  color: #888;
  margin: 0;
}

.project-description {
  font-size: 0.95rem;
  color: #888;
  line-height: 1.4;
  margin: 0;
}

.project-image {
  width: 280px;
  height: 180px;
  object-fit: cover;
  flex-shrink: 0;
}
</style>
