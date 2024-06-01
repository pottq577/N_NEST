import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  List,
  ListItem,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider
} from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../../lib/firebase'

const Overview = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loginType, setLoginType] = useState(null) // 로그인 유형을 저장하기 위한 상태
  const router = useRouter()

  const fetchProfessorInfoByEmail = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8000/professors?email=${email}`)
      return response.data
    } catch (error) {
      console.error('Error fetching professor info:', error)
      return null
    }
  }

  const fetchCoursesByProfessorId = async (professorId) => {
    try {
      const response = await axios.get(`http://localhost:8000/courses/by-professor/${professorId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching courses:', error)
      return []
    }
  }

  useEffect(() => {
    const fetchUserInfo = async (githubUsername) => {
      try {
        const response = await axios.post('http://localhost:8000/api/user-courses', { githubUsername })
        setUserInfo(response.data)
        setLoginType('github') // GitHub 로그인 유형 설정
      } catch (error) {
        console.error('Error fetching user info:', error)

        let errorMessage = 'Error fetching user info'
        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail
          } else if (typeof error.response.data.detail === 'object') {
            errorMessage = JSON.stringify(error.response.data.detail)
          }
        }
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUserByEmail = async (email) => {
      try {
        const professorInfo = await fetchProfessorInfoByEmail(email)
        if (professorInfo) {
          const courses = await fetchCoursesByProfessorId(professorInfo.professor_id)
          setUserInfo({
            name: professorInfo.name,
            email: professorInfo.email,
            courses: courses
          })
          setLoginType('email') // 이메일 로그인 유형 설정
        } else {
          setError('Professor info not found.')
        }
      } catch (error) {
        console.error('Error fetching professor info by email:', error)
        setError('Error fetching professor info by email.')
      } finally {
        setIsLoading(false)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const githubUsername = user.reloadUserInfo?.screenName
        if (githubUsername) {
          fetchUserInfo(githubUsername)
        } else {
          // GitHub 정보가 없으면 이메일로 교수 정보 가져오기 시도
          const email = user.email
          fetchUserByEmail(email)
        }
      } else {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

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
        <Typography color='error'>Failed to load user info: {error}</Typography>
      </Container>
    )
  }

  const handleCourseClick = courseCode => {
    router.push(`/courses/${courseCode}`)
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      {loginType === 'github' && userInfo && (
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardHeader
            avatar={<Avatar alt={userInfo.name} src={`https://github.com/${userInfo.githubUsername}.png`} />}
            title={`${userInfo.name}'s Overview`}
            subheader={userInfo.department}
            titleTypographyProps={{ variant: 'h4', fontWeight: 'bold' }}
            subheaderTypographyProps={{ variant: 'subtitle1', color: 'text.secondary' }}
            sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}
          />
          <CardContent>
            <Typography variant='body1' gutterBottom>
              <strong>Github User Name:</strong> {userInfo.githubUsername}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Student ID:</strong> {userInfo.studentId}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant='h5' component='h2' gutterBottom>
              Courses
            </Typography>
            <List>
              {userInfo.courses.map((course, index) => (
                <ListItem button key={index} sx={{ mb: 1 }} onClick={() => handleCourseClick(course.code)}>
                  <Card sx={{ width: '100%', boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant='h6'>{course.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Code:</strong> {course.code}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Professor:</strong> {course.professor}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Day:</strong> {course.day}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Time:</strong> {course.time}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {loginType === 'email' && userInfo && (
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardHeader
            avatar={<Avatar alt={userInfo.name} src='/static/images/avatar/1.jpg' />}
            title={`${userInfo.name}'s Overview`}
            titleTypographyProps={{ variant: 'h4', fontWeight: 'bold' }}
            subheaderTypographyProps={{ variant: 'subtitle1', color: 'text.secondary' }}
            sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}
          />
          <CardContent>
            <Typography variant='body1' gutterBottom>
              <strong>Email:</strong> {userInfo.email}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant='h5' component='h2' gutterBottom>
              Courses
            </Typography>
            <List>
              {userInfo.courses.map((course, index) => (
                <ListItem button key={index} sx={{ mb: 1 }} onClick={() => handleCourseClick(course.code)}>
                  <Card sx={{ width: '100%', boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant='h6'>{course.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Code:</strong> {course.code}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Day:</strong> {course.day}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Time:</strong> {course.time}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

export default Overview
