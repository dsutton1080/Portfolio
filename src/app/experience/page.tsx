import { type Metadata } from 'next'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type Experience, getAllExperiences } from '@/lib/experiences'
import { formatDate } from '@/lib/formatDate'

// Add dynamic rendering configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

function Experience({ experience }: { experience: Experience }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title>{experience.title}</Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={experience.date}
          className="md:hidden"
          decorate
        >
          {formatDate(experience.date)}
        </Card.Eyebrow>
        <Card.Description>{experience.content}</Card.Description>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={experience.date}
        className="mt-1 hidden md:block"
      >
        {formatDate(experience.date)}
      </Card.Eyebrow>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Experience',
  description: '',
}

export default async function ExperienceList() {
  let experiences = await getAllExperiences()

  return (
    <SimpleLayout
      title="Work Experience"
      intro="A log of all my work experience and the things I learned while working through different tasks."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {experiences &&
            experiences.map((experience) => (
              <Experience key={experience.title} experience={experience} />
            ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
