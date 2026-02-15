'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createJob(data: {
  title: string
  description: string
  skills: string[]
  experience: string
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') {
    throw new Error('Unauthorized')
  }

  const job = await prisma.job.create({
    data: {
      recruiterId: user.id,
      title: data.title,
      description: data.description,
      skills: data.skills,
      experience: data.experience,
    },
  })

  return job
}

export async function getRecruiterData() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') {
    return null
  }

  const jobs = await prisma.job.findMany({
    where: { recruiterId: user.id },
    include: {
      applications: {
        include: {
          student: {
            include: {
              studentProfile: true,
            },
          },
          interview: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get all applicants across all jobs
  const allApplications = await prisma.application.findMany({
    where: {
      job: {
        recruiterId: user.id,
      },
    },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      job: true,
      interview: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    jobs,
    applicants: allApplications,
  }
}
