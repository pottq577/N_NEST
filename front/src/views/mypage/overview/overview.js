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
  Divider,
  Skeleton
} from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../../lib/firebase'
import { useQuery } from 'react-query'

const fetchUserInfo = async githubUsername => {
  const { data } = await axios.post('http://localhost:8000/api/user-courses', { githubUsername })
  return data
}

const Overview = () => {
  const [githubUsername, setGithubUsername] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setGithubUsername(user.reloadUserInfo.screenName)
      } else {
        setGithubUsername(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const {
    data: userInfo,
    error,
    isLoading
  } = useQuery(['userInfo', githubUsername], () => fetchUserInfo(githubUsername), { enabled: !!githubUsername })

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
        <Typography color='error'>Failed to load user info: {error.message}</Typography>
      </Container>
    )
  }

  const handleCourseClick = courseCode => {
    router.push(`/courses/${courseCode}`)
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      {userInfo ? (
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
      ) : (
        <Skeleton variant='rectangular' width='100%' height={400} />
      )}
    </Container>
  )
}

export default Overview
