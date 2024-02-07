'use client'
import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'
import { useState } from 'react'
import { addExperience, addSection } from '../services'

// export const metadata = {
//   title: 'Admin',
//   description: 'Forms to add new experiences and sections to the portfolio.',
// }

export default function AdminActions() {
  const [experienceTitle, setExperienceTitle] = useState('')
  const [experienceDate, setExperienceDate] = useState('')
  const [experienceContent, setExperienceContent] = useState('')
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionOrder, setSectionOrder] = useState('')
  const [sectionHeader, setSectionHeader] = useState('')
  const [sectionSubHeader, setSectionSubHeader] = useState('')
  const [sectionContent1, setSectionContent1] = useState('')
  const [sectionContent2, setSectionContent2] = useState('')
  const [sectionContent3, setSectionContent3] = useState('')

  const handleExperienceSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Experience submitted')

    // Check if experienceDate matches the format 'YYYY-MM-DD'
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(experienceDate)) {
      // Needs to be replaced with a banner message
      // Also need to make the form input display an error message
      console.log('Invalid date format')
      return
    }

    let requestBody = {
      title: experienceTitle,
      date: experienceDate,
      content: experienceContent,
    }

    await addExperience(requestBody)
      .then((response) => {
        console.log('Response:', response)
      })
      .catch((error) => {
        console.log('Error:', error)
      })

    console.log('Request body:', requestBody)
  }

  const handleSectionSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Section submitted') // Needs to be replaced with a banner message

    let requestBody = {
      title: sectionTitle,
      order: sectionOrder,
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

    await addSection(requestBody)
      .then((response) => {
        console.log('Response:', response)
      })
      .catch((error) => {
        console.log('Error:', error)
      })

    console.log('Request body:', requestBody)
  }

  return (
    <SimpleLayout title="" intro="">
      <div className="md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="space-y-10 divide-y divide-gray-900/10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Add Experience
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                This is a form to add a new experience to the portfolio.
              </p>
            </div>

            <form
              onSubmit={handleExperienceSubmit}
              className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 dark:bg-gray-800"
            >
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Title
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={experienceTitle}
                        onChange={(e) => setExperienceTitle(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Date
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="date"
                        id="date"
                        placeholder="YYYY-MM-DD"
                        value={experienceDate}
                        onChange={(e) => setExperienceDate(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    {' '}
                    {/* Updated */}
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Content
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <textarea
                        id="content"
                        name="content"
                        rows={2}
                        value={experienceContent}
                        onChange={(e) => setExperienceContent(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Add Section
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                This is a form to add a new section to the Resume.
              </p>
            </div>

            <form
              onSubmit={handleSectionSubmit}
              className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 dark:bg-gray-800 dark:ring-gray-700"
            >
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                    >
                      Title
                    </label>
                    <div className="mt-2">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          autoComplete="off"
                          value={sectionTitle}
                          onChange={(e) => setSectionTitle(e.target.value)}
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="order"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                    >
                      Order
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <input
                        type="text"
                        name="order"
                        id="order"
                        autoComplete="off"
                        value={sectionOrder}
                        onChange={(e) => setSectionOrder(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="header"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Header
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="header"
                        id="header"
                        value={sectionHeader}
                        onChange={(e) => setSectionHeader(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="subHeader"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Sub Header
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <input
                        type="text"
                        name="subHeader"
                        id="subHeader"
                        value={sectionSubHeader}
                        onChange={(e) => setSectionSubHeader(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    {' '}
                    {/* Content 1 */}
                    <label
                      htmlFor="content1"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Content 1
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <textarea
                        id="content1"
                        name="content1"
                        rows={2}
                        value={sectionContent1}
                        onChange={(e) => setSectionContent1(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    {' '}
                    {/* Content 2 */}
                    <label
                      htmlFor="content2"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Content 2
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <textarea
                        id="content2"
                        name="content2"
                        rows={2}
                        value={sectionContent2}
                        onChange={(e) => setSectionContent2(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    {' '}
                    {/* Content 3 */}
                    <label
                      htmlFor="content3"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Content 3
                    </label>
                    <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                      <textarea
                        id="content3"
                        name="content3"
                        rows={2}
                        value={sectionContent3}
                        onChange={(e) => setSectionContent3(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}
