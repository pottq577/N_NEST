import React, { useState } from 'react'
import { Box, Typography, Paper, Container, Button, TextField } from '@mui/material'
import mammoth from 'mammoth'

export default function UploadDocument() {
  const [text, setText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [images, setImages] = useState([])

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
      reader.onload = event => {
        resolve(event.target.result)
      }
      reader.onerror = error => {
        reject(error)
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const extractTextFromDocx = async fileContent => {
    const result = await mammoth.extractRawText({ arrayBuffer: fileContent })
    return { text: result.value }
  }

  const handleDeleteImage = index => {
    setImages(prevImages => prevImages.filter((image, i) => i !== index))
  }

  const handleTextChange = event => {
    setEditedText(event.target.value)
  }

  const handleSaveTextChanges = () => {
    setText(editedText)
  }

  return (
    <Container maxWidth='sm'>
      <Box my={4}>
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
        <Button variant='contained' color='primary' sx={{ marginTop: '20px' }}>
          Save Document
        </Button>
      </Box>
    </Container>
  )
}
