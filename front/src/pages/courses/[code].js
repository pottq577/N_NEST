import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  Grid,
  CardMedia,
  Avatar,
  Paper,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material'
import { styled } from '@mui/system'
import { useRouter } from 'next/router'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const CustomCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10]
  }
}))

const CustomAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white
}))

const CourseDetail = () => {
  const router = useRouter()
  const { code } = router.query
  const [courseData, setCourseData] = useState(null)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log('Fetching course data for code:', code)
        const response = await axios.get(`http://localhost:8000/courses/${code}`)
        setCourseData(response.data)
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Failed to load course data')
      }
    }

    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects')
        setProjects(response.data)
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects')
      }
    }

    if (code) {
      fetchCourseData()
      fetchProjects()
    }
  }, [code])

  useEffect(() => {
    if (projects && courseData) {
      const filtered = projects.filter(project => project.course_code === code)
      setFilteredProjects(filtered)
      setIsLoading(false)
    }
  }, [projects, courseData, code])

  const handleDragEnd = result => {
    if (!result.destination) return

    if (result.destination.droppableId === 'evaluationZone') {
      const projectId = result.draggableId
      router.push(`/evaluate/${projectId}`)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
    if (newValue === 1) {
      router.push(`/courses/${code}_team`)
    } else if (newValue === 2) {
      router.push(`/courses/${code}_test`)
    }
  }

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
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      {courseData && (
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ mb: 4 }}>
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
          </Box>
          <Divider />
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label='수업 페이지' />
            <Tab label='팀 설정' />
            <Tab label='코딩 테스트' />
          </Tabs>
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              수강 학생 명단
            </Typography>
            <List>
              {courseData.students.map((student, index) => (
                <ListItem key={index} sx={{ padding: 1 }}>
                  <CustomAvatar sx={{ marginRight: 2 }}>{student.name.charAt(0)}</CustomAvatar>
                  <Typography variant='body1'>{student.name}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
          <Divider />
          <Box sx={{ mt: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              관련 프로젝트 목록
            </Typography>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Grid container spacing={4}>
                <Droppable droppableId='projects' direction='horizontal'>
                  {provided => (
                    <Grid item xs={12} {...provided.droppableProps} ref={provided.innerRef}>
                      <Grid container spacing={4}>
                        {filteredProjects.map((project, index) => (
                          <Draggable key={project._id} draggableId={project._id} index={index}>
                            {provided => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <CustomCard
                                  sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                >
                                  <CardMedia
                                    component='img'
                                    height='140'
                                    image={project.generated_image_url}
                                    alt='Project Image'
                                    onClick={() => router.push(`/project/${project._id}`)}
                                  />
                                  <CardContent>
                                    <Typography gutterBottom variant='h5' component='div'>
                                      {project.project_name}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      {project.summary}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      By: {project.username}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      Views: {project.views ?? 0}
                                    </Typography>
                                  </CardContent>
                                </CustomCard>
                              </Grid>
                            )}
                          </Draggable>
                        ))}
                      </Grid>
                      {provided.placeholder}
                    </Grid>
                  )}
                </Droppable>
              </Grid>
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Droppable droppableId='evaluationZone'>
                  {provided => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ p: 2 }}>
                      <Typography variant='h6' color='textSecondary'>
                        Drag projects here to evaluate
                      </Typography>
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            </DragDropContext>
          </Box>
        </Paper>
      )}
    </Container>
  )
}

export default CourseDetail
