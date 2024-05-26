import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button
} from '@mui/material'

function ProjectDetails() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (id) {
      console.log(`Fetching project with id: ${id}`)
      fetch(`http://localhost:8000/api/projects/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then(data => {
          console.log('Fetched project data:', data)
          setProject(data)
          setComments(data.comments || [])
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error fetching project:', error)
          setError(error.message)
          setIsLoading(false)
        })
    }
  }, [id])

  const handleCommentChange = event => {
    setComment(event.target.value)
  }

  const handleCommentSubmit = () => {
    const newComment = {
      username: 'current_user', // 현재 사용자의 이름을 여기에 설정
      content: comment
    }

    fetch(`http://localhost:8000/api/projects/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newComment)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        console.log('Comment submitted:', data)
        setComments(prevComments => [...prevComments, newComment])
        setComment('')
      })
      .catch(error => {
        console.error('Failed to submit comment:', error)
      })
  }

  const renderPreviewImages = () => {
    if (!project || !project.image_preview_urls) return null

    // project.image_preview_urls가 문자열일 경우 배열로 변환
    const imageUrls = Array.isArray(project.image_preview_urls)
      ? project.image_preview_urls
      : project.image_preview_urls.split(',').map(url => url.trim())

    return imageUrls.map((url, index) => (
      <Box key={index} sx={{ marginRight: '10px', marginBottom: '10px' }}>
        <img src={url} alt={`Preview ${index}`} style={{ maxWidth: '100%', height: 'auto' }} />
      </Box>
    ))
  }

  if (error) {
    return (
      <Container>
        <Typography color='error'>Failed to load project: {error}</Typography>
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

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      {project && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Repository Information
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Student ID:</strong> {project.student_id}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Course Code:</strong> {project.course_code}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Course:</strong> {project.course}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Description:</strong> {project.description}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Language:</strong> {project.language}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Stars:</strong> {project.stars}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Last Updated:</strong> {new Date(project.updated_at).toLocaleDateString()}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>License:</strong> {project.license}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Forks:</strong> {project.forks}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Watchers:</strong> {project.watchers}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Contributors:</strong> {project.contributors}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Private:</strong> {project.is_private ? 'Yes' : 'No'}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Default Branch:</strong> {project.default_branch}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Repository URL:</strong>{' '}
                  <a href={project.repository_url} target='_blank' rel='noopener noreferrer'>
                    {project.repository_url}
                  </a>
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Views:</strong> {project.views ?? 0} {/* 기본값 설정 */}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Summary Information
                </Typography>
                <Typography variant='body1' gutterBottom>
                  {project.summary}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Text Extracted
                </Typography>
                <Typography variant='body1' gutterBottom>
                  {project.text_extracted}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant='outlined'>
              <CardMedia
                component='img'
                image={project.generated_image_url}
                alt='Generated'
                style={{ width: '100%', maxWidth: '66%', height: 'auto', margin: '0 auto' }}
              />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Image Previews
                </Typography>
                {renderPreviewImages()}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Comments
                </Typography>
                {comments.map((comment, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant='body2'>
                      <strong>{comment.username}</strong> <em>{new Date(comment.timestamp).toLocaleString()}</em>
                    </Typography>
                    <Typography variant='body1'>{comment.content}</Typography>
                  </Box>
                ))}
                <TextField
                  label='Add a comment'
                  fullWidth
                  variant='outlined'
                  multiline
                  rows={4}
                  value={comment}
                  onChange={handleCommentChange}
                  sx={{ mb: 2 }}
                />
                <Button variant='contained' color='primary' onClick={handleCommentSubmit}>
                  Submit Comment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default ProjectDetails
