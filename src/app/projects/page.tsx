import { Metadata } from 'next'
import Image from 'next/image'
import { SimpleLayout } from '@/components/SimpleLayout'
import { getAllProjects } from '@/lib/projects'
import { Card } from '@/components/Card'

function LinkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.475 1.768-1.768a.75.75 0 0 0-1.06-1.06l-1.768 1.767a.75.75 0 0 0 1.06 1.06Zm-1.414 4.95 1.768 1.768a.75.75 0 0 0 1.06-1.06l-1.768-1.768a.75.75 0 0 0-1.06 1.06Zm-1.414 1.414.884.884 1.06-1.06-.883-.885-1.061 1.06Zm1.414-1.414.884.884 1.06-1.06-.883-.885-1.061 1.06Zm1.414-1.414.884.884 1.06-1.06-.883-.885-1.061 1.06Zm-8.486-.884 1.768 1.768a.75.75 0 0 0 1.06-1.06l-1.768-1.768a.75.75 0 0 0-1.06 1.06Zm8.486-.884 1.768 1.768a.75.75 0 0 0 1.06-1.06l-1.768-1.768a.75.75 0 0 0-1.06 1.06Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Projects',
  description: "Things I've made trying to put my mark on the world.",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectGallery() {
  let projects = await getAllProjects()
  return (
    <SimpleLayout
      title="Things I've made trying to put my mark on the world."
      intro="I've worked on many different projects over the years but these are the ones that I'm most proud of. Each one has taught me something new and has helped me grow as a developer."
    >
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <Card
            as="li"
            key={project.name}
            className="flex flex-col justify-between"
          >
            <div>
              {project.logo && (
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                  <Image
                    src={project.logo}
                    alt=""
                    className="h-8 w-8"
                    unoptimized
                  />
                </div>
              )}
              <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                <Card.Link href={project.link}>{project.name}</Card.Link>
              </h2>
              <Card.Description>{project.description}</Card.Description>
            </div>
            {project.label && (
              <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200">
                <LinkIcon className="h-6 w-6 flex-none" />
                <span className="ml-2">{project.label}</span>
              </p>
            )}
          </Card>
        ))}
      </ul>
    </SimpleLayout>
  )
}
