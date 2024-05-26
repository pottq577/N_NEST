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
  Divider
} from '@mui/material'
import { useRouter } from 'next/router'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const CourseDetail = () => {
  const router = useRouter()
  const { code } = router.query
  const [courseData, setCourseData] = useState(null)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
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
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              수강 학생 명단
            </Typography>
            <List>
              {courseData.students.map((student, index) => (
                <ListItem key={index} sx={{ padding: 1 }}>
                  <Avatar sx={{ marginRight: 2 }}>{student.name.charAt(0)}</Avatar>
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
                                <Card
                                  sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                  onClick={() => router.push(`/project/${project._id}`)}
                                >
                                  <CardMedia
                                    component='img'
                                    height='140'
                                    image={project.generated_image_url}
                                    alt='Project Image'
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
                                </Card>
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
                  borderRadius: 2
                }}
              >
                <Droppable droppableId='evaluationZone'>
                  {provided => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ p: 2, textAlign: 'center' }}>
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
