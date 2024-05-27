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
  Button,
  Link
} from '@mui/material'
import { styled } from '@mui/system'

const CustomCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[10]
  }
}))

const CustomButton = styled(Button)(({ theme }) => ({
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}))

const CustomTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold'
}))

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

    const imageUrls = Array.isArray(project.image_preview_urls)
      ? project.image_preview_urls
      : project.image_preview_urls.split(',').map(url => url.trim())

    return imageUrls.map((url, index) => (
      <Box key={index} sx={{ marginRight: '10px', marginBottom: '10px' }}>
        <img src={url} alt={`Preview ${index}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
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
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Repository Information
                </CustomTypography>
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
                  <Link href={project.repository_url} target='_blank' rel='noopener noreferrer'>
                    {project.repository_url}
                  </Link>
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Views:</strong> {project.views ?? 0} {/* 기본값 설정 */}
                </Typography>
              </CardContent>
            </CustomCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Summary Information
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.summary}
                </Typography>
              </CardContent>
            </CustomCard>
          </Grid>
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Text Extracted
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.text_extracted}
                </Typography>
              </CardContent>
            </CustomCard>
          </Grid>
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardMedia
                component='img'
                image={project.generated_image_url}
                alt='Generated'
                style={{ width: '100%', maxWidth: '66%', height: 'auto', margin: '0 auto', borderRadius: '8px' }}
              />
            </CustomCard>
          </Grid>
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Image Previews
                </CustomTypography>
                {renderPreviewImages()}
              </CardContent>
            </CustomCard>
          </Grid>
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Comments
                </CustomTypography>
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
                <CustomButton variant='contained' color='primary' onClick={handleCommentSubmit}>
                  Submit Comment
                </CustomButton>
              </CardContent>
            </CustomCard>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default ProjectDetails
