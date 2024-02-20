import { getProjects } from '@/app/services'

export interface Project {
  title: string
  content: string
  repoLink: string
  repoLabel: string
  order?: number
  imageUrl?: string
}

export async function getAllProjects(): Promise<Project[]> {
  let projects = (await getProjects()) as Project[]
  return projects
}
