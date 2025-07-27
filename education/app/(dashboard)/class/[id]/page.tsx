'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function ClassPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [classInfo, setClassInfo] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      } else {
        fetchClassInfo(session.user.id)
        fetchAnnouncements()
        fetchAssignments()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const fetchClassInfo = async (userId: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*, teacher:users(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching class info:', error)
    } else {
      setClassInfo(data)
    }
  }

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('class_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching announcements:', error)
    } else {
      setAnnouncements(data)
    }
  }

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
    } else {
      setAssignments(data)
    }
  }

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('')
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('')
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('')

  const handleCreateAssignment = async () => {
    if (!newAssignmentTitle || !session) return
    const { data, error } = await supabase
      .from('assignments')
      .insert([{ 
        class_id: params.id, 
        title: newAssignmentTitle, 
        description: newAssignmentDescription, 
        due_date: newAssignmentDueDate 
      }])
    if (error) {
      console.error('Error creating assignment:', error)
    } else {
      fetchAssignments()
      setNewAssignmentTitle('')
      setNewAssignmentDescription('')
      setNewAssignmentDueDate('')
    }
  }

  if (!session || !classInfo) {
    return null
  }

  const isTeacher = session.user.id === classInfo.teacher_id


  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSubmissionFile(e.target.files[0])
    }
  }

  const handleSubmission = async () => {
    if (!submissionFile || !selectedAssignment || !session) return

    const fileExt = submissionFile.name.split('.').pop()
    const fileName = `${session.user.id}-${selectedAssignment.id}.${fileExt}`
    const filePath = `${params.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, submissionFile)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return
    }

    const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('submissions').insert([
      {
        assignment_id: selectedAssignment.id,
        student_id: session.user.id,
        file_url: urlData.publicUrl,
      },
    ])

    if (dbError) {
      console.error('Error creating submission:', dbError)
    } else {
      setSelectedAssignment(null)
      setSubmissionFile(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{classInfo.name}</h1>
          <p>{classInfo.description}</p>
          <p className="text-sm text-gray-500">Teacher: {classInfo.teacher.name}</p>
          <p className="text-sm text-gray-500">Join Code: {classInfo.join_code}</p>
        </div>
        <button onClick={() => router.push('/')} className="bg-gray-500 text-white px-4 py-2 rounded">
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Announcements</h2>
          {isTeacher && (
            <div className="mb-4">
              <textarea
                placeholder="Post an announcement"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <button onClick={handlePostAnnouncement} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                Post
              </button>
            </div>
          )}
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="border p-4 rounded">
                <p>{ann.content}</p>
                <p className="text-sm text-gray-500">{new Date(ann.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Assignments</h2>
          {isTeacher && (
            <div className="mb-4 border p-4 rounded">
                <h3 className="text-lg font-bold mb-2">Create Assignment</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Description"
                  value={newAssignmentDescription}
                  onChange={(e) => setNewAssignmentDescription(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="datetime-local"
                  value={newAssignmentDueDate}
                  onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                />
                <button onClick={handleCreateAssignment} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Create Assignment
                </button>
              </div>
          )}
          <div className="space-y-4">
            {assignments.map((assign) => (
              <div key={assign.id} className="border p-4 rounded">
                <h3 className="text-lg font-bold">{assign.title}</h3>
                <p>{assign.description}</p>
                <p className="text-sm text-gray-500">Due: {new Date(assign.due_date).toLocaleString()}</p>
                {!isTeacher && (
                  <button onClick={() => setSelectedAssignment(assign)} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
                    Submit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>
            <h3 className="text-lg font-bold">{selectedAssignment.title}</h3>
            <p>{selectedAssignment.description}</p>
            <input type="file" onChange={handleFileChange} className="my-4" />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setSelectedAssignment(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleSubmission} className="bg-green-500 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
