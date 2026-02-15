'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, Briefcase, TrendingUp, FileText, Play } from 'lucide-react'
import Link from 'next/link'
import { uploadResume, getStudentData } from '@/app/actions/student'
import { useRouter } from 'next/navigation'

interface StudentDashboardProps {
  user: any
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [applications, setApplications] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const data = await getStudentData()
    if (data) {
      setResumeUploaded(!!data.profile?.resumeUrl)
      setApplications(data.applications || [])
      setJobs(data.recommendedJobs || [])
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('resume', file)

    try {
      await uploadResume(formData)
      await loadData()
    } catch (error) {
      console.error('Error uploading resume:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

      {/* Resume Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume
          </CardTitle>
          <CardDescription>
            Upload your resume to get AI-powered job recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resumeUploaded ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">Upload your resume (PDF)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button as="span">Upload Resume</Button>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Resume uploaded successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your profile has been parsed and updated
                </p>
              </div>
              <Button variant="outline" onClick={() => document.getElementById('resume-upload')?.click()}>
                Update Resume
              </Button>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-upload"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Jobs */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recommended Jobs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.recruiter?.recruiterProfile?.companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/jobs/${job.id}`} className="flex-1">
                    <Button className="w-full" variant="outline">View Details</Button>
                  </Link>
                  <Button
                    onClick={async () => {
                      const application = await fetch('/api/applications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jobId: job.id }),
                      })
                      if (application.ok) {
                        router.push(`/interview/${job.id}`)
                      }
                    }}
                  >
                    Start Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Applications</h2>
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{app.job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {app.job.recruiter?.recruiterProfile?.companyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </div>
                    {app.aiScore && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">AI Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={app.aiScore} className="w-24" />
                          <span className="text-sm font-semibold">{app.aiScore}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {app.interview && (
                  <div className="mt-4">
                    <Link href={`/interview/feedback/${app.interview.id}`}>
                      <Button variant="outline" size="sm">
                        View Interview Feedback
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
