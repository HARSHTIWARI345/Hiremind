import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function RecruiterInterviewPage({ params }: { params: { interviewId: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'RECRUITER') {
    redirect('/')
  }

  const interview = await prisma.interview.findUnique({
    where: { id: params.interviewId },
    include: {
      student: {
        include: {
          studentProfile: true,
        },
      },
      application: {
        include: {
          job: true,
        },
      },
    },
  })

  if (!interview) {
    return <div>Interview not found</div>
  }

  // Verify recruiter owns the job
  if (interview.application?.job.recruiterId !== user.id) {
    return <div>Unauthorized</div>
  }

  const feedback = interview.feedback as any
  const answers = interview.answers as any[]
  const questions = interview.questions as any[]

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Interview Review - {interview.student.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Overall Score</h3>
            <div className="flex items-center gap-4">
              <Progress value={(interview.score || 0) * 10} className="flex-1" />
              <span className="text-2xl font-bold">{(interview.score || 0) * 10}%</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Question & Answer Review</h3>
            <div className="space-y-6">
              {questions.map((q: any, index: number) => {
                const answer = answers[index]
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {q.type?.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">{q.question}</h4>
                    {answer && (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">Answer:</p>
                        <p className="mb-3">{answer.answer}</p>
                        {answer.evaluation && (
                          <div className="bg-secondary p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">Score: {answer.evaluation.score}/10</span>
                              <span className="text-sm text-muted-foreground">
                                Confidence: {answer.evaluation.confidence || 'High'}
                              </span>
                            </div>
                            {answer.evaluation.strengths && (
                              <p className="text-sm mb-1">
                                <strong>Strengths:</strong> {answer.evaluation.strengths}
                              </p>
                            )}
                            {answer.evaluation.weaknesses && (
                              <p className="text-sm">
                                <strong>Areas to improve:</strong> {answer.evaluation.weaknesses}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {feedback && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">AI Feedback Summary</h3>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="mb-2">{feedback.hireability || 'Based on the interview performance...'}</p>
                {feedback.strengths && (
                  <div className="mb-2">
                    <strong>Strengths:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {(feedback.strengths || []).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.weakAreas && (
                  <div>
                    <strong>Areas for Improvement:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {(feedback.weakAreas || []).map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
