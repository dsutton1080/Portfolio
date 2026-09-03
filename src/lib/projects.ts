import { getProjects } from '@/app/services'
import { isRecord, optionalNumber, optionalString, parseList } from '@/lib/validate'

export interface Project {
  name: string
  description: string
  link: string
  label: string
  order?: number
  logo?: string
}

function toProject(value: unknown): Project | null {
  if (!isRecord(value)) return null

  const { name, description, link, label } = value
  if (
    typeof name !== 'string' ||
    typeof description !== 'string' ||
    typeof link !== 'string' ||
    typeof label !== 'string'
  ) {
    return null
  }

  const order = optionalNumber(value.order)
  const logo = optionalString(value.logo)
  return {
    name,
    description,
    link,
    label,
    ...(order !== undefined && { order }),
    ...(logo !== undefined && { logo }),
  }
}

export async function getAllProjects(): Promise<Project[]> {
  return parseList(await getProjects(), toProject, 'projects')
}
