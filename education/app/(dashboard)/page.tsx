'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      } else {
        fetchClasses(session.user.id)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const fetchClasses = async (userId: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:users(*)
      `)
      .or(`teacher_id.eq.${userId},enrollments.student_id.eq.${userId}`)

    if (error) {
      console.error('Error fetching classes:', error)
    } else {
      setClasses(data)
    }
  }

  if (!session) {
    return null
  }

  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setJoinModalOpen] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const handleCreateClass = async () => {
    if (!newClassName || !session) return
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data, error } = await supabase
      .from('classes')
      .insert([{ name: newClassName, description: newClassDescription, teacher_id: session.user.id, join_code: joinCode }])
    if (error) {
      console.error('Error creating class:', error)
    } else {
      fetchClasses(session.user.id)
      setCreateModalOpen(false)
      setNewClassName('')
      setNewClassDescription('')
    }
  }

  const handleJoinClass = async () => {
    if (!joinCode || !session) return
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('join_code', joinCode)
      .single()

    if (classError || !classData) {
      console.error('Error finding class:', classError)
      return
    }

    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert([{ class_id: classData.id, student_id: session.user.id }])

    if (enrollmentError) {
      console.error('Error joining class:', enrollmentError)
    } else {
      fetchClasses(session.user.id)
      setJoinModalOpen(false)
      setJoinCode('')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Classes</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => setCreateModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Class
          </button>
          <button onClick={() => setJoinModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded">
            Join Class
          </button>
          <button onClick={() => supabase.auth.signOut()} className="bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="border p-4 rounded">
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p>{c.description}</p>
            <p className="text-sm text-gray-500">Teacher: {c.teacher.name}</p>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Create Class</h2>
            <input
              type="text"
              placeholder="Class Name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
            <textarea
              placeholder="Class Description"
              value={newClassDescription}
              onChange={(e) => setNewClassDescription(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setCreateModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleCreateClass} className="bg-blue-500 text-white px-4 py-2 rounded">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Join Class</h2>
            <input
              type="text"
              placeholder="Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setJoinModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleJoinClass} className="bg-green-500 text-white px-4 py-2 rounded">
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
