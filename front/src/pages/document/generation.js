import React, { useState, useEffect } from 'react'
import {
  Container,
  Tab,
  Tabs,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
  Card,
  CardContent,
  Avatar
} from '@mui/material'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Star, ForkRight, Visibility } from '@mui/icons-material'
import styled from '@emotion/styled'

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: '#e0e0e0'
  }
}))

const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c'
}

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function RepositoryInfo({ courseInfo, studentId }) {
  const router = useRouter()
  const query = router.query

  const InfoRow = ({ label, value }) => (
    <Typography>
      <strong>{label}:</strong> {value}
    </Typography>
  )

  const RenderUserInfo = props => (
    <StyledCard>
      <Avatar sx={{ bgcolor: 'primary.main', marginRight: 2 }}>{props.username.charAt(0).toUpperCase()}</Avatar>
      <CardContent>
        <Typography variant='h6'>{props.username}</Typography>
        <Typography variant='body2' color='textSecondary'>
          <strong>User ID:</strong> {props.userId}
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          <strong>Student ID:</strong> {props.studentId}
        </Typography>
      </CardContent>
    </StyledCard>
  )

  const RenderCourseInfo = () => (
    <StyledCard>
      <CardContent>
        {/* <Typography variant='h6' gutterBottom>
          강의 정보
        </Typography> */}

        <InfoRow
          label='과목'
          value={`${courseInfo.name}-${courseInfo.professor} (${courseInfo.day} ${courseInfo.time})`}
        />
        <InfoRow label='과목코드' value={courseInfo.code} />
      </CardContent>
    </StyledCard>
  )

  const renderRepoDetailIcons = (icon, value) =>
    value > 0 && (
      <>
        <Box sx={{ mx: 1 }} />
        {icon}
        <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
          {value}
        </Typography>
      </>
    )

  const RenderRepoInfo = props => (
    <StyledCard>
      <CardContent>
        {/* <Typography variant='h6' gutterBottom>
          원격 저장소 정보
        </Typography> */}

        <Typography variant='h6' component='div' sx={{ mb: 2, fontWeight: '600', color: '#0072E5' }}>
          {props.name}
        </Typography>
        <Typography variant='body2' color='textSecondary' component='p' sx={{ mb: 2 }}>
          {props.description || 'No description'}
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
              backgroundColor: languageColors[props.language] || '#000',
              display: 'inline-block',
              mr: 1
            }}
          />
          <Typography variant='subtitle2' component='span'>
            {props.language || 'No info'}
          </Typography>
          {renderRepoDetailIcons(<Star sx={{ verticalAlign: 'middle' }} />, props.stars)}
          {renderRepoDetailIcons(<ForkRight sx={{ verticalAlign: 'middle' }} />, props.forks)}
          {renderRepoDetailIcons(<Visibility sx={{ verticalAlign: 'middle' }} />, props.watchers)}
          <Box sx={{ mx: 1 }}> | </Box>
          <Typography variant='subtitle2' component='span'>
            Updated
          </Typography>
          <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
            {new Date(props.updatedAt).toLocaleDateString()}
          </Typography>
          {props.license && (
            <>
              <Box sx={{ mx: 1 }} />
              <Typography variant='subtitle2' component='span'>
                {props.license}
              </Typography>
            </>
          )}
        </Typography>
        <Typography variant='body2' sx={{ mb: 2 }}>
          <Link href={props.htmlUrl} target='_blank' rel='noopener noreferrer' color='primary'>
            GitHub로 이동
          </Link>
        </Typography>
      </CardContent>
    </StyledCard>
  )

  return (
    <Box>
      <RenderUserInfo {...query} />
      <RenderCourseInfo />
      <RenderRepoInfo {...query} />
    </Box>
  )
}

