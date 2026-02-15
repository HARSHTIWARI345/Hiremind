'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default function InterviewFeedbackPage() {
  const params = useParams()
  const interviewId = params.interviewId as string
  const [feedback, setFeedback] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedback()
  }, [interviewId])

  async function loadFeedback() {
    try {
      const response = await fetch(`/api/interview/feedback?interviewId=${interviewId}`)
      const data = await response.json()
      setFeedback(data)
    } catch (error) {
      console.error('Error loading feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Feedback not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Interview Feedback</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Overall Score</h3>
            <div className="flex items-center gap-4">
              <Progress value={feedback.score * 10} className="flex-1" />
              <span className="text-2xl font-bold">{feedback.score * 10}%</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Hireability Assessment</h3>
            <p className="text-lg">{feedback.hireability || 'Based on your performance, you show strong potential.'}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Strengths</h3>
            <ul className="list-disc list-inside space-y-1">
              {(feedback.strengths || []).map((strength: string, i: number) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Areas for Improvement</h3>
            <ul className="list-disc list-inside space-y-1">
              {(feedback.weakAreas || []).map((area: string, i: number) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Personalized Roadmap</h3>
            <p className="whitespace-pre-line">{feedback.roadmap || 'Continue practicing and building your skills.'}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => window.print()}>
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
