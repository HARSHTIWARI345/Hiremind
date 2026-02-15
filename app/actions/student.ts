'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseResume, calculateMatchScore } from '@/lib/ai/openai'
import pdf from 'pdf-parse'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function uploadResume(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'STUDENT') {
    throw new Error('Unauthorized')
  }

  const file = formData.get('resume') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Save file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Parse PDF
  const pdfData = await pdf(buffer)
  const resumeText = pdfData.text

  // Parse resume with AI
  const parsedData = await parseResume(resumeText)

  // Save resume file
  const uploadDir = join(process.cwd(), 'public', 'resumes')
  await mkdir(uploadDir, { recursive: true })
  const filename = `${user.id}-${Date.now()}.pdf`
  const filepath = join(uploadDir, filename)
  await writeFile(filepath, buffer)

  // Update or create student profile
  const resumeUrl = `/resumes/${filename}`

  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      resumeUrl,
      skills: parsedData.skills || [],
      parsedData: parsedData as any,
    },
    create: {
      userId: user.id,
      resumeUrl,
      skills: parsedData.skills || [],
      parsedData: parsedData as any,
    },
  })

  return { success: true }
}

export async function getStudentData() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'STUDENT') {
    return null
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  })

  const applications = await prisma.application.findMany({
    where: { studentId: user.id },
    include: {
      job: {
        include: {
          recruiter: {
            include: {
              recruiterProfile: true,
            },
          },
        },
      },
      interview: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get all jobs for recommendations
  const allJobs = await prisma.job.findMany({
    include: {
      recruiter: {
        include: {
          recruiterProfile: true,
        },
      },
      applications: {
        where: { studentId: user.id },
      },
    },
  })

  // Calculate match scores and recommend
  const recommendedJobs = []
  if (profile?.parsedData) {
    for (const job of allJobs) {
      // Skip if already applied
      if (job.applications.length > 0) continue

      try {
        const matchData = await calculateMatchScore(
          profile.parsedData,
          job.description,
          job.skills
        )
        recommendedJobs.push({
          ...job,
          matchScore: matchData.matchScore || 0,
        })
      } catch (error) {
        console.error('Error calculating match score:', error)
      }
    }
  }

  // Sort by match score
  recommendedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  return {
    profile,
    applications,
    recommendedJobs: recommendedJobs.slice(0, 6),
  }
}