function CreateDocumentForm({ projectInfo, setProjectInfo, generateDoc, setGenerate }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const url = `http://localhost:8001/summarize/Gen/${encodeURIComponent(
      projectInfo.projectTitle
    )}/${encodeURIComponent(projectInfo.technologiesUsed)}/${encodeURIComponent(projectInfo.problemToSolve)}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setGenerate(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch the project generateDoc. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label='Project Title'
        fullWidth
        variant='outlined'
        value={projectInfo.projectTitle}
        onChange={e => setProjectInfo({ ...projectInfo, projectTitle: e.target.value })}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label='Technologies Used'
        fullWidth
        variant='outlined'
        value={projectInfo.technologiesUsed}
        onChange={e => setProjectInfo({ ...projectInfo, technologiesUsed: e.target.value })}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label='Problem to Solve'
        fullWidth
        multiline
        minRows={4}
        variant='outlined'
        value={projectInfo.problemToSolve}
        onChange={e => setProjectInfo({ ...projectInfo, problemToSolve: e.target.value })}
        required
        sx={{ mb: 2 }}
      />
      <Button type='submit' variant='contained' color='primary' disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : 'Generate Summary'}
      </Button>
      {error && <Typography color='error'>{error}</Typography>}
      {generateDoc.project_title && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Generated Summary:</Typography>
          <Typography>
            <strong>Project Title:</strong> {generateDoc.project_title}
          </Typography>
          <Typography>
            <strong>Background:</strong> {generateDoc.background}
          </Typography>
          <Typography>
            <strong>Development Content:</strong> {generateDoc.development_content}
          </Typography>
          <Typography>
            <strong>Expected Effects:</strong> {generateDoc.expected_effects}
          </Typography>
        </Box>
      )}
    </form>
  )
}

function SummaryAndImage({ generateDoc, setGenerate, combinedSummary, setCombinedSummary, image, setImage }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSummarizeAndGenerateImage = async () => {
    setIsLoading(true)
    setError('')

    const sections = {
      background: generateDoc.background,
      development_content: generateDoc.development_content,
      expected_effects: generateDoc.expected_effects
    }

    try {
      const summaries = await Promise.all(
        Object.entries(sections).map(([key, text]) =>
          fetch('http://localhost:8001/summarize/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          }).then(response => (response.ok ? response.json() : Promise.reject(`Failed to summarize ${key}`)))
        )
      )

      const fullSummary = summaries.map(s => s.summary).join(' ')
      setCombinedSummary(fullSummary)

      const imageResponse = await fetch('http://localhost:8001/generate-image/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullSummary })
      })

      if (!imageResponse.ok) {
        throw new Error(`HTTP error! Status: ${imageResponse.status}`)
      }

      const imageData = await imageResponse.json()
      setImage(`data:image/jpeg;base64,${imageData.base64_image}`) // Store as a single base64 string

      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to process text or generate image. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant='h6'>Original Content and Summaries:</Typography>
      <Typography>
        <strong>Project Title:</strong> {generateDoc.project_title}
      </Typography>
      <Typography>
        <strong>Background:</strong> {generateDoc.background}
      </Typography>
      <Typography>
        <strong>Development Content:</strong> {generateDoc.development_content}
      </Typography>
      <Typography>
        <strong>Expected Effects:</strong> {generateDoc.expected_effects}
      </Typography>
      <Button onClick={handleSummarizeAndGenerateImage} disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : 'Summarize and Generate Image'}
      </Button>
      {error && <Typography color='error'>{error}</Typography>}
      {combinedSummary && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Combined Summary:</Typography>
          <Typography>{combinedSummary}</Typography>
        </Box>
      )}
      {image && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Generated Image:</Typography>
          <img src={image} alt='Generated' style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>
      )}
    </Box>
  )
}

export default function ProjectGenerator() {
  const [tabIndex, setTabIndex] = useState(0)

  const [projectInfo, setProjectInfo] = useState({
    projectTitle: '',
    technologiesUsed: '',
    problemToSolve: ''
  })
  const [generateDoc, setGenerate] = useState({})
  const [combinedSummary, setCombinedSummary] = useState('')
  const [image, setImage] = useState('')
  const [courseInfo, setCourseInfo] = useState({})
  const [studentId, setStudentId] = useState('')

  const router = useRouter()

  useEffect(() => {
    if (router.query && router.query.course) {
      setCourseInfo(router.query)
      setStudentId(router.query.studentId)
      fetchCourseInfo(router.query.course)
    }
  }, [router.query])

  const fetchCourseInfo = async courseCode => {
    if (!courseCode) return
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}`)
      setCourseInfo(response.data)
    } catch (error) {
      console.error('Error fetching course info:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  const handleSaveDocument = async () => {
    const {
      name,
      description,
      language,
      stars,
      updatedAt,
      license,
      forks,
      watchers,
      contributors,
      private: isPrivate,
      html_url: htmlUrl,
      defaultBranch,
      userId,
      username
    } = router.query

    const projectData = {
      username: username,
      student_id: studentId, // 추가된 항목
      course: courseInfo.name
        ? `${courseInfo.name} - ${courseInfo.professor} (${courseInfo.day} ${courseInfo.time})`
        : 'Unknown', // 추가된 항목
      course_code: courseInfo.code, // 추가된 항목
      project_name: name,

      description: description || 'No description available',
      language: language || 'Unknown',
      stars: parseInt(stars, 10),
      updated_at: updatedAt,
      license: license || 'None',

      forks: parseInt(forks, 10),
      watchers: parseInt(watchers, 10),
      contributors: contributors || 'None',
      is_private: isPrivate === 'true',
      default_branch: defaultBranch || 'main',

      repository_url: htmlUrl,
      text_extracted: combinedSummary,
      summary: combinedSummary,
      image_preview_urls: [],
      generated_image_url: image,

      views: 0,
      comments: []
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/save-project/', projectData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('Document saved:', response.data)
      alert('Document saved successfully!')
      router.push('/')
    } catch (error) {
      console.error('Failed to save document:', error)
      alert('Failed to save document!')
    }
  }

  return (
    <Container maxWidth='md'>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label='project tabs'>
        <Tab label='Repository Info' />
        <Tab label='Create Document' />
        <Tab label='Summary and Image' />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        <RepositoryInfo courseInfo={courseInfo} studentId={studentId} />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <CreateDocumentForm
          projectInfo={projectInfo}
          setProjectInfo={setProjectInfo}
          generateDoc={generateDoc}
          setGenerate={setGenerate}
        />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <SummaryAndImage
          generateDoc={generateDoc}
          setGenerate={setGenerate}
          combinedSummary={combinedSummary}
          setCombinedSummary={setCombinedSummary}
          image={image}
          setImage={setImage}
        />
      </TabPanel>
      <Button onClick={handleSaveDocument} sx={{ mt: 2 }}>
        Save Document
      </Button>
    </Container>
  )
}
