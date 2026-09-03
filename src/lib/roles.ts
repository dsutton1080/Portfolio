import { type ImageProps } from 'next/image'

import { getRoles } from '@/app/services'
import attLogo from '@/images/logos/attLogo.svg'
import omniFederalLogo from '@/images/logos/omniFederalLogo.png'
import { isRecord, optionalNumber, parseList } from '@/lib/validate'

/**
 * Logos ship with the repo because next/image only optimises statically
 * imported files, so a role stores a key here rather than a path or a URL. An
 * unknown key is not an error: the card falls back to the company initial.
 */
export const ROLE_LOGOS: Record<string, ImageProps['src']> = {
  att: attLogo,
  'omni-federal': omniFederalLogo,
}

export interface RoleDate {
  label: string
  dateTime: string
}

export interface Role {
  id: string
  company: string
  title: string
  logo?: ImageProps['src']
  start: RoleDate
  end: RoleDate
  order?: number
}

/**
 * "Present" has no year of its own, but the <time> element still needs a
 * machine-readable one - so it resolves to the current year, as the
 * hard-coded work history did.
 */
function toRoleDate(value: string): RoleDate {
  const label = value.trim()
  return {
    label,
    dateTime: /^present$/i.test(label)
      ? new Date().getFullYear().toString()
      : label,
  }
}

function toRole(value: unknown): Role | null {
  if (!isRecord(value)) return null

  const { id, company, title, start, end } = value
  if (
    typeof id !== 'string' ||
    typeof company !== 'string' ||
    typeof title !== 'string' ||
    typeof start !== 'string' ||
    typeof end !== 'string'
  ) {
    return null
  }

  const logo = typeof value.logo === 'string' ? ROLE_LOGOS[value.logo] : undefined
  const order = optionalNumber(value.order)
  return {
    id,
    company,
    title,
    ...(logo !== undefined && { logo }),
    start: toRoleDate(start),
    end: toRoleDate(end),
    ...(order !== undefined && { order }),
  }
}

export async function getAllRoles(): Promise<Role[]> {
  return parseList(await getRoles(), toRole, 'roles')
}
