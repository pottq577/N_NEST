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
  LinearProgress,
  Paper,
  Link,
  Card,
  CardContent,
  Avatar
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import axios from 'axios'
import SaveIcon from '@mui/icons-material/Save'
import SummarizeIcon from '@mui/icons-material/Summarize'
import ImageIcon from '@mui/icons-material/Image'
import InfoIcon from '@mui/icons-material/Info'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import { Star, ForkRight, Visibility } from '@mui/icons-material'

const CustomPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#fff',
  boxShadow: theme.shadows[3]
}))

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}))

const CustomTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}))

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
          <Box sx={{ mx: 1 }} />
          <Typography variant='subtitle2' component='span'>
            Updated
          </Typography>
          <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
            {new Date(props.updatedAt).toLocaleDateString()}
          </Typography>
          {props.license != 'No license' && (
            <>
              <Box sx={{ mx: 1 }} />
              <Typography variant='subtitle2' component='span'>
                {props.license}
              </Typography>
            </>
          )}
        </Typography>
        <Typography variant='body2' sx={{ mb: 2 }}>
          <Link href={props.html_url} target='_blank' rel='noopener noreferrer' color='primary'>
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
      <CustomTextField
        label='프로젝트 제목'
        fullWidth
        variant='outlined'
        value={projectInfo.projectTitle}
        onChange={e => setProjectInfo({ ...projectInfo, projectTitle: e.target.value })}
        required
      />
      <CustomTextField
        label='사용 기술'
        fullWidth
        variant='outlined'
        value={projectInfo.technologiesUsed}
        onChange={e => setProjectInfo({ ...projectInfo, technologiesUsed: e.target.value })}
        required
      />
      <CustomTextField
        label='주요 해결 과제'
        fullWidth
        multiline
        minRows={4}
        variant='outlined'
        value={projectInfo.problemToSolve}
        onChange={e => setProjectInfo({ ...projectInfo, problemToSolve: e.target.value })}
        required
      />
      <CustomButton
        type='제출'
        variant='contained'
        color='primary'
        startIcon={isLoading ? <CircularProgress size={24} /> : <SummarizeIcon />}
      >
        {isLoading ? '생성 중...' : '요약 생성'}
      </CustomButton>
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
  const [previewImages, setPreviewImages] = useState([])

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

  const handleImageChange = async event => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const base64Image = await convertToBase64(file)
      setPreviewImages(prevImages => [...prevImages, base64Image])
    }
  }

  const convertToBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <CustomPaper>
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
      <CustomButton onClick={handleSummarizeAndGenerateImage} disabled={isLoading} startIcon={<ImageIcon />}>
        {isLoading ? <CircularProgress size={24} /> : 'Summarize and Generate Image'}
      </CustomButton>
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
      <Box sx={{ mt: 2 }}>
        <input
          accept='image/*'
          id='image-upload'
          type='file'
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <label htmlFor='image-upload'>
          <CustomButton component='span' startIcon={<AddPhotoAlternateIcon />}>
            Add Image
          </CustomButton>
        </label>
      </Box>
      {previewImages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Additional Images:</Typography>
          {previewImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Preview ${index}`}
              style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
            />
          ))}
        </Box>
      )}
      <CustomButton onClick={handleSaveDocument} startIcon={<SaveIcon />}>
        Save Document
      </CustomButton>
    </CustomPaper>
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
  const [previewImages, setPreviewImages] = useState([])

  const router = useRouter()

  useEffect(() => {
    if (router.query && router.query.course) {
      if (router.query.course === 'None') {
        setCourseInfo({})
      } else {
        fetchCourseInfo(router.query.course)
      }
      setStudentId(router.query.studentId)
    }
  }, [router.query])

  const fetchCourseInfo = async courseCode => {
    if (!courseCode || courseCode === 'None') {
      setCourseInfo({})

      return
    }
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
      image_preview_urls: previewImages,
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
        <Tab label='Repository Info' icon={<InfoIcon />} />
        <Tab label='Create Document' icon={<SummarizeIcon />} />
        <Tab label='Summary and Image' icon={<ImageIcon />} />
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
