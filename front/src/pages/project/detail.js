import React, { useState } from 'react'
import { Container, TextField, Button, Typography, Box } from '@mui/material'
import axios from 'axios'

function DetailPage() {
  const [objectId, setObjectId] = useState('')
  const [project, setProject] = useState(null)
  const [error, setError] = useState('')

  const handleInputChange = event => {
    setObjectId(event.target.value)
  }

  const handleFetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/projects/${objectId}`)
      setProject(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch project. Please check the ObjectId.')
      setProject(null)
    }
  }

  return (
    <Container maxWidth='md'>
      <Box my={4}>
        <Typography variant='h4' component='h1' gutterBottom>
          Fetch Project Details
        </Typography>
        <TextField
          label='ObjectId'
          variant='outlined'
          value={objectId}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant='contained' color='primary' onClick={handleFetchProject}>
          Fetch Project
        </Button>

        {error && (
          <Typography color='error' sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {project && (
          <Box sx={{ mt: 4 }}>
            <Typography variant='h5' gutterBottom>
              Project Details
            </Typography>
            <Typography variant='body1'>
              <strong>Project Name:</strong> {project.project_name}
            </Typography>
            <Typography variant='body1'>
              <strong>Description:</strong> {project.description}
            </Typography>
            <Typography variant='body1'>
              <strong>Language:</strong> {project.language}
            </Typography>
            <Typography variant='body1'>
              <strong>Stars:</strong> {project.stars}
            </Typography>
            <Typography variant='body1'>
              <strong>Last Updated:</strong> {new Date(project.updated_at).toLocaleDateString()}
            </Typography>
            <Typography variant='body1'>
              <strong>License:</strong> {project.license}
            </Typography>
            <Typography variant='body1'>
              <strong>Forks:</strong> {project.forks}
            </Typography>
            <Typography variant='body1'>
              <strong>Watchers:</strong> {project.watchers}
            </Typography>
            <Typography variant='body1'>
              <strong>Contributors:</strong> {project.contributors}
            </Typography>
            <Typography variant='body1'>
              <strong>Private:</strong> {project.is_private ? 'Yes' : 'No'}
            </Typography>
            <Typography variant='body1'>
              <strong>Default Branch:</strong> {project.default_branch}
            </Typography>
            <Typography variant='body1'>
              <strong>Repository URL:</strong>{' '}
              <a href={project.repository_url} target='_blank' rel='noopener noreferrer'>
                {project.repository_url}
              </a>
            </Typography>
            <Typography variant='body1'>
              <strong>Text Extracted:</strong> {project.text_extracted}
            </Typography>
            <Typography variant='body1'>
              <strong>Summary:</strong> {project.summary}
            </Typography>
            <Typography variant='body1'>
              <strong>Image Preview URLs:</strong> {project.image_preview_urls}
            </Typography>
            {project.generated_image_url && (
              <img src={project.generated_image_url} alt='Generated' style={{ width: '100%', height: 'auto' }} />
            )}
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default DetailPage
