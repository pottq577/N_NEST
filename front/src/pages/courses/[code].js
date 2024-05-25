import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Container, Typography, CircularProgress, Box, Card, CardContent, List, ListItem } from '@mui/material'
import axios from 'axios'

const CourseDetail = () => {
  const router = useRouter()
  const { code } = router.query
  const [courseData, setCourseData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/courses/${code}`)
        setCourseData(response.data)
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Failed to load course data')
      } finally {
        setIsLoading(false)
      }
    }

    if (code) {
      fetchCourseData()
    }
  }, [code])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container>
        <Typography color='error'>{error}</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      {courseData && (
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant='h4' gutterBottom>
              {courseData.course.name}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Professor:</strong> {courseData.course.professor}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Day:</strong> {courseData.course.day}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Time:</strong> {courseData.course.time}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Code:</strong> {courseData.course.code}
            </Typography>
            <Typography variant='h5' component='h2' gutterBottom>
              수강 학생 명단
            </Typography>
            <List>
              {courseData.students.map((student, index) => (
                <ListItem key={index}>
                  <Typography variant='body1'>{student.name}</Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

export default CourseDetail
