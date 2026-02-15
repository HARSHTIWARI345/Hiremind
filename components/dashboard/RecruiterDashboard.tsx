'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Briefcase, Users, TrendingUp, Plus } from 'lucide-react'
import { createJob, getRecruiterData } from '@/app/actions/recruiter'

interface RecruiterDashboardProps {
  user: any
}

export default function RecruiterDashboard({ user }: RecruiterDashboardProps) {
  const [jobs, setJobs] = useState<any[]>([])
  const [applicants, setApplicants] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    experience: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const data = await getRecruiterData()
    if (data) {
      setJobs(data.jobs || [])
      setApplicants(data.applicants || [])
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createJob({
        title: formData.title,
        description: formData.description,
        skills: formData.skills.split(',').map(s => s.trim()),
        experience: formData.experience,
      })
      setIsDialogOpen(false)
      setFormData({ title: '', description: '', skills: '', experience: '' })
      await loadData()
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post New Job</DialogTitle>
              <DialogDescription>
                Create a new job posting to attract candidates
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, TypeScript"
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="0-2 years, 2-5 years, etc."
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Job</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicants.filter(a => a.status === 'SHORTLISTED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">My Job Postings</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.description.substring(0, 100)}...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill: string) => (
                    <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Applications: {job.applications?.length || 0}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Applicants */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Applicants</h2>
        <div className="space-y-4">
          {applicants.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{app.student.name}</h3>
                    <p className="text-sm text-muted-foreground">{app.job.title}</p>
                    <p className="text-sm text-muted-foreground">{app.student.email}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm mb-2 ${
                      app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </div>
                    {app.aiScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">AI Score: {app.aiScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {app.interview && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/recruiter/interview/${app.interview.id}`}
                    >
                      View Interview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await fetch('/api/applications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: app.id, status: 'SHORTLISTED' }),
                        })
                        await loadData()
                      }}
                    >
                      Shortlist
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await fetch('/api/applications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: app.id, status: 'REJECTED' }),
                        })
                        await loadData()
                      }}
                    >
                      Reject
                    </Button>
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
