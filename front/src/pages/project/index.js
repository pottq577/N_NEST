import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  CardActions,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../lib/firebase'

function Projects() {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfilePic, setUserProfilePic] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('http://localhost:8000/api/projects')
      .then(response => response.json())
      .then(data => {
        setProjects(data)
        setFilteredProjects(data)
        setIsLoading(false)
      })
      .catch(error => {
        setError(error.message)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserProfilePic(user.photoURL)
      } else {
        setUserProfilePic(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSearchChange = event => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = projects.filter(
      project =>
        project.project_name.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query) ||
        project.username.toLowerCase().includes(query)
    )
    setFilteredProjects(filtered)
  }

  if (error) {
    return (
      <Container>
        <Typography color='error'>Failed to load projects: {error}</Typography>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const handleCardClick = project => {
    router.push(`/project/${project._id}`)
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          label='Search projects'
          variant='outlined'
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      <Grid container spacing={4}>
        {filteredProjects.map(project => (
          <Grid item key={project._id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardMedia
                component='img'
                height='200'
                image={project.generated_image_url}
                alt='Project Image'
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant='h5' component='div'>
                  {project.project_name}
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  {project.summary}
                </Typography>
              </CardContent>
              <Box sx={{ px: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar alt={project.username} src={userProfilePic} sx={{ mr: 2 }} />
                    <Typography variant='body2' color='text.secondary'>
                      By: {project.username}
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary' sx={{ mr: 2 }}>
                    Views: {project.views ?? 0}
                  </Typography>
                </Box>
              </Box>
              <CardActions sx={{ justifyContent: 'flex-start', pl: 2 }}>
                <Button size='small' color='primary' onClick={() => handleCardClick(project)}>
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Projects
