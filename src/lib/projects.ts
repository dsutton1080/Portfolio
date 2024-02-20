import { getProjects } from '@/app/services'

export interface Project {
  name: string
  description: string
  link: string
  label: string
  order?: number
  logo?: string
}

export async function getAllProjects(): Promise<Project[]> {
  let projects = (await getProjects()) as Project[]
  return projects
}
