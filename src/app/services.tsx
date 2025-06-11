import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Section services
export const getSections = async () => {
  const response = await fetch(`${API_BASE_URL}/api/sections?path=all`)
  if (!response.ok) {
    throw new Error('Failed to fetch sections')
  }
  return response.json()
}

export const getSectionById = async (sectionId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/sections?id=${sectionId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch section')
  }
  return response.json()
}

export const getSectionCount = async () => {
  const response = await fetch(`${API_BASE_URL}/api/sections?path=count`)
  if (!response.ok) {
    throw new Error('Failed to fetch section count')
  }
  return response.json()
}

export const getSectionHeaders = async () => {
  const response = await fetch(`${API_BASE_URL}/api/sections?path=headers`)
  if (!response.ok) {
    throw new Error('Failed to fetch section headers')
  }
  return response.json()
}

export const createSection = async (section: any) => {
  const response = await fetch(`${API_BASE_URL}/api/sections`, {
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
  const response = await fetch(`${API_BASE_URL}/api/sections?id=${sectionId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/sections?id=${sectionId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete section')
  }
  return response.json()
}

// Project services
export const getProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/api/projects?path=all`)
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  return response.json()
}

export const getProjectById = async (projectId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/projects?id=${projectId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }
  return response.json()
}

export const createProject = async (project: any) => {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
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
  const response = await fetch(`${API_BASE_URL}/api/projects?id=${projectId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/projects?id=${projectId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete project')
  }
  return response.json()
}

// Experience services
export const getExperiences = async () => {
  const response = await fetch(`${API_BASE_URL}/api/experiences?path=all`)
  if (!response.ok) {
    throw new Error('Failed to fetch experiences')
  }
  return response.json()
}

export const getExperienceById = async (experienceId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/experiences?id=${experienceId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch experience')
  }
  return response.json()
}

export const createExperience = async (experience: any) => {
  const response = await fetch(`${API_BASE_URL}/api/experiences`, {
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
  const response = await fetch(`${API_BASE_URL}/api/experiences?id=${experienceId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/experiences?id=${experienceId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete experience')
  }
  return response.json()
}

// User services
export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users?path=all`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

export const getUserById = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/users?id=${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  return response.json()
}

export const signup = async (user: any) => {
  const response = await fetch(`${API_BASE_URL}/api/users?path=signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  if (!response.ok) {
    throw new Error('Failed to sign up')
  }
  return response.json()
}

export const login = async (credentials: any) => {
  const response = await fetch(`${API_BASE_URL}/api/users?path=login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  if (!response.ok) {
    throw new Error('Failed to log in')
  }
  return response.json()
}

export const updateUser = async (userId: string, user: any) => {
  const response = await fetch(`${API_BASE_URL}/api/users?id=${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  if (!response.ok) {
    throw new Error('Failed to update user')
  }
  return response.json()
}

export const changeUserRole = async (userId: string, role: any) => {
  const response = await fetch(`${API_BASE_URL}/api/users?id=${userId}&path=change-role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role),
  })
  if (!response.ok) {
    throw new Error('Failed to change user role')
  }
  return response.json()
}

// Content services
export const getContents = async () => {
  const response = await fetch(`${API_BASE_URL}/api/content?path=all`)
  if (!response.ok) {
    throw new Error('Failed to fetch contents')
  }
  return response.json()
}

export const getContentById = async (contentId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/content?id=${contentId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch content')
  }
  return response.json()
}

export const createContent = async (content: any) => {
  const response = await fetch(`${API_BASE_URL}/api/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })
  if (!response.ok) {
    throw new Error('Failed to create content')
  }
  return response.json()
}

export const updateContent = async (contentId: string, content: any) => {
  const response = await fetch(`${API_BASE_URL}/api/content?id=${contentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  })
  if (!response.ok) {
    throw new Error('Failed to update content')
  }
  return response.json()
}

export const deleteContent = async (contentId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/content?id=${contentId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete content')
  }
  return response.json()
}
