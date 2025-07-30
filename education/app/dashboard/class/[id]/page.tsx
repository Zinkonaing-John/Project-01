'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClassPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [classInfo, setClassInfo] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [newMaterialLink, setNewMaterialLink] = useState('')
  const [newMaterialFile, setNewMaterialFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      } else {
        fetchPageData(session.user.id)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, session])

  const fetchPageData = async (userId: string) => {
    setLoading(true)
    const classData = await fetchClassInfo(userId)
    if (classData) {
      const isCurrentUserTeacher = userId === classData.teacher_id
      await Promise.all([
        fetchAnnouncements(),
        fetchAssignments(isCurrentUserTeacher),
        fetchMaterials(),
      ])
    }
    setLoading(false)
  }

  const fetchClassInfo = async (userId: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*, teacher:users(*)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching class info:', error)
      return null
    } else {
      setClassInfo(data)
      return data
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

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching materials:', error)
    } else {
      setMaterials(data)
    }
  }

  const fetchAssignments = async (isCurrentUserTeacher: boolean) => {
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', params.id)
      .order('created_at', { ascending: false })

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return
    }

    if (!session || isCurrentUserTeacher) {
      setAssignments(assignmentsData)
      return
    }

    // For students, fetch their submissions for each assignment
    const assignmentsWithSubmissions = await Promise.all(
      assignmentsData.map(async (assignment) => {
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('file_url, submitted_at, feedback')
          .eq('assignment_id', assignment.id)
          .eq('student_id', session.user.id)
          .single()

        if (submissionError && submissionError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching submission:', submissionError)
        }

        return { ...assignment, submission: submissionData }
      })
    )
    setAssignments(assignmentsWithSubmissions)
  }

  } else {
      fetchAnnouncements()
      setNewAnnouncement('')
    }
  }

  const handleMaterialUpload = async () => {
    if (!newMaterialLink && !newMaterialFile) return

    let fileUrl = newMaterialLink

    if (newMaterialFile) {
      const fileExt = newMaterialFile.name.split('.').pop()
      const fileName = `${Date.now()}-${newMaterialFile.name}`
      const filePath = `${params.id}/materials/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, newMaterialFile)

      if (uploadError) {
        console.error('Error uploading material file:', uploadError)
        return
      }
      const { data: urlData } = supabase.storage.from('materials').getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
    }

    const { error: dbError } = await supabase
      .from('materials')
      .insert([{ class_id: params.id, url: fileUrl, type: newMaterialFile ? newMaterialFile.type : 'link' }])

    if (dbError) {
      console.error('Error saving material:', dbError)
    } else {
      // Optionally fetch materials here if you want to display them immediately
      setNewMaterialLink('')
      setNewMaterialFile(null)
    }
  }

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('')
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('')
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('')
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    if (selectedAssignmentForSubmissions) {
      fetchSubmissions(selectedAssignmentForSubmissions.id)
    }
  }, [selectedAssignmentForSubmissions])

  const fetchSubmissions = async (assignmentId: string) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, student:users(name)')
      .eq('assignment_id', assignmentId)

    if (error) {
      console.error('Error fetching submissions:', error)
    } else {
      setSubmissions(data)
    }
  }

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

  const handleFeedbackChange = (submissionId: string, value: string) => {
    setSubmissions(prevSubmissions =>
      prevSubmissions.map(sub =>
        sub.id === submissionId ? { ...sub, feedback: value } : sub
      )
    )
  }

  const handleSaveFeedback = async (submissionId: string, feedback: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ feedback })
      .eq('id', submissionId)

    if (error) {
      console.error('Error saving feedback:', error)
    } else {
      fetchSubmissions(selectedAssignmentForSubmissions.id)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>
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
    <Card className="mb-8 shadow-sm border border-gray-200 rounded-lg">
            <CardHeader className="bg-gray-100 border-b border-gray-200 rounded-t-lg p-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isTeacher && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <textarea
                    placeholder="Post a new announcement..."
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full mb-3 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows={3}
                  />
                  <button onClick={handlePostAnnouncement} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                    Post Announcement
                  </button>
                </div>
              )}
              <div className="space-y-5">
                {announcements.length === 0 ? (
                  <p className="text-gray-500">No announcements yet.</p>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                      <p className="text-gray-800 mb-2">{ann.content}</p>
                      <p className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200 rounded-lg">
            <CardHeader className="bg-gray-100 border-b border-gray-200 rounded-t-lg p-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Assignments</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isTeacher && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Create New Assignment</h3>
                  <input
                    type="text"
                    placeholder="Assignment Title"
                    value={newAssignmentTitle}
                    onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full mb-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    placeholder="Assignment Description"
                    value={newAssignmentDescription}
                    onChange={(e) => setNewAssignmentDescription(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full mb-3 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    rows={4}
                  />
                  <Label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</Label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssignmentDueDate}
                    onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full mb-4 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button onClick={handleCreateAssignment} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                    Create Assignment
                  </button>
                </div>
              )}
              <div className="space-y-5">
                {assignments.length === 0 ? (
                  <p className="text-gray-500">No assignments yet.</p>
                ) : (
                  assignments.map((assign) => (
                    <div key={assign.id} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{assign.title}</h3>
                      <p className="text-gray-700 mb-2">{assign.description}</p>
                      <p className="text-sm text-gray-500 mb-3">Due: {new Date(assign.due_date).toLocaleString()}</p>
                      {isTeacher ? (
                        <button onClick={() => setSelectedAssignmentForSubmissions(assign)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                          View Submissions
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setSelectedAssignment(assign)} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                            Submit
                          </button>
                          {assign.submission && (
                            <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <p className="font-bold text-gray-800 mb-1">Your Submission:</p>
                              <p className="text-gray-700 mb-1">Submitted: {new Date(assign.submission.submitted_at).toLocaleString()}</p>
                              <p className="text-gray-700">File: <a href={assign.submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a></p>
                              {assign.submission.feedback && (
                                <div className="mt-3">
                                  <p className="font-bold text-gray-800 mb-1">Feedback:</p>
                                  <p className="text-gray-700">{assign.submission.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-gray-200 rounded-lg">
            <CardHeader className="bg-gray-100 border-b border-gray-200 rounded-t-lg p-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Materials</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isTeacher && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Upload New Material</h3>
                  <input
                    type="text"
                    placeholder="Material Link (optional)"
                    value={newMaterialLink}
                    onChange={(e) => setNewMaterialLink(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full mb-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Label htmlFor="materialFile" className="block text-sm font-medium text-gray-700 mb-1">Upload File (optional)</Label>
                  <input
                    id="materialFile"
                    type="file"
                    onChange={(e) => setNewMaterialFile(e.target.files ? e.target.files[0] : null)}
                    className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button onClick={handleMaterialUpload} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                    Upload Material
                  </button>
                </div>
              )}
              <div className="space-y-5">
                {materials.length === 0 ? (
                  <p className="text-gray-500">No materials yet.</p>
                ) : (
                  materials.map((mat) => (
                    <div key={mat.id} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                      <p className="text-gray-800 mb-2">File: <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">{mat.url.split('/').pop()}</a></p>
                      <p className="text-sm text-gray-500 mb-1">Type: {mat.type}</p>
                      <p className="text-xs text-gray-500">Created At: {new Date(mat.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Submit Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">{selectedAssignment.title}</h3>
              <p className="text-gray-700 mb-4">{selectedAssignment.description}</p>
              <Label htmlFor="submissionFile" className="block text-sm font-medium text-gray-700 mb-2">Upload your file</Label>
              <input
                id="submissionFile"
                type="file"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </CardContent>
            <CardFooter className="flex justify-end space-x-3">
              <button onClick={() => setSelectedAssignment(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-300 ease-in-out">
                Cancel
              </button>
              <button onClick={handleSubmission} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                Submit
              </button>
            </CardFooter>
          </Card>
        </div>
      )}

      {selectedAssignmentForSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl h-3/4 flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Submissions for {selectedAssignmentForSubmissions.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="text-gray-500">No submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="border p-4 rounded-lg bg-white shadow-sm">
                      <p className="text-gray-800 mb-1">Student: <span className="font-semibold">{sub.student.name}</span></p>
                      <p className="text-sm text-gray-600 mb-1">Submitted At: {new Date(sub.submitted_at).toLocaleString()}</p>
                      <p className="text-gray-700 mb-2">File: <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">View File</a></p>
                      {isTeacher && (
                        <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                          <h4 className="text-md font-semibold mb-2">Feedback</h4>
                          <textarea
                            placeholder="Add feedback"
                            value={sub.feedback || ''}
                            onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                            className="border p-2 rounded-lg w-full mb-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                            rows={3}
                          />
                          <button onClick={() => handleSaveFeedback(sub.id, sub.feedback || '')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out">
                            Save Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-3 mt-4">
              <button onClick={() => setSelectedAssignmentForSubmissions(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-300 ease-in-out">
                Close
              </button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
