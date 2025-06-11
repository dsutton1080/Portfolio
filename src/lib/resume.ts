import { getSections } from '@/app/services'

export interface Content {
  id: string
  content: string
  order?: number
}

export interface Header {
  id: string
  header: string
}

export interface Section {
  id: string
  title: string
  header?: string
  subHeader?: string
  contents: { content: string }[]
}

export interface Resume {
  [key: string]: Section[]
}

export async function getResume(): Promise<Resume> {
  let sections = (await getSections()) as Resume
  return sections
}
