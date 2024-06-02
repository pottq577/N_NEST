import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Container, Button, TextField, Card, CardContent, Avatar, Link } from '@mui/material'
import { useRouter } from 'next/router'
import mammoth from 'mammoth'
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

// const StyledPaper = styled(Paper)(() => ({
//   padding: '20px',
//   textAlign: 'center',
//   border: '2px dashed #ccc',
//   cursor: 'pointer',
//   backgroundColor: '#f0f0f0',
//   height: '200px',
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   marginBottom: '20px'
// }))
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  border: '2px dashed #ccc',
  cursor: 'pointer',
  backgroundColor: '#f0f0f0',
  height: 'auto', // 자동으로 높이 조정
  display: 'flex',
  flexDirection: 'column', // 수직 정렬을 위해 추가
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}))

const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c'
}

export default function UploadDocument() {
  const [text, setText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [images, setImages] = useState([])
  const [repoInfo, setRepoInfo] = useState({})
  const [summary, setSummary] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [studentId, setStudentId] = useState('')
  const [course, setCourse] = useState('')
  const [courseInfo, setCourseInfo] = useState({}) // 수업 정보를 저장할 상태 추가
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isTextDropped, setIsTextDropped] = useState(false)
  const [isImageDropped, setIsImageDropped] = useState(false)

  useEffect(() => {
    if (router.query && router.query.course) {
      setRepoInfo(router.query)
      setUserId(router.query.userId)
      setUsername(router.query.username)
      setStudentId(router.query.studentId)
      setCourse(router.query.course)
      fetchCourseInfo(router.query.course) // 수업 정보 가져오기
    }
  }, [router.query])

  const fetchCourseInfo = async courseCode => {
    if (!courseCode) return
    try {
      const response = await axios.get(`http://localhost:8000/api/courses/${courseCode}`)
      setCourseInfo(response.data)
    } catch (error) {
      console.error('Error fetching course info:', error)
    }
  }

  const handleGenerateSummaryAndImage = async () => {
    try {
      const summaryResponse = await axios.post('http://localhost:8000/generate-summary/', { text: editedText })
      setSummary(summaryResponse.data.summary)

      const imageResponse = await axios.post('http://localhost:8000/generate-image/', { prompt: editedText })
      if (imageResponse.data.base64_image) {
        setGeneratedImage(`data:image/jpeg;base64,${imageResponse.data.base64_image}`)
      } else {
        setGeneratedImage(imageResponse.data.image_url)
      }
    } catch (error) {
      console.error('Error generating summary or image:', error)
    }
  }

  const handleTextDrop = async event => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    handleTextFile(file)
    setIsTextDropped(true) // 문서 드롭 완료 상태로 설정
  }

  const handleTextFile = async file => {
    if (!file) {
      console.error('No file selected.')

      return
    }

    const fileContent = await readFile(file)
    const result = await extractTextFromDocx(fileContent)
    setText(result.text)
    setEditedText(result.text)
  }

  const handleImageDrop = async event => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    handleImageFile(file)
    setIsImageDropped(true) // 이미지 드롭 완료 상태로 설정
  }

  const handleImageFile = async file => {
    if (!file) {
      console.error('No file selected.')

      return
    }

    const base64Image = await convertToBase64(file)
    setImages(prevImages => [...prevImages, base64Image])
  }

  const convertToBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const readFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = event => resolve(event.target.result)
      reader.onerror = error => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  const extractTextFromDocx = async fileContent => {
    const result = await mammoth.extractRawText({ arrayBuffer: fileContent })

    return { text: result.value }
  }

  const handleDeleteImage = index => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index))
  }

  const handleTextChange = event => {
    setEditedText(event.target.value)
  }

  const handleSaveTextChanges = () => {
    setText(editedText)
  }

  const handleSaveDocument = async () => {
    const projectData = {
      username: username,
      student_id: studentId,
      course: `${courseInfo.name} - ${courseInfo.professor} (${courseInfo.day} ${courseInfo.time})`, // 수업 정보 저장
      course_code: courseInfo.code, // 수업 코드 저장
      project_name: repoInfo.name,

      description: repoInfo.description || 'No description available',
      language: repoInfo.language || 'Unknown',
      stars: parseInt(repoInfo.stars, 10),
      updated_at: repoInfo.updatedAt,
      license: repoInfo.license || 'None',

      forks: parseInt(repoInfo.forks, 10),
      watchers: parseInt(repoInfo.watchers, 10),
      contributors: repoInfo.contributors || 'None',
      is_private: repoInfo.private ? (repoInfo.private.toLowerCase() === 'no' ? false : true) : false,
      default_branch: repoInfo.defaultBranch || 'main',

      repository_url: repoInfo.html_url,
      text_extracted: text,
      summary: summary,
      image_preview_urls: images,
      generated_image_url: generatedImage,

      views: 0,
      comments: []
    }

    console.log('Project Data:', projectData) // 디버깅을 위해 추가

    try {
      const response = await axios.post('http://localhost:8000/save-project/', projectData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('Document saved:', response.data)
      alert('Document saved successfully!')
      router.push('http://localhost:3000/')
    } catch (error) {
      console.error('Failed to save document:', error)
      alert('Failed to save document!')
    }
  }

  const RenderUserInfo = () => (
    <StyledCard>
      <Avatar sx={{ bgcolor: 'primary.main', marginRight: 2 }}>{username.charAt(0).toUpperCase()}</Avatar>
      <CardContent>
        <Typography variant='h6'>{username}</Typography>
        <Typography variant='body2' color='textSecondary'>
          <strong>User ID:</strong> {userId}
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          <strong>Student ID:</strong> {studentId}
        </Typography>
      </CardContent>
    </StyledCard>
  )

  const InfoRow = ({ label, value }) => (
    <Typography>
      <strong>{label}:</strong> {value}
    </Typography>
  )

  const RenderCourseInfo = () => (
    <StyledCard>
      <CardContent>
        <InfoRow
          label='과목'
          value={
            courseInfo.name
              ? `${courseInfo.name} - ${courseInfo.professor} (${courseInfo.day} ${courseInfo.time})`
              : 'None'
          }
        />
        <InfoRow label='과목코드' value={courseInfo.code || 'None'} />
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

  const RenderRepoInfo = () => (
    <StyledCard>
      <CardContent>
        <Typography variant='h6' component='div' sx={{ mb: 2, fontWeight: '600', color: '#0072E5' }}>
          {repoInfo.name}
        </Typography>
        <Typography variant='body2' color='textSecondary' component='p' sx={{ mb: 2 }}>
          {repoInfo.description || 'No description'}
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
              backgroundColor: languageColors[repoInfo.language] || '#000',
              display: 'inline-block',
              mr: 1
            }}
          />
          <Typography variant='subtitle2' component='span'>
            {repoInfo.language || 'No info'}
          </Typography>
          {renderRepoDetailIcons(<Star sx={{ verticalAlign: 'middle' }} />, repoInfo.stars)}
          {renderRepoDetailIcons(<ForkRight sx={{ verticalAlign: 'middle' }} />, repoInfo.forks)}
          {renderRepoDetailIcons(<Visibility sx={{ verticalAlign: 'middle' }} />, repoInfo.watchers)}
          <Box sx={{ mx: 1 }} />
          <Typography variant='subtitle2' component='span'>
            Updated
          </Typography>
          <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
            {new Date(repoInfo.updatedAt).toLocaleDateString()}
          </Typography>
          {repoInfo.license !== 'No license' && (
            <>
              <Box sx={{ mx: 1 }} />
              <Typography variant='subtitle2' component='span'>
                {repoInfo.license}
              </Typography>
            </>
          )}
        </Typography>
        <Typography variant='body2' sx={{ mb: 2 }}>
          <Link href={repoInfo.html_url} target='_blank' rel='noopener noreferrer' color='primary'>
            GitHub로 이동
          </Link>
        </Typography>
      </CardContent>
    </StyledCard>
  )

  return (
    <Container maxWidth='sm'>
      <Box my={4}>
        <RenderUserInfo />
        <RenderCourseInfo />
        <RenderRepoInfo />

        <Box id='docDetail'>
          <StyledPaper onDrop={handleTextDrop} onDragOver={e => e.preventDefault()}>
            {!isTextDropped ? (
              <Typography variant='h5' sx={{ marginBottom: '10px' }}>
                문서를 이곳에 끌어오세요
              </Typography>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={10}
                variant='outlined'
                value={editedText}
                onChange={handleTextChange}
                sx={{
                  marginBottom: '20px',
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f0f0f0' // StyledPaper 배경색과 맞춤
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent' // 테두리 제거
                  }
                }}
              />
            )}
            {isTextDropped && (
              <Button variant='contained' onClick={handleSaveTextChanges} sx={{ marginTop: '10px' }}>
                수정 사항 저장
              </Button>
            )}
          </StyledPaper>

          <StyledPaper onDrop={handleImageDrop} onDragOver={e => e.preventDefault()}>
            {!isImageDropped ? (
              <Typography variant='h5' sx={{ marginBottom: '10px' }}>
                이미지를 이곳에 끌어오세요
              </Typography>
            ) : (
              <Box display='flex' flexDirection='row' flexWrap='wrap'>
                {images.map((base64Image, index) => (
                  <Box key={index} sx={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
                    <img src={base64Image} alt={`Image ${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                    <Button
                      variant='contained'
                      color='error'
                      onClick={() => handleDeleteImage(index)}
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </StyledPaper>
        </Box>

        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateSummaryAndImage}
          sx={{ marginBottom: '20px' }}
        >
          요약 작성 & 이미지 생성
        </Button>
        <Typography variant='h6' gutterBottom>
          요약
        </Typography>
        <Typography>{summary || 'No summary available'}</Typography>
        <Typography variant='h6' gutterBottom>
          생성된 이미지
        </Typography>
        {generatedImage && <img src={generatedImage} alt='Generated' style={{ width: '100%', height: 'auto' }} />}
        <Button variant='contained' color='primary' onClick={handleSaveDocument} sx={{ marginTop: '20px' }}>
          Save Document
        </Button>
      </Box>
    </Container>
  )
}
