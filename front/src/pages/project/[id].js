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
  Link,
  Paper
} from '@mui/material'
import { styled } from '@mui/system'
import { Star, ForkRight, Visibility } from '@mui/icons-material'

const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c'
}

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

  const RenderRepoDetail = ({ repo }) => (
    <Paper sx={{ p: 5 }}>
      <Typography variant='h6' component='div' sx={{ mb: 2, fontWeight: '600', color: '#0072E5' }}>
        {repo.name}
      </Typography>
      <Typography variant='body2' color='textSecondary' component='p' sx={{ mb: 2 }}>
        {repo.description || 'No description'}
      </Typography>
      <Typography
        variant='body2'
        color='textSecondary'
        component='p'
        sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}
      >
        {/* 언어 아이콘 Box */}
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: languageColors[repo.language] || '#000',
            display: 'inline-block',
            mr: 1
          }}
        />
        <Typography variant='subtitle2' component='span'>
          {repo.language || 'No info'}
        </Typography>
        {renderRepoDetailIcons('Stars', <Star sx={{ verticalAlign: 'middle' }} />, repo.stargazers_count)}
        {renderRepoDetailIcons('Forks', <ForkRight sx={{ verticalAlign: 'middle' }} />, repo.forks_count)}
        {renderRepoDetailIcons('Watchers', <Visibility sx={{ verticalAlign: 'middle' }} />, repo.watchers_count)}
        <Box sx={{ mx: 1 }} />

        {repo.license && (
          <>
            <Box sx={{ mx: 1 }} />
            <Typography variant='subtitle2' component='span'>
              {repo.license.name}
            </Typography>
          </>
        )}
        <Box sx={{ mx: 2 }} />
        <Typography variant='subtitle2' component='span'>
          Updated
        </Typography>
        <Typography variant='subtitle2' component='span' sx={{ ml: 2 }}>
          {new Date(repo.updated_at).toLocaleDateString()}
        </Typography>
      </Typography>
      <Typography variant='body2' sx={{ mb: 2 }}>
        <Link href={repo.repository_url} target='_blank' rel='noopener noreferrer' color='primary'>
          GitHub로 이동
        </Link>
      </Typography>
    </Paper>
  )

  const renderRepoDetailIcons = (label, icon, value) =>
    value > 0 && (
      <>
        <Box sx={{ mx: 1 }} />
        {icon}
        <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
          {value}
        </Typography>
      </>
    )

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      {project && (
        <Grid container spacing={4}>
          {/* 저장소 정보 */}
          <Grid item xs={12} md={6}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography stomTypography variant='h6' gutterBottom>
                  프로젝트 정보
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  <strong>학번: </strong> {project.student_id}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>강의: </strong> {project.course}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>조회수: </strong> {project.views ?? 0}
                </Typography>
              </CardContent>
              <RenderRepoDetail repo={project} />
            </CustomCard>
          </Grid>

          {/* 요약 정보 */}
          <Grid item xs={12} md={6}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  요약 정보
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.summary}
                </Typography>
              </CardContent>
            </CustomCard>
          </Grid>

          {/* 텍스트 추출 */}
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  텍스트 추출
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.text_extracted}
                </Typography>
              </CardContent>
            </CustomCard>
          </Grid>

          {/* 프로젝트 이미지 */}
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

          {/* 댓글 */}
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  댓글
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
                  label='댓글을 추가하세요'
                  fullWidth
                  variant='outlined'
                  multiline
                  rows={4}
                  value={comment}
                  onChange={handleCommentChange}
                  sx={{ mb: 2 }}
                />
                <CustomButton variant='contained' color='primary' onClick={handleCommentSubmit}>
                  등록
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
