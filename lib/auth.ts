import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        studentProfile: true,
        recruiterProfile: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
