import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ApplyButton from './ApplyButton'

export default async function JobPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/')
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      recruiter: {
        include: {
          recruiterProfile: true,
        },
      },
      applications: user.role === 'STUDENT' ? {
        where: { studentId: user.id },
      } : undefined,
    },
  })

  if (!job) {
    return <div>Job not found</div>
  }

  const hasApplied = user.role === 'STUDENT' && job.applications && job.applications.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{job.title}</CardTitle>
          <CardDescription>
            {job.recruiter.recruiterProfile?.companyName || 'Company'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Job Description</h3>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="bg-secondary px-3 py-1 rounded-md text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Experience Level</h3>
            <p>{job.experience}</p>
          </div>

          {user.role === 'STUDENT' && (
            <div className="flex gap-4">
              {hasApplied ? (
                <Button disabled>Already Applied</Button>
              ) : (
                <ApplyButton jobId={job.id} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
