import { getAllSections } from '@/app/services'

export interface Section {
  id: number
  title: string
  header?: string
  subHeader?: string
  contents: { content: string }[]
}

export interface Resume {
  [key: string]: Section[]
}

export async function getResume(): Promise<Resume> {
  let sections = (await getAllSections()) as Resume
  return sections
}
