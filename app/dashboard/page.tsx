import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import RecruiterDashboard from '@/components/dashboard/RecruiterDashboard'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  if (user.role === 'STUDENT') {
    return <StudentDashboard user={user} />
  }

  if (user.role === 'RECRUITER') {
    return <RecruiterDashboard user={user} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Please set your role in settings</h1>
    </div>
  )
}
