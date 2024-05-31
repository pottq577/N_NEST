import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Container, Button, TextField } from '@mui/material'
import { useRouter } from 'next/router'
import mammoth from 'mammoth'
import axios from 'axios'

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
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}`)
      setCourseInfo(response.data)
    } catch (error) {
      console.error('Error fetching course info:', error)
    }
  }

  const handleGenerateSummaryAndImage = async () => {
    try {
      const summaryResponse = await axios.post('http://127.0.0.1:8001/generate-summary/', { text: editedText })
      setSummary(summaryResponse.data.summary)

      const imageResponse = await axios.post('http://127.0.0.1:8001/generate-image/', { prompt: editedText })
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
      const response = await axios.post('http://127.0.0.1:8000/save-project/', projectData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('Document saved:', response.data)
      alert('Document saved successfully!')
      router.push('http://127.0.0.1:3000/')
    } catch (error) {
      console.error('Failed to save document:', error)
      alert('Failed to save document!')
    }
  }

  return (
    <Container maxWidth='sm'>
      <Box my={4}>
        <Typography variant='h5' gutterBottom>
          User Information
        </Typography>
        <Typography variant='subtitle1'>User ID: {userId}</Typography>
        <Typography variant='subtitle1'>Username: {username}</Typography>
        <Typography variant='subtitle1'>Student ID: {studentId}</Typography> {/* 추가된 항목 */}
        <Typography variant='subtitle1'>
          Course: {courseInfo.name}-{courseInfo.professor} ({courseInfo.day} {courseInfo.time})
        </Typography>
        <Typography variant='subtitle1'>Course Code: {courseInfo.code}</Typography> {/* 수업 이름과 교수 정보 */}
        <Typography variant='h5' gutterBottom>
          Repository Information
        </Typography>
        <Typography variant='subtitle1'>Name: {repoInfo.name}</Typography>
        <Typography variant='subtitle1'>Description: {repoInfo.description}</Typography>
        <Typography variant='subtitle1'>Language: {repoInfo.language}</Typography>
        <Typography variant='subtitle1'>Stars: {repoInfo.stars}</Typography>
        <Typography variant='subtitle1'>Last Updated: {repoInfo.updatedAt}</Typography>
        <Typography variant='subtitle1'>License: {repoInfo.license}</Typography>
        <Typography variant='subtitle1'>Forks: {repoInfo.forks}</Typography>
        <Typography variant='subtitle1'>Watchers: {repoInfo.watchers}</Typography>
        <Typography variant='subtitle1'>Contributors: {repoInfo.contributors}</Typography>
        <Typography variant='subtitle1'>Private: {repoInfo.private}</Typography>
        <Typography variant='subtitle1'>Default Branch: {repoInfo.defaultBranch}</Typography>
        <Typography variant='subtitle1'>
          Repository URL:{' '}
          <a href={repoInfo.html_url} target='_blank' rel='noopener noreferrer'>
            {repoInfo.html_url}
          </a>
        </Typography>
        <Paper
          onDrop={handleTextDrop}
          onDragOver={e => e.preventDefault()}
          sx={{
            padding: '20px',
            textAlign: 'center',
            border: '2px dashed #ccc',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <Typography variant='h5' sx={{ marginBottom: '10px' }}>
            Drag & Drop to Upload Document
          </Typography>
        </Paper>
        <Paper
          onDrop={handleImageDrop}
          onDragOver={e => e.preventDefault()}
          sx={{
            padding: '20px',
            textAlign: 'center',
            border: '2px dashed #ccc',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <Typography variant='h5' sx={{ marginBottom: '10px' }}>
            Drag & Drop to Upload Image
          </Typography>
        </Paper>
        <Box>
          <Typography variant='body1' sx={{ marginTop: '20px' }}>
            Extracted Text:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant='outlined'
            value={editedText}
            onChange={handleTextChange}
            sx={{ marginBottom: '20px' }}
          />
          <Button variant='contained' onClick={handleSaveTextChanges} sx={{ marginRight: '10px' }}>
            Save Text Changes
          </Button>
          <Typography variant='body1' sx={{ marginTop: '20px' }}>
            Image Previews:
          </Typography>
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
        </Box>
        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateSummaryAndImage}
          sx={{ marginBottom: '20px' }}
        >
          Generate Summary and Image
        </Button>
        <Typography variant='h6' gutterBottom>
          Summary
        </Typography>
        <Typography>{summary || 'No summary available'}</Typography>
        <Typography variant='h6' gutterBottom>
          Generated Image
        </Typography>
        {generatedImage && <img src={generatedImage} alt='Generated' style={{ width: '100%', height: 'auto' }} />}
        <Button variant='contained' color='primary' onClick={handleSaveDocument} sx={{ marginTop: '20px' }}>
          Save Document
        </Button>
      </Box>
    </Container>
  )
}
