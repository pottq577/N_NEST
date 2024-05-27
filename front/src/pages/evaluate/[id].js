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
  Divider,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

  const [selectedCategories, setSelectedCategories] = useState([])
  const [inputs, setInputs] = useState({})
  const [summaries, setSummaries] = useState({})
  const [otherCategoryName, setOtherCategoryName] = useState('')
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [scores, setScores] = useState({})

  const categories = ['기술', '활용방안', '기대효과', '필요성', '기타', '번호점수']

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

  const handleSelectCategory = category => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(item => item !== category))
      const newInputs = { ...inputs }
      delete newInputs[category]
      setInputs(newInputs)
      const newSummaries = { ...summaries }
      delete newSummaries[category]
      setSummaries(newSummaries)
      const newScores = { ...scores }
      delete newScores[category]
      setScores(newScores)
    } else {
      setSelectedCategories([...selectedCategories, category])
      setInputs({ ...inputs, [category]: '' })
      if (category === '기타') {
        setOtherCategoryName('')
      }
    }
  }

  const handleChange = (category, value) => {
    setInputs({ ...inputs, [category]: value })
  }

  const handleOtherCategoryNameChange = value => {
    setOtherCategoryName(value)
  }

  const handleScoreChange = (category, value) => {
    setScores({ ...scores, [category]: value })
  }

  const handleSubmit = async category => {
    let finalCategory = category === '기타' ? otherCategoryName : category
    setIsSummaryLoading(true)
    setSummaryError('')
    try {
      const response = await fetch(
        `http://localhost:8000/summarize/${finalCategory}?text=${encodeURIComponent(inputs[category])}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setSummaries(prevSummaries => ({ ...prevSummaries, [category]: data.text || '결과가 없습니다' }))
      setIsSummaryLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setSummaryError('Failed to fetch summary, please try again.')
      setIsSummaryLoading(false)
    }
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
          <Grid item xs={12} md={8}>
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
            <CustomCard variant='outlined' sx={{ mt: 4 }}>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Summary Information
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.summary}
                </Typography>
              </CardContent>
            </CustomCard>
            <CustomCard variant='outlined' sx={{ mt: 4 }}>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  Text Extracted
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.text_extracted}
                </Typography>
              </CardContent>
            </CustomCard>
            <CustomCard variant='outlined' sx={{ mt: 4 }}>
              <CardMedia
                component='img'
                image={project.generated_image_url}
                alt='Generated'
                style={{ width: '100%', maxWidth: '66%', height: 'auto', margin: '0 auto', borderRadius: '8px' }}
              />
            </CustomCard>
            <CustomCard variant='outlined' sx={{ mt: 4 }}>
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
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ position: 'sticky', top: 16, p: 2 }}>
              <Typography variant='h5' gutterBottom>
                Dynamic Prompting
              </Typography>
              <Box display='flex' flexDirection='row' flexWrap='wrap' mb={2}>
                {categories.map(category => (
                  <CustomButton
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    variant={selectedCategories.includes(category) ? 'contained' : 'outlined'}
                    sx={{ marginRight: 1, marginBottom: 1 }}
                  >
                    {category}
                  </CustomButton>
                ))}
              </Box>
              {selectedCategories.includes('기타') && (
                <TextField
                  fullWidth
                  label='Specify the "Other" category name'
                  value={otherCategoryName}
                  onChange={e => handleOtherCategoryNameChange(e.target.value)}
                  variant='outlined'
                  sx={{ mb: 2 }}
                />
              )}
              {selectedCategories.map(category => (
                <Box key={category} mb={2}>
                  {category === '번호점수' ? (
                    <FormControl fullWidth variant='outlined' sx={{ mb: 2 }}>
                      <InputLabel>Choose Score</InputLabel>
                      <Select
                        label='Choose Score'
                        value={scores[category] || ''}
                        onChange={e => handleScoreChange(category, e.target.value)}
                      >
                        {[1, 2, 3, 4, 5].map(score => (
                          <MenuItem key={score} value={score}>
                            {score}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        label={`Enter text for ${category}`}
                        value={inputs[category]}
                        onChange={e => handleChange(category, e.target.value)}
                        variant='outlined'
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                      />
                      <CustomButton
                        onClick={() => handleSubmit(category)}
                        variant='contained'
                        color='primary'
                        disabled={isSummaryLoading}
                        sx={{ mb: 2 }}
                      >
                        {isSummaryLoading ? <CircularProgress size={24} /> : 'Submit'}
                      </CustomButton>
                      {summaryError && (
                        <Typography color='error' sx={{ mb: 2 }}>
                          {summaryError}
                        </Typography>
                      )}
                      <Typography variant='body1'>{summaries[category] || '결과를 기다리는 중입니다...'}</Typography>
                    </>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default ProjectDetails
