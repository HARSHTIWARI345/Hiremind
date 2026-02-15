import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { evaluateAnswer, generateFinalFeedback } from '@/lib/ai/openai'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { interviewId, questionIndex, answer } = await req.json()

    // Get interview
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        job: true,
      },
    })

    if (!interview || interview.studentId !== user.id) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    const questions = interview.questions as any[]
    const answers = (interview.answers as any[]) || []

    if (questionIndex >= questions.length) {
      return NextResponse.json({ error: 'Invalid question index' }, { status: 400 })
    }

    const question = questions[questionIndex]

    // Get student profile for context
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    })

    // Evaluate answer
    const evaluation = await evaluateAnswer(question.question, answer, {
      resumeData: profile?.parsedData || {},
      jobDescription: interview.job.description,
    })

    // Update answers array
    answers[questionIndex] = {
      question: question.question,
      answer,
      evaluation,
    }

    // Update interview
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        answers: answers as any,
      },
    })

    // If all questions answered, generate final feedback
    if (answers.length === questions.length) {
      const feedback = await generateFinalFeedback({
        questions,
        answers,
      })

      const overallScore = answers.reduce((sum: number, a: any) => {
        return sum + (a.evaluation?.score || 0)
      }, 0) / answers.length

      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          feedback: feedback as any,
          score: overallScore,
        },
      })

      // Update application AI score if exists
      const application = await prisma.application.findFirst({
        where: {
          studentId: user.id,
          jobId: interview.jobId,
        },
      })

      if (application) {
        await prisma.application.update({
          where: { id: application.id },
          data: {
            aiScore: overallScore * 10, // Convert to percentage
          },
        })
      }
    }

    return NextResponse.json({ evaluation })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
