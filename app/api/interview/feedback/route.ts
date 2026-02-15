import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interviewId = req.nextUrl.searchParams.get('interviewId')
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID required' }, { status: 400 })
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Verify access
    if (user.role === 'STUDENT' && interview.studentId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role === 'RECRUITER') {
      const application = await prisma.application.findFirst({
        where: {
          interview: {
            id: interviewId,
          },
          job: {
            recruiterId: user.id,
          },
        },
        include: {
          job: true,
        },
      })

      if (!application) {
        // Try alternative query
        const interviewWithApp = await prisma.interview.findUnique({
          where: { id: interviewId },
          include: {
            application: {
              include: {
                job: true,
              },
            },
          },
        })

        if (!interviewWithApp?.application || interviewWithApp.application.job.recruiterId !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
      }
    }

    const feedback = interview.feedback as any
    const score = interview.score || 0

    return NextResponse.json({
      ...feedback,
      score,
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
