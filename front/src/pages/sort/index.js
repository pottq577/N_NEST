import { useState } from 'react'
import { Box, Card, CardContent, Typography, CircularProgress, TextField, Button } from '@mui/material'
import Link from 'next/link'

const UserProjectsPage = () => {
  const [studentId, setStudentId] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = e => {
    setStudentId(e.target.value)
  }

  const handleSearch = async () => {
    if (!studentId) {
      setError('Please enter a student ID')
      return
    }
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:8000/api/user-projects/${studentId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant='h4' gutterBottom>
        Search Projects by Student ID
      </Typography>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <TextField label='Student ID' value={studentId} onChange={handleInputChange} sx={{ mr: 2 }} />
        <Button variant='contained' color='primary' onClick={handleSearch}>
          Search
        </Button>
      </Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color='error'>{error}</Typography>
        </Box>
      )}
      {!loading && !error && (
        <>
          <Typography variant='h4' gutterBottom>
            Projects for Student ID: {studentId}
          </Typography>
          {projects.length > 0 ? (
            projects.map(project => (
              <Card key={project._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant='h6'>{project.project_name}</Typography>
                  <Typography variant='body2' color='textSecondary'>
                    {project.description}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    By: {project.username}
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    Views: {project.views ?? 0}
                  </Typography>
                  <Link href={project.repository_url} passHref>
                    <Typography variant='body2' color='primary'>
                      GitHub Repository
                    </Typography>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant='body2' color='textSecondary'>
              No projects found.
            </Typography>
          )}
        </>
      )}
    </Box>
  )
}

export default UserProjectsPage
