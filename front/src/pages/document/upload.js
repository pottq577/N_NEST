import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Container, Button, TextField } from '@mui/material'
import { useRouter } from 'next/router'
import mammoth from 'mammoth'
import axios from 'axios' // axios 추가

export default function UploadDocument() {
  const [text, setText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [images, setImages] = useState([])
  const [repoInfo, setRepoInfo] = useState({})
  const [summary, setSummary] = useState('') // 요약된 텍스트 상태
  const [generatedImage, setGeneratedImage] = useState('') // 생성된 이미지 URL 상태
  const [userId, setUserId] = useState('') // 사용자 ID 상태 추가
  const [username, setUsername] = useState('') // 사용자 이름 상태 추가
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (router.query) {
      setRepoInfo(router.query)
      setUserId(router.query.userId) // URL에서 사용자 ID 가져오기
      setUsername(router.query.username) // URL에서 사용자 이름 가져오기
    }
  }, [router.query])

  const handleGenerateSummaryAndImage = async () => {
    try {
      const summaryResponse = await axios.post('http://127.0.0.1:8001/generate-summary/', { text: editedText })
      setSummary(summaryResponse.data.summary)

      const imageResponse = await axios.post('http://127.0.0.1:8001/generate-image/', { prompt: editedText })
      // 이미지 URL을 Base64 인코딩된 데이터로 설정
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

    const imageUrl = URL.createObjectURL(file)
    setImages(prevImages => [...prevImages, imageUrl])
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
      userId: parseInt(userId, 10), // 숫자형으로 변환
      username: username,
      project_name: repoInfo.name,
      description: repoInfo.description || 'No description available', // 기본값 설정
      language: repoInfo.language || 'Unknown', // 기본값 설정
      stars: parseInt(repoInfo.stars, 10),
      updated_at: repoInfo.updatedAt,
      license: repoInfo.license ? repoInfo.license.name : 'None', // 기본값 설정
      forks: parseInt(repoInfo.forks, 10),
      watchers: parseInt(repoInfo.watchers, 10),
      contributors: repoInfo.contributors || 'None', // 기본값 설정
      is_private: repoInfo.is_private ? (repoInfo.is_private.toLowerCase() === 'no' ? false : true) : false, // 기본값 설정
      default_branch: repoInfo.defaultBranch || 'main', // 기본값 설정
      repository_url: repoInfo.html_url,
      text_extracted: text,
      summary: summary,
      image_preview_urls: images.join(', '), // 배열을 쉼표로 구분된 문자열로
      generated_image_url: generatedImage
    }

    /*console.log(userId)
    console.log(username)
    console.log(repoInfo.name)
    console.log(repoInfo.description)
    console.log(repoInfo.language)
    console.log(repoInfo.stars)
    console.log(repoInfo.updatedAt)
    console.log(repoInfo.license)
    console.log(repoInfo.forks)
    console.log(repoInfo.watchers)
    console.log(repoInfo.contributors)
    console.log(repoInfo.private)
    console.log(repoInfo.defaultBranch)
    console.log(repoInfo.html_url)
    console.log(text)
    console.log(summary)*/
    console.log(projectData)
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
        {/* 레포지토리 정보를 표시 */}
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
            {images.map((imageUrl, index) => (
              <Box key={index} sx={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
                <img src={imageUrl} alt={`Image ${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
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
        {/* 요약 및 이미지 생성 버튼 */}
        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateSummaryAndImage}
          sx={{ marginBottom: '20px' }}
        >
          Generate Summary and Image
        </Button>

        {/* 요약 텍스트 출력 */}
        <Typography variant='h6' gutterBottom>
          Summary
        </Typography>
        <Typography>{summary || 'No summary available'}</Typography>

        {/* 생성된 이미지 출력 */}
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
