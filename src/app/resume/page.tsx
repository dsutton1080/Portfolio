import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type Section, getResume } from '@/lib/resume'

// Add dynamic rendering configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

function Section({ section }: { section: Section }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title>{section.header}</Card.Title>
        <Card.Subtitle>{section.subHeader}</Card.Subtitle>
        {section.contents.map((content, index) => (
          <Card.Description key={index}>{content.content}</Card.Description>
        ))}
      </Card>
      <Card.Eyebrow className="mt-1 hidden md:block">
        {section.title}
      </Card.Eyebrow>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Resume',
  description: '',
}

export default async function ResumeList() {
  let resume = await getResume()
  return (
    <SimpleLayout title="Resume" intro="">
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {resume &&
            Object.values(resume)
              .flat()
              .map((section, index) => (
                <Section key={index} section={section} />
              ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
