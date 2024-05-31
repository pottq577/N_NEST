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
  Paper,
  LinearProgress
} from '@mui/material'
import { useRouter } from 'next/router'
import axios from 'axios'

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

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        User Information
      </Typography>
      <Typography>
        <strong>User ID:</strong> {userId}
      </Typography>
      <Typography>
        <strong>Username:</strong> {username}
      </Typography>
      <Typography>
        <strong>Student ID:</strong> {studentId}
      </Typography>
      <Typography variant='h6' gutterBottom>
        Course Information
      </Typography>
      <Typography>
        <strong>Course:</strong> {courseInfo.name}-{courseInfo.professor} ({courseInfo.day} {courseInfo.time} || 'None')
      </Typography>
      <Typography>
        <strong>Course Code:</strong> {courseInfo.code || 'None'}
      </Typography>
      <Typography variant='h6' gutterBottom>
        Repository Information
      </Typography>
      <Typography>
        <strong>Name:</strong> {name}
      </Typography>
      <Typography>
        <strong>Description:</strong> {description || 'No description'}
      </Typography>
      <Typography>
        <strong>Language:</strong> {language || 'No info'}
      </Typography>
      <Typography>
        <strong>Stars:</strong> {stars}
      </Typography>
      <Typography>
        <strong>Last Updated:</strong> {new Date(updatedAt).toLocaleDateString()}
      </Typography>
      <Typography>
        <strong>License:</strong> {license || 'No license'}
      </Typography>
      <Typography>
        <strong>Forks:</strong> {forks}
      </Typography>
      <Typography>
        <strong>Watchers:</strong> {watchers}
      </Typography>
      <Typography>
        <strong>Contributors:</strong> {contributors}
      </Typography>
      <Typography>
        <strong>Private:</strong> {isPrivate}
      </Typography>
      <Typography>
        <strong>Default Branch:</strong> {defaultBranch}
      </Typography>
      <Typography>
        <strong>Repository URL:</strong>{' '}
        <a href={htmlUrl} target='_blank' rel='noopener noreferrer'>
          {htmlUrl}
        </a>
      </Typography>
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
      const response = await axios.get(url)
      setGenerate(response.data)
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

function SummaryAndImage({
  generateDoc,
  setGenerate,
  combinedSummary,
  setCombinedSummary,
  image,
  setImage,
  handleSaveDocument
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const handleSummarizeAndGenerateImage = async () => {
    setIsLoading(true)
    setError('')
    setProgress(0)

    const sections = {
      background: generateDoc.background,
      development_content: generateDoc.development_content,
      expected_effects: generateDoc.expected_effects
    }

    try {
      const requests = [
        axios.post('http://localhost:8001/summarize/', { text: sections.background }),
        axios.post('http://localhost:8001/summarize/', { text: sections.development_content }),
        axios.post('http://localhost:8001/summarize/', { text: sections.expected_effects }),
        axios.post('http://localhost:8001/generate-image/', {
          prompt: `${sections.background} ${sections.development_content} ${sections.expected_effects}`
        })
      ]

      const totalRequests = requests.length
      let completedRequests = 0

      const responses = await Promise.all(
        requests.map(request =>
          request.then(response => {
            completedRequests += 1
            setProgress(Math.floor((completedRequests / totalRequests) * 100))
            return response
          })
        )
      )

      const [backgroundSummary, developmentSummary, effectsSummary, imageResponse] = responses

      const fullSummary = `${backgroundSummary.data.summary} ${developmentSummary.data.summary} ${effectsSummary.data.summary}`
      setCombinedSummary(fullSummary)

      setImage(`data:image/jpeg;base64,${imageResponse.data.base64_image}`)

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
      {isLoading && <LinearProgress variant='determinate' value={progress} />}
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
      <Button onClick={handleSaveDocument} sx={{ mt: 2 }}>
        Save Document
      </Button>
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

    if (
      !generateDoc.project_title ||
      !generateDoc.background ||
      !generateDoc.development_content ||
      !generateDoc.expected_effects
    ) {
      alert('Extracted text is required to save the document.')
      return
    }

    const projectData = {
      username: username,
      student_id: studentId,
      course: courseInfo.name
        ? `${courseInfo.name} - ${courseInfo.professor} (${courseInfo.day} ${courseInfo.time})`
        : 'None',
      course_code: courseInfo.code || 'None',
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
      text_extracted: `Project Title: ${generateDoc.project_title}, Background: ${generateDoc.background}, Development Content: ${generateDoc.development_content}, Expected Effects: ${generateDoc.expected_effects}`,
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
      console.table(projectData)
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
          handleSaveDocument={handleSaveDocument}
        />
      </TabPanel>
    </Container>
  )
}
