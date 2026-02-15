import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInterviewQuestions } from '@/lib/ai/openai'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobId = req.nextUrl.searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile || !profile.parsedData) {
      return NextResponse.json({ error: 'Please upload your resume first' }, { status: 400 })
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if interview already exists
    const existingInterview = await prisma.interview.findFirst({
      where: {
        studentId: user.id,
        jobId,
      },
    })

    if (existingInterview) {
      return NextResponse.json({
        interviewId: existingInterview.id,
        questions: existingInterview.questions,
        answers: existingInterview.answers,
      })
    }

    // Generate interview questions
    const questionsData = await generateInterviewQuestions(
      profile.parsedData,
      job.description
    )

    const questions = [
      ...(questionsData.technical || []).map((q: string) => ({ type: 'technical', question: q })),
      ...(questionsData.behavioral || []).map((q: string) => ({ type: 'behavioral', question: q })),
    ]

    // Create interview record
    const interview = await prisma.interview.create({
      data: {
        studentId: user.id,
        jobId,
        questions: questions as any,
        answers: [] as any,
      },
    })

    // Link to application if exists
    const application = await prisma.application.findFirst({
      where: {
        studentId: user.id,
        jobId,
      },
    })

    if (application) {
      await prisma.interview.update({
        where: { id: interview.id },
        data: {
          applicationId: application.id,
        },
      })
    }

    return NextResponse.json({
      interviewId: interview.id,
      questions,
      answers: [],
    })
  } catch (error) {
    console.error('Error starting interview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
