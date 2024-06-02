import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import TextareaAutosize from '@mui/material/TextareaAutosize'

import axios from 'axios'

import Header from '../components/Header'
import RenderList from '../components/RenderList'

const coverLetterPlaceholder = `자기소개서를 완성해보세요`

const InputForm = ({ title, setTitle, content, setContent, handleSaveClick, handleCancelClick, setFile }) => (
  <Grid container spacing={2}>
    <Grid item xs={8} md={8} my={3}>
      <TextField label='자기소개서 제목' fullWidth value={title} onChange={e => setTitle(e.target.value)} />
    </Grid>
    <Grid item xs={4} md={4} my={3}>
      <label>
        <input type='file' style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
        <Button
          variant='contained'
          color='info'
          component='span'
          style={{ height: '100%', justifyContent: 'flex-end' }}
        >
          자기소개서 첨부
        </Button>
      </label>
    </Grid>

    <Grid item md={12}>
      <TextareaAutosize
        style={{ width: '100%', minHeight: 130, padding: 10 }}
        placeholder={coverLetterPlaceholder}
        name='coverLetter'
        value={content}
        onChange={e => setContent(e.target.value)}
      />
    </Grid>

    <Grid item xs={12}>
      <Button style={{ marginRight: 10 }} variant='contained' onClick={handleSaveClick}>
        저장
      </Button>
      <Button variant='contained' onClick={handleCancelClick}>
        취소
      </Button>
    </Grid>
  </Grid>
)

const CoverLetterSection = ({ onComplete }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverLetters, setCoverLetters] = useState([])
  const [file, setFile] = useState(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const storedCoverLetters = JSON.parse(localStorage.getItem('coverLetters')) || []
    setCoverLetters(storedCoverLetters)
  }, [])

  const saveToLocalStorage = data => {
    localStorage.setItem('coverLetters', JSON.stringify(data))
  }

  const handleAddClick = () => {
    setIsAdding(true)
  }

  const handleSaveClick = async () => {
    const newCoverLetter = { title, content }
    const updatedCoverLetters = [...coverLetters, newCoverLetter]
    setCoverLetters(updatedCoverLetters)
    saveToLocalStorage(updatedCoverLetters)
    setTitle('')
    setContent('')
    setIsAdding(false)

    // 백엔드에 데이터 저장
    try {
      const response = await axios.post('http://localhost:8000/user-profile/cover-letter', {
        user_id: userId,
        cover_letters: updatedCoverLetters
      })
      if (response.status === 201) {
        console.log('Cover letter saved successfully')
      }
    } catch (error) {
      console.error('Error saving cover letter:', error)
    }

    onComplete('coverLetter', true)
  }

  const handleCancelClick = () => {
    setTitle('')
    setContent('')
    setIsAdding(false)
  }

  const handleEditCoverLetter = index => {
    const coverLetter = coverLetters[index]
    setTitle(coverLetter.title)
    setContent(coverLetter.content)
    setIsAdding(true)
    const remainingCoverLetters = coverLetters.filter((_, i) => i !== index)
    setCoverLetters(remainingCoverLetters)
    saveToLocalStorage(remainingCoverLetters)
  }

  const handleDeleteCoverLetter = async index => {
    const remainingCoverLetters = coverLetters.filter((_, i) => i !== index)
    setCoverLetters(remainingCoverLetters)
    saveToLocalStorage(remainingCoverLetters)

    // 백엔드에 데이터 삭제 요청
    try {
      const response = await axios.delete('http://localhost:8000/user-profile/cover-letter', {
        data: {
          // user_id: userId,
          cover_letters: remainingCoverLetters
        }
      })
      if (response.status === 200) {
        console.log('Cover letter deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting cover letter:', error)
    }
  }

  const coverLetterListText = (item, type) => {
    if (type === 'primary') {
      return `${item.title}`
    } else {
      return item.content
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'자기소개서'} isAdding={isAdding} handleAddClick={handleAddClick} />
      <Divider sx={{ mb: 2 }} />

      <Box style={{ minHeight: 100 }}>
        {isAdding && (
          <InputForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
            setFile={setFile}
          />
        )}
        <RenderList
          items={coverLetters}
          renderItemText={coverLetterListText}
          handleEdit={handleEditCoverLetter}
          handleDelete={handleDeleteCoverLetter}
          dividerCondition={(items, index) => items.length > 1 && index < items.length - 1}
          isAdding={isAdding}
          message={`자기소개서를 작성해주세요.`}
        />
      </Box>
    </Box>
  )
}

export default CoverLetterSection
