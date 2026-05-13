<script setup lang="ts">
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

const { data: projects } = await useFetch('/api/projects')
</script>

<template>
  <div>
    <h1>Projects</h1>
    <ul>
      <li v-for="project in projects" :key="project.name">

        <Dialog>
          <DialogTrigger as-child><Button variant="link">{{ project.name }}</Button></DialogTrigger>
          
          <DialogContent>

            <DialogHeader>
              <DialogTitle>{{ project.name }}</DialogTitle>
              <DialogDescription>{{ project.description }}</DialogDescription>
            </DialogHeader>

            <DialogFooter><DialogClose as-child><Button variant="outline">Close</Button></DialogClose></DialogFooter>
          </DialogContent>

        </Dialog>

      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss" src="./projects.scss"></style>
