import { getSections } from '@/app/services'
import { isRecord, optionalString, parseList } from '@/lib/validate'

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

function toContent(value: unknown): { content: string } | null {
  if (!isRecord(value) || typeof value.content !== 'string') return null
  return { content: value.content }
}

function toSection(value: unknown): Section | null {
  if (!isRecord(value)) return null

  const { id, title } = value
  if (typeof id !== 'string' || typeof title !== 'string') return null

  const header = optionalString(value.header)
  const subHeader = optionalString(value.subHeader)
  return {
    id,
    title,
    ...(header !== undefined && { header }),
    ...(subHeader !== undefined && { subHeader }),
    contents: parseList(value.contents, toContent, `contents of section ${id}`),
  }
}

/**
 * The endpoint groups sections by title, so the response is an object of
 * lists rather than a list. An error body is also an object, which is exactly
 * why the shape has to be checked instead of cast.
 */
export async function getResume(): Promise<Resume> {
  const sections = await getSections()
  if (!isRecord(sections)) {
    console.warn(`Expected grouped sections, got ${JSON.stringify(sections)}`)
    return {}
  }

  const resume: Resume = {}
  for (const [title, group] of Object.entries(sections)) {
    resume[title] = parseList(group, toSection, `sections titled "${title}"`)
  }
  return resume
}
