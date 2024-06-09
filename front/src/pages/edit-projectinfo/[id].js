import React, { useState, useEffect, useRef } from 'react'
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
  Paper,
  IconButton
} from '@mui/material'
import { styled } from '@mui/system'
import { Star, ForkRight, Visibility, Add, Delete } from '@mui/icons-material'

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
  const summaryCardRef = useRef(null)
  const textExtractedCardRef = useRef(null)
  const [minHeight, setMinHeight] = useState(0)
  const [formData, setFormData] = useState({
    username: '',
    project_name: '',
    description: 'No description',
    language: 'Unknown',
    stars: 0,
    updated_at: '',
    license: 'None',
    forks: 0,
    watchers: 0,
    contributors: 'None',
    is_private: false,
    default_branch: 'main',
    repository_url: '',
    text_extracted: '',
    summary: '',
    image_preview_urls: [],
    generated_image_url: '',
    views: 0,
    comments: [],
    student_id: '',
    course: '',
    course_code: ''
  })

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
          setFormData({
            username: data.username,
            project_name: data.project_name,
            description: data.description,
            language: data.language,
            stars: data.stars,
            updated_at: data.updated_at,
            license: data.license,
            forks: data.forks,
            watchers: data.watchers,
            contributors: data.contributors,
            is_private: data.is_private,
            default_branch: data.default_branch,
            repository_url: data.repository_url,
            text_extracted: data.text_extracted,
            summary: data.summary,
            image_preview_urls: Array.isArray(data.image_preview_urls)
              ? data.image_preview_urls
              : data.image_preview_urls.split(',').map(url => url.trim()),
            generated_image_url: data.generated_image_url,
            views: data.views,
            comments: data.comments || [],
            student_id: data.student_id,
            course: data.course,
            course_code: data.course_code
          })
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

  useEffect(() => {
    if (summaryCardRef.current && textExtractedCardRef.current) {
      const summaryHeight = summaryCardRef.current.offsetHeight
      const textExtractedHeight = textExtractedCardRef.current.offsetHeight
      setMinHeight(Math.max(summaryHeight, textExtractedHeight))
    }
  }, [project])

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

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleImageFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        setFormData(prevState => ({
          ...prevState,
          image_preview_urls: [...prevState.image_preview_urls, e.target.result]
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = index => {
    setFormData(prevState => ({
      ...prevState,
      image_preview_urls: prevState.image_preview_urls.filter((_, i) => i !== index)
    }))
  }

  const handleFormSubmit = async event => {
    event.preventDefault()
    try {
      const response = await fetch(`http://localhost:8000/update-project/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          comments // 유지된 댓글을 포함하여 전송
        })
      })
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      router.push(`/project/${id}`)
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const renderPreviewImages = () => {
    return formData.image_preview_urls.map((url, index) => (
      <Box key={index} sx={{ marginRight: '10px', marginBottom: '10px', position: 'relative' }}>
        <img src={url} alt={`Preview ${index}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
        <IconButton
          onClick={() => handleRemoveImage(index)}
          sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
        >
          <Delete />
        </IconButton>
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
    <Paper sx={{ p: 5, borderRadius: 3, borderWidth: 3, mr: 5, shadows: '#000' }}>
      <Typography variant='h6' component='div' sx={{ mb: 2, fontWeight: '600', color: '#0072E5' }}>
        {repo.project_name}
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
        {renderRepoDetailIcons('Stars', <Star sx={{ verticalAlign: 'middle' }} />, repo.stars)}
        {renderRepoDetailIcons('Forks', <ForkRight sx={{ verticalAlign: 'middle' }} />, repo.forks)}
        {renderRepoDetailIcons('Watchers', <Visibility sx={{ verticalAlign: 'middle' }} />, repo.watchers)}
        <Box sx={{ mx: 1 }} />

        {repo.license && (
          <>
            <Box sx={{ mx: 1 }} />
            <Typography variant='subtitle2' component='span'>
              {repo.license}
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
          <Grid item xs={12}>
            <CustomCard variant='outlined'>
              <CardContent style={{ display: 'flex', alignItems: 'center' }}>
                <Box style={{ flex: 1 }}>
                  <CustomTypography variant='h6' gutterBottom>
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
                  <RenderRepoDetail repo={project} />
                </Box>
                <CardMedia
                  component='img'
                  image={project.generated_image_url}
                  alt='Generated'
                  style={{ flexGrow: 1, maxWidth: '30%', height: 'auto', borderRadius: '8px' }}
                />
              </CardContent>
            </CustomCard>
          </Grid>

          <form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
            <Grid container spacing={4}>
              {/* 요약 정보 */}
              <Grid item xs={12} md={6}>
                <CustomCard variant='outlined' ref={summaryCardRef}>
                  <CardContent>
                    <CustomTypography variant='h6' gutterBottom>
                      요약 정보
                    </CustomTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant='outlined'
                      name='summary'
                      value={formData.summary}
                      onChange={handleInputChange}
                    />
                  </CardContent>
                </CustomCard>
              </Grid>

              {/* 텍스트 추출 */}
              <Grid item xs={12} md={6}>
                <CustomCard variant='outlined' ref={textExtractedCardRef}>
                  <CardContent>
                    <CustomTypography variant='h6' gutterBottom>
                      본문
                    </CustomTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant='outlined'
                      name='text_extracted'
                      value={formData.text_extracted}
                      onChange={handleInputChange}
                    />
                  </CardContent>
                </CustomCard>
              </Grid>

              {/* 이미지 미리보기 */}
              <Grid item xs={12}>
                <CustomCard variant='outlined'>
                  <CardContent>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <CustomTypography variant='h6' gutterBottom>
                        이미지 미리보기
                      </CustomTypography>
                      <Box display='flex' alignItems='center'>
                        <IconButton color='primary' component='label'>
                          <Add />
                          <input type='file' accept='image/*' onChange={handleImageFileChange} hidden />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box
                      mt={2}
                      display='flex'
                      flexWrap='wrap'
                      sx={{
                        minHeight: 200,
                        borderRadius: '8px',
                        padding: '10px',
                        border: formData.image_preview_urls.length === 0 ? '1px dashed #ddd' : 'none'
                      }}
                    >
                      {renderPreviewImages()}
                      {formData.image_preview_urls.length === 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <Typography variant='body2' color='textSecondary'>
                            No images available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </CustomCard>
              </Grid>

              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <CustomButton type='submit' variant='contained' color='primary'>
                  수정
                </CustomButton>
              </Grid>
            </Grid>
          </form>
        </Grid>
      )}
    </Container>
  )
}

export default ProjectDetails