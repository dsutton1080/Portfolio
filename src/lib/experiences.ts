import { getExperiences } from '@/app/services'

export interface Experience {
  title: string
  content: string
  date: string
}

export async function getAllExperiences(): Promise<Experience[]> {
  let experiences = (await getExperiences()) as Experience[]
  return experiences
}
