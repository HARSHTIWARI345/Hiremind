import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateMatchScore } from '@/lib/ai/openai'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await req.json()

    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile || !profile.resumeUrl) {
      return NextResponse.json({ error: 'Please upload your resume first' }, { status: 400 })
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Calculate AI match score
    let aiScore = null
    if (profile.parsedData) {
      try {
        const matchData = await calculateMatchScore(
          profile.parsedData,
          job.description,
          job.skills
        )
        aiScore = matchData.matchScore || null
      } catch (error) {
        console.error('Error calculating match score:', error)
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: user.id,
        aiScore,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await req.json()

    // Verify recruiter owns the job
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    })

    if (!application || application.job.recruiterId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
