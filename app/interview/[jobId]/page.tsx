'use client'

import { useEffect, useState } from 'react'
import InterviewAvatar from '@/components/interview/InterviewAvatar'
import { useParams } from 'next/navigation'

export default function InterviewPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const [loading, setLoading] = useState(true)
  const [interviewData, setInterviewData] = useState<any>(null)

  useEffect(() => {
    loadInterview()
  }, [jobId])

  async function loadInterview() {
    try {
      const response = await fetch(`/api/interview/start?jobId=${jobId}`)
      const data = await response.json()
      setInterviewData(data)
    } catch (error) {
      console.error('Error loading interview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Preparing your interview...</p>
        </div>
      </div>
    )
  }

  if (!interviewData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error loading interview. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <InterviewAvatar interviewData={interviewData} jobId={jobId} />
    </div>
  )
}
