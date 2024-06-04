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
  Link
} from '@mui/material'
import { styled } from '@mui/system'
import Rating from 'react-rating-stars-component'
import { Star, ForkRight, Visibility } from '@mui/icons-material'

const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c'
}

const parseText = text => {
  const sections = text.split(', ').map(section => {
    const [title, content] = section.split(': ** ')

    const cleanedContent = content
      ?.trim()
      .replace(/\*\*$/, '')
      .split('\n')
      .map(line => line.replace(/^\*|\*$/g, '').trim())
      .join('\n')

    return { title: title.trim(), content: cleanedContent }
  })

  return sections
}

const TextExtractedCard = ({ project }) => {
  const sections = parseText(project.text_extracted)

  return (
    <CustomCard variant='outlined' sx={{ mt: 4 }}>
      <CardContent>
        <CustomTypography variant='h6' gutterBottom>
          본문 내용
        </CustomTypography>
        {sections.map((section, index) => (
          <div key={index}>
            <Typography variant='h6' gutterBottom>
              {section.title}
            </Typography>
            <Typography variant='body1' gutterBottom>
              {section.content
                ? section.content.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))
                : null}
            </Typography>
          </div>
        ))}
      </CardContent>
    </CustomCard>
  )
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

  const [selectedCategories, setSelectedCategories] = useState([])
  const [inputs, setInputs] = useState({})
  const [summaries, setSummaries] = useState({})
  const [otherCategoryName, setOtherCategoryName] = useState('')
  const [isSummaryLoading, setIsSummaryLoading] = useState({})
  const [summaryError, setSummaryError] = useState('')
  const [scores, setScores] = useState({})
  const [scoreDescriptions, setScoreDescriptions] = useState({})

  const categories = ['기술', '활용방안', '기대효과', '필요성', '기타']

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
      username: 'current_user',
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
      const newScoreDescriptions = { ...scoreDescriptions }
      delete newScoreDescriptions[category]
      setScoreDescriptions(newScoreDescriptions)
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

  const handleScoreDescriptionChange = (category, value) => {
    setScoreDescriptions({ ...scoreDescriptions, [category]: value })
  }

  const handleSubmit = async category => {
    let finalCategory = category === '기타' ? otherCategoryName : category
    setIsSummaryLoading(prevState => ({ ...prevState, [category]: true }))
    setSummaryError('')
    try {
      const response = await fetch(
        `http://localhost:8001/summarize/${finalCategory}?text=${encodeURIComponent(inputs[category])}`,
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
      setIsSummaryLoading(prevState => ({ ...prevState, [category]: false }))
    } catch (error) {
      console.error('Error:', error)
      setSummaryError('Failed to fetch summary, please try again.')
      setIsSummaryLoading(prevState => ({ ...prevState, [category]: false }))
    }
  }

  const handleSaveEvaluation = async () => {
    const evaluationData = {
      project_id: project._id,
      username: 'current_user',
      student_id: project.student_id,
      course_code: project.course_code,
      evaluations: selectedCategories.map(category => ({
        category: category === '기타' ? otherCategoryName : category,
        summary: summaries[category] || '',
        score: scores[category],
        description: scoreDescriptions[category] || ''
      }))
    }

    try {
      const response = await fetch('http://localhost:8000/api/projects/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evaluationData)
      })

      if (response.ok) {
        alert('Evaluation saved successfully')
        router.push(`/courses/${project.course_code}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to save evaluation: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Error saving evaluation:', error)
      alert('Failed to save evaluation')
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
          <Grid item xs={12} md={8}>
            <CustomCard variant='outlined'>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  프로젝트 정보
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  <strong>학번:</strong> {project.student_id}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>과목:</strong> {project.course} - {project.course_code}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>조회수:</strong> {project.views ?? 0}
                </Typography>
                <RenderRepoDetail repo={project} />
              </CardContent>
            </CustomCard>

            <CustomCard variant='outlined' sx={{ mt: 4 }}>
              <CardContent>
                <CustomTypography variant='h6' gutterBottom>
                  요약 정보
                </CustomTypography>
                <Typography variant='body1' gutterBottom>
                  {project.summary}
                </Typography>
              </CardContent>
            </CustomCard>

            <TextExtractedCard project={project} />

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
              <CustomTypography variant='h5' gutterBottom>
                Dynamic Prompting
              </CustomTypography>
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
              {selectedCategories.map(category => (
                <Box key={category} mb={2}>
                  <Divider sx={{ my: 2 }} />
                  {category === '기타' && (
                    <TextField
                      fullWidth
                      label='Specify the "Other" category name'
                      value={otherCategoryName}
                      onChange={e => handleOtherCategoryNameChange(e.target.value)}
                      variant='outlined'
                      sx={{ mb: 2 }}
                    />
                  )}
                  <TextField
                    fullWidth
                    label={`Enter text for ${category === '기타' ? otherCategoryName : category}`}
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
                    disabled={isSummaryLoading[category]}
                    sx={{ mb: 2 }}
                  >
                    {isSummaryLoading[category] ? <CircularProgress size={24} /> : 'Submit'}
                  </CustomButton>
                  {summaryError && (
                    <Typography color='error' sx={{ mb: 2 }}>
                      {summaryError}
                    </Typography>
                  )}
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {summaries[category]}
                  </Typography>

                  <CustomTypography variant='h6' gutterBottom>
                    {category === '기타' ? otherCategoryName : category}에 대한 평가 및 설명
                  </CustomTypography>
                  <TextField
                    fullWidth
                    label='Score Description'
                    value={scoreDescriptions[category] || ''}
                    onChange={e => handleScoreDescriptionChange(category, e.target.value)}
                    variant='outlined'
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                  <Typography gutterBottom>Choose Score</Typography>
                  <Rating
                    count={5}
                    value={scores[category] || 0}
                    onChange={newValue => handleScoreChange(category, newValue)}
                    size={30}
                    activeColor='#ffd700'
                  />
                </Box>
              ))}
              {selectedCategories.length > 0 && (
                <CustomButton variant='contained' color='secondary' onClick={handleSaveEvaluation} sx={{ mt: 4 }}>
                  평가 저장하기
                </CustomButton>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default ProjectDetails
