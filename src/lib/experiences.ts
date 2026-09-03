import { getExperiences } from '@/app/services'
import { isRecord, parseList } from '@/lib/validate'

export interface Experience {
  title: string
  content: string
  date: string
}

function toExperience(value: unknown): Experience | null {
  if (!isRecord(value)) return null

  const { title, content, date } = value
  if (
    typeof title !== 'string' ||
    typeof content !== 'string' ||
    typeof date !== 'string'
  ) {
    return null
  }

  return { title, content, date }
}

export async function getAllExperiences(): Promise<Experience[]> {
  return parseList(await getExperiences(), toExperience, 'experiences')
}
