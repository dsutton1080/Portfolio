// Helper function to get the base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return ''
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    // Reference for custom domain
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Assume localhost
  return `http://localhost:${process.env.PORT || 3200}`
}

// Helper function to create API URL
const createApiUrl = (path: string) => {
  return `${getBaseUrl()}${path}`
}

// Section services
export const getSections = async () => {
  const response = await fetch(createApiUrl(`/api/sections?path=all`))
  if (!response.ok) {
    throw new Error('Failed to fetch sections')
  }
  return response.json()
}

export const getSectionById = async (sectionId: string) => {
  const response = await fetch(createApiUrl(`/api/sections?id=${sectionId}`))
  if (!response.ok) {
    throw new Error('Failed to fetch section')
  }
  return response.json()
}

export const getSectionCount = async () => {
  const response = await fetch(createApiUrl(`/api/sections?path=count`))
  if (!response.ok) {
    throw new Error('Failed to fetch section count')
  }
  return response.json()
}

export const getSectionHeaders = async () => {
  const response = await fetch(createApiUrl(`/api/sections?path=headers`))
  if (!response.ok) {
    throw new Error('Failed to fetch section headers')
  }
  return response.json()
}

export const createSection = async (section: any) => {
  const response = await fetch(createApiUrl(`/api/sections`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(section),
  })
  if (!response.ok) {
    throw new Error('Failed to create section')
  }
  return response.json()
}

export const updateSection = async (sectionId: string, section: any) => {
  // Uses the /api/sections/[id] handler rather than the ?id= one. The latter
  // upserts contents with `existingSection.contents[n]?.id || 'new'`, and
  // 'new' is not a valid ObjectId - so any section with fewer than three
  // content rows fails to save.
  const response = await fetch(createApiUrl(`/api/sections/${sectionId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(section),
  })
  if (!response.ok) {
    throw new Error('Failed to update section')
  }
  return response.json()
}

export const deleteSection = async (sectionId: string) => {
  const response = await fetch(createApiUrl(`/api/sections?id=${sectionId}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete section')
  }
  return response.json()
}

// Project services
export const getProjects = async () => {
  const response = await fetch(createApiUrl(`/api/projects?path=all`))
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  return response.json()
}

export const getProjectById = async (projectId: string) => {
  const response = await fetch(createApiUrl(`/api/projects?id=${projectId}`))
  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }
  return response.json()
}

export const createProject = async (project: any) => {
  const response = await fetch(createApiUrl(`/api/projects`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  })
  if (!response.ok) {
    throw new Error('Failed to create project')
  }
  return response.json()
}

export const updateProject = async (projectId: string, project: any) => {
  const response = await fetch(createApiUrl(`/api/projects?id=${projectId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  })
  if (!response.ok) {
    throw new Error('Failed to update project')
  }
  return response.json()
}

export const deleteProject = async (projectId: string) => {
  const response = await fetch(createApiUrl(`/api/projects?id=${projectId}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete project')
  }
  return response.json()
}

// Experience services
export const getExperiences = async () => {
  const response = await fetch(createApiUrl(`/api/experiences?path=all`))
  if (!response.ok) {
    throw new Error('Failed to fetch experiences')
  }
  return response.json()
}

export const getExperienceById = async (experienceId: string) => {
  const response = await fetch(createApiUrl(`/api/experiences?id=${experienceId}`))
  if (!response.ok) {
    throw new Error('Failed to fetch experience')
  }
  return response.json()
}

export const createExperience = async (experience: any) => {
  const response = await fetch(createApiUrl(`/api/experiences`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(experience),
  })
  if (!response.ok) {
    throw new Error('Failed to create experience')
  }
  return response.json()
}

export const updateExperience = async (experienceId: string, experience: any) => {
  const response = await fetch(createApiUrl(`/api/experiences?id=${experienceId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(experience),
  })
  if (!response.ok) {
    throw new Error('Failed to update experience')
  }
  return response.json()
}

export const deleteExperience = async (experienceId: string) => {
  const response = await fetch(createApiUrl(`/api/experiences?id=${experienceId}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete experience')
  }
  return response.json()
}

// Role services (the work history on the home page)
export const getRoles = async () => {
  const response = await fetch(createApiUrl(`/api/roles?path=all`))
  if (!response.ok) {
    throw new Error('Failed to fetch roles')
  }
  return response.json()
}

export const getRoleById = async (roleId: string) => {
  const response = await fetch(createApiUrl(`/api/roles?id=${roleId}`))
  if (!response.ok) {
    throw new Error('Failed to fetch role')
  }
  return response.json()
}

export const createRole = async (role: any) => {
  const response = await fetch(createApiUrl(`/api/roles`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role),
  })
  if (!response.ok) {
    throw new Error('Failed to create role')
  }
  return response.json()
}

export const updateRole = async (roleId: string, role: any) => {
  const response = await fetch(createApiUrl(`/api/roles?id=${roleId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role),
  })
  if (!response.ok) {
    throw new Error('Failed to update role')
  }
  return response.json()
}

export const deleteRole = async (roleId: string) => {
  const response = await fetch(createApiUrl(`/api/roles?id=${roleId}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete role')
  }
  return response.json()
}

// Auth services
//
// Only sign-in and sign-out. The user list, lookup, update and role-change
// wrappers that used to live here called handlers with no authorisation on
// them, and nothing in the UI called the wrappers - see the note at the top of
// src/app/api/users/route.ts. The content wrappers went the same way: contents
// are written through /api/sections/[id], and /api/content was an unguarded
// second way into the same rows that no component used.

// The auth endpoints return a JSON body of the form `{ error: string }` on
// failure. Surface that instead of collapsing every failure into one generic
// string, so callers can show the user why the request actually failed.
async function errorFromResponse(response: Response, fallback: string) {
  try {
    const body = await response.json()
    if (body && typeof body.error === 'string') return new Error(body.error)
  } catch {
    // Body was not JSON; fall through to the generic message.
  }
  return new Error(fallback)
}

export const login = async (credentials: any) => {
  const response = await fetch(createApiUrl(`/api/users?path=login`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  if (!response.ok) {
    throw await errorFromResponse(response, 'Failed to log in')
  }
  return response.json()
}

/**
 * Clearing the localStorage copy is not a logout - the session lives in an
 * httpOnly cookie that only the server can remove, so this call is what
 * actually ends it.
 */
export const logout = async () => {
  const response = await fetch(createApiUrl(`/api/users?path=logout`), {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to log out')
  }
  return response.json()
}
