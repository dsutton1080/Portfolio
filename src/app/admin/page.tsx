'use client'

import { SimpleLayout } from '@/components/SimpleLayout'
import { useState, useEffect } from 'react'
import {
  createSection,
  updateSection,
  deleteSection,
  getSectionHeaders,
  createProject,
  updateProject,
  deleteProject,
  getProjects
} from '../services'
import { Header } from '@/lib/resume'
import { ExperienceManager } from '@/components/admin/ExperienceManager'
import { CheckCircleIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface SuccessNotificationProps {
  message: string
  onClose: () => void
}

function SuccessNotification({ message, onClose }: SuccessNotificationProps) {
  return (
    <div role="status" className="fixed bottom-8 right-8 rounded-md bg-green-50 p-4 dark:bg-green-900">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-800"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ErrorNotificationProps {
  message: string
  onClose: () => void
}

function ErrorNotification({ message, onClose }: ErrorNotificationProps) {
  return (
    <div role="alert" className="fixed bottom-8 right-8 rounded-md bg-red-50 p-4 dark:bg-red-900">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminActions() {
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionOrder, setSectionOrder] = useState('')
  const [sectionHeader, setSectionHeader] = useState('')
  const [sectionSubHeader, setSectionSubHeader] = useState('')
  const [sectionContent1, setSectionContent1] = useState('')
  const [sectionContent2, setSectionContent2] = useState('')
  const [sectionContent3, setSectionContent3] = useState('')

  const [editingSectionId, setEditingSectionId] = useState('')
  const [editingSectionTitle, setEditingSectionTitle] = useState('')
  const [editingSectionOrder, setEditingSectionOrder] = useState('')
  const [editingSectionHeader, setEditingSectionHeader] = useState('')
  const [editingSectionSubHeader, setEditingSectionSubHeader] = useState('')
  const [editingSectionContent1, setEditingSectionContent1] = useState('')
  const [editingSectionContent2, setEditingSectionContent2] = useState('')
  const [editingSectionContent3, setEditingSectionContent3] = useState('')

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectLink, setProjectLink] = useState('')
  const [projectLabel, setProjectLabel] = useState('')
  const [projectOrder, setProjectOrder] = useState('')
  const [projectLogo, setProjectLogo] = useState('')

  const [headers, setHeaders] = useState<Header[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  // Add new state variables for editing experiences

  // Add new state variables for editing projects
  const [editingProjectId, setEditingProjectId] = useState('')
  const [editingProjectName, setEditingProjectName] = useState('')
  const [editingProjectDescription, setEditingProjectDescription] = useState('')
  const [editingProjectLink, setEditingProjectLink] = useState('')
  const [editingProjectLabel, setEditingProjectLabel] = useState('')
  const [editingProjectOrder, setEditingProjectOrder] = useState('')
  const [editingProjectLogo, setEditingProjectLogo] = useState('')
  const [projects, setProjects] = useState<any[]>([])

  // Add mode state variables

  const [showAddProjectForm, setShowAddProjectForm] = useState(false)
  const [showAddSectionForm, setShowAddSectionForm] = useState(false)

  const handleEditSection = (section: any) => {
    setShowAddSectionForm(false)
    clearAddSectionForm()
    fetch(`/api/sections/${section.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEditingSectionId(data.id)
        setEditingSectionTitle(data.title || '')
        setEditingSectionOrder(data.order || '')
        setEditingSectionHeader(data.header || '')
        setEditingSectionSubHeader(data.subHeader || '')
        setEditingSectionContent1(data.contents?.[0]?.content || '')
        setEditingSectionContent2(data.contents?.[1]?.content || '')
        setEditingSectionContent3(data.contents?.[2]?.content || '')
      })
      .catch((error) => {
        console.error('Error fetching section:', error)
      })
  }

  const handleSectionSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!sectionTitle || !sectionHeader) {
      setErrorMessage('Title and Header are required')
      return
    }

    let requestBody = {
      title: sectionTitle,
      order: parseInt(sectionOrder),
      header: sectionHeader,
      subHeader: sectionSubHeader,
      contents: {
        records: [
          { content: sectionContent1 },
          { content: sectionContent2 },
          { content: sectionContent3 },
        ],
      },
    }

    await createSection(requestBody)
      .then(() => {
        setSuccessMessage('Section added successfully')
        clearAddSectionForm()
        getSectionHeaders().then((response) => {
          setHeaders(response)
        })
      })
      .catch((error) => {
        setErrorMessage('Error adding section')
        console.error('Error:', error)
      })
  }

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!projectName || !projectDescription || !projectLink || !projectLabel) {
      setErrorMessage('All fields are required')
      return
    }

    let requestBody = {
      name: projectName,
      description: projectDescription,
      link: projectLink,
      label: projectLabel,
      order: parseInt(projectOrder),
      logo: projectLogo,
    }

    await createProject(requestBody)
      .then(() => {
        setSuccessMessage('Project added successfully')
        clearAddProjectForm()
      })
      .catch((error) => {
        setErrorMessage('Error adding project')
        console.error('Error:', error)
      })
  }

  const handleEditingSectionSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!editingSectionTitle || !editingSectionHeader) {
      setErrorMessage('Title and Header are required')
      return
    }

    let requestBody = {
      title: editingSectionTitle,
      order: parseInt(editingSectionOrder) || 0,
      header: editingSectionHeader,
      subHeader: editingSectionSubHeader,
      content1: editingSectionContent1,
      content2: editingSectionContent2,
      content3: editingSectionContent3
    }

    await updateSection(editingSectionId, requestBody)
      .then(() => {
        setSuccessMessage('Section updated successfully')
        clearEditingSection()
        getSectionHeaders().then((response) => {
          setHeaders(response)
        })
      })
      .catch((error) => {
        setErrorMessage('Error updating section')
        console.error('Error:', error)
      })
  }

  const clearEditingSection = () => {
    setEditingSectionId('')
    setEditingSectionTitle('')
    setEditingSectionOrder('')
    setEditingSectionHeader('')
    setEditingSectionSubHeader('')
    setEditingSectionContent1('')
    setEditingSectionContent2('')
    setEditingSectionContent3('')
  }

  const clearAddSectionForm = () => {
    setSectionTitle('')
    setSectionOrder('')
    setSectionHeader('')
    setSectionSubHeader('')
    setSectionContent1('')
    setSectionContent2('')
    setSectionContent3('')
  }

  const clearAddProjectForm = () => {
    setProjectName('')
    setProjectDescription('')
    setProjectLink('')
    setProjectLabel('')
    setProjectOrder('')
    setProjectLogo('')
  }

  // Add new handlers for editing projects
  const handleEditProject = (project: any) => {
    setShowAddProjectForm(false)
    clearAddProjectForm()
    setEditingProjectId(project.id)
    setEditingProjectName(project.name)
    setEditingProjectDescription(project.description)
    setEditingProjectLink(project.link)
    setEditingProjectLabel(project.label)
    setEditingProjectLogo(project.logo)
  }

  const handleEditingProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!editingProjectName || !editingProjectDescription || !editingProjectLink || !editingProjectLabel) {
      setErrorMessage('All fields are required')
      return
    }

    let requestBody = {
      name: editingProjectName,
      description: editingProjectDescription,
      link: editingProjectLink,
      label: editingProjectLabel,
      order: parseInt(editingProjectOrder) || 0,
      logo: editingProjectLogo,
    }

    await updateProject(editingProjectId, requestBody)
      .then(() => {
        setSuccessMessage('Project updated successfully')
        clearEditingProject()
        fetchProjects()
      })
      .catch((error) => {
        setErrorMessage('Error updating project')
        console.error('Error:', error)
      })
  }

  const clearEditingProject = () => {
    setEditingProjectId('')
    setEditingProjectName('')
    setEditingProjectDescription('')
    setEditingProjectLink('')
    setEditingProjectLabel('')
    setEditingProjectOrder('')
    setEditingProjectLogo('')
  }

  // Add fetch functions
  const fetchProjects = async () => {
    try {
      const response = await getProjects()
      setProjects(response)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchHeaders = async () => {
    try {
      const headersData = await getSectionHeaders()
      setHeaders(headersData)
    } catch (error) {
      setShowError(true)
      setErrorMessage('Failed to fetch section headers.')
    }
  }

  // Add useEffect to fetch data
  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    getSectionHeaders().then((response) => {
      setHeaders(response)
    })
  }, [])

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setSuccessMessage('')
        setShowSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      setShowError(true)
      const timer = setTimeout(() => {
        setErrorMessage('')
        setShowError(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id)
      await fetchProjects()
      clearEditingProject()
      setShowSuccess(true)
      setSuccessMessage('Project deleted successfully!')
    } catch (error) {
      setShowError(true)
      setErrorMessage('Failed to delete project.')
    }
  }

  const handleDeleteSection = async (id: string) => {
    try {
      await deleteSection(id)
      await fetchHeaders()
      clearEditingSection()
      setShowSuccess(true)
      setSuccessMessage('Section deleted successfully!')
    } catch (error) {
      setShowError(true)
      setErrorMessage('Failed to delete section.')
    }
  }

  return (
    <SimpleLayout title="Admin" intro="">
      <div className="space-y-8">
        <ExperienceManager
          onSuccess={setSuccessMessage}
          onError={setErrorMessage}
        />

        <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
          <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Project Management
          </h2>
          <div className="mt-6">
            <div>
              <div className="flex items-center justify-end px-3">
                <button
                  onClick={() => {
                    setShowAddProjectForm(true)
                    clearAddProjectForm()
                  }}
                  className="w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none"
                >
                  Create
                </button>
              </div>
              {projects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`flex items-center justify-between px-3 ${
                    index % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
                  }`}
                >
                  <span>{project.name}</span>
                  <button
                    onClick={() => handleEditProject(project)}
                    aria-label={`Edit ${project.name}`}
                    className="w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
            {(editingProjectId || showAddProjectForm) && (
              <form onSubmit={showAddProjectForm ? handleProjectSubmit : handleEditingProjectSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={showAddProjectForm ? projectName : editingProjectName}
                    onChange={(e) => showAddProjectForm ? setProjectName(e.target.value) : setEditingProjectName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={showAddProjectForm ? projectDescription : editingProjectDescription}
                    onChange={(e) => showAddProjectForm ? setProjectDescription(e.target.value) : setEditingProjectDescription(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Link
                  </label>
                  <input
                    type="text"
                    id="link"
                    value={showAddProjectForm ? projectLink : editingProjectLink}
                    onChange={(e) => showAddProjectForm ? setProjectLink(e.target.value) : setEditingProjectLink(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Label
                  </label>
                  <input
                    type="text"
                    id="label"
                    value={showAddProjectForm ? projectLabel : editingProjectLabel}
                    onChange={(e) => showAddProjectForm ? setProjectLabel(e.target.value) : setEditingProjectLabel(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    id="logo"
                    value={showAddProjectForm ? projectLogo : editingProjectLogo}
                    onChange={(e) => showAddProjectForm ? setProjectLogo(e.target.value) : setEditingProjectLogo(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div className="flex justify-between space-x-4">
                  {editingProjectId && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this project?')) {
                          await handleDeleteProject(editingProjectId)
                        }
                      }}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProjectForm(false)
                        clearAddProjectForm()
                        clearEditingProject()
                      }}
                      className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {showAddProjectForm ? 'Add Project' : 'Update Project'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Edit Section Section */}
        <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
          <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Section Management
          </h2>
          <div className="mt-6">
            <div>
              <div className="flex items-center px-3">
                <span className="flex-1"></span>
                <button
                  onClick={() => {
                    setShowAddSectionForm(true)
                    clearAddSectionForm()
                  }}
                  className="w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none"
                >
                  Create
                </button>
              </div>
              {headers && headers.map((header: any, index: number) => (
                <div
                  key={header.id}
                  className={`flex items-center px-3 ${
                    (index + 1) % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
                  }`}
                >
                  <span className="flex-1">{header.header}</span>
                  <button
                    onClick={() => handleEditSection(header)}
                    aria-label={`Edit ${header.header}`}
                    className="w-32 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-transparent border-none shadow-none"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
            {(editingSectionId || showAddSectionForm) && (
              <form onSubmit={showAddSectionForm ? handleSectionSubmit : handleEditingSectionSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="section-title" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Title
                  </label>
                  <input
                    type="text"
                    id="section-title"
                    value={showAddSectionForm ? sectionTitle : editingSectionTitle}
                    onChange={(e) => showAddSectionForm ? setSectionTitle(e.target.value) : setEditingSectionTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    value={showAddSectionForm ? sectionOrder : editingSectionOrder}
                    onChange={(e) => showAddSectionForm ? setSectionOrder(e.target.value) : setEditingSectionOrder(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="header" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Header
                  </label>
                  <input
                    type="text"
                    id="header"
                    value={showAddSectionForm ? sectionHeader : editingSectionHeader}
                    onChange={(e) => showAddSectionForm ? setSectionHeader(e.target.value) : setEditingSectionHeader(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="subHeader" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Sub Header
                  </label>
                  <input
                    type="text"
                    id="subHeader"
                    value={showAddSectionForm ? sectionSubHeader : editingSectionSubHeader}
                    onChange={(e) => showAddSectionForm ? setSectionSubHeader(e.target.value) : setEditingSectionSubHeader(e.target.value)}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="content1" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Content 1
                  </label>
                  <textarea
                    id="content1"
                    value={showAddSectionForm ? sectionContent1 : editingSectionContent1}
                    onChange={(e) => showAddSectionForm ? setSectionContent1(e.target.value) : setEditingSectionContent1(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="content2" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Content 2
                  </label>
                  <textarea
                    id="content2"
                    value={showAddSectionForm ? sectionContent2 : editingSectionContent2}
                    onChange={(e) => showAddSectionForm ? setSectionContent2(e.target.value) : setEditingSectionContent2(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="content3" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Content 3
                  </label>
                  <textarea
                    id="content3"
                    value={showAddSectionForm ? sectionContent3 : editingSectionContent3}
                    onChange={(e) => showAddSectionForm ? setSectionContent3(e.target.value) : setEditingSectionContent3(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                <div className="flex justify-between space-x-4">
                  {editingSectionId && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this section?')) {
                          await handleDeleteSection(editingSectionId)
                        }
                      }}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSectionForm(false)
                        clearAddSectionForm()
                        clearEditingSection()
                      }}
                      className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {showAddSectionForm ? 'Add Section' : 'Update Section'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Success and Error Notifications */}
        {showSuccess && <SuccessNotification message={successMessage} onClose={() => setShowSuccess(false)} />}
        {showError && <ErrorNotification message={errorMessage} onClose={() => setShowError(false)} />}
      </div>
    </SimpleLayout>
  )
}
