import React, { useState, useEffect } from 'react'
import { Container, Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box } from '@mui/material'
import { useRouter } from 'next/router'

function Projects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('http://localhost:8000/api/projects')
      .then(response => response.json())
      .then(data => {
        setProjects(data)
        setIsLoading(false)
      })
      .catch(error => {
        setError(error.message)
        setIsLoading(false)
      })
  }, [])

  if (error) {
    return (
      <Container>
        <Typography color='error'>Failed to load projects: {error}</Typography>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  const handleCardClick = project => {
    router.push(`/project/${project._id}`)
  }

  return (
    <Container maxWidth='lg'>
      <Grid container spacing={4}>
        {projects.map(project => (
          <Grid item key={project._id} xs={12} sm={6} md={4}>
            <Card onClick={() => handleCardClick(project)}>
              <CardMedia component='img' height='140' image={project.generated_image_url} alt='Project Image' />
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
                  Views: {project.views ?? 0} {/* 기본값 설정 */}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Projects
