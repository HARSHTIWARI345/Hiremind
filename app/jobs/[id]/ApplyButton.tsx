'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApplyButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApply() {
    setLoading(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      if (response.ok) {
        router.push(`/interview/${jobId}`)
      }
    } catch (error) {
      console.error('Error applying:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleApply} disabled={loading}>
      {loading ? 'Applying...' : 'Apply & Start Interview'}
    </Button>
  )
}
