import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { auth } from '../../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'

const popularCategories = [
  'JavaScript',
  'Python',
  'Java',
  'CSS',
  'HTML',
  'React',
  'Node.js',
  'Angular',
  'Vue.js',
  'SQL',
  '직접 입력'
]

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(popularCategories[0])
  const [customCategories, setCustomCategories] = useState([])
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [code, setCode] = useState('')
  const [userId, setUserId] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid)
      } else {
        setUserId('')
        console.error('No user is signed in')
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()

    const currentDate = new Date().toISOString()

    try {
      const classifyResponse = await fetch('http://127.0.0.1:8000/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: description })
      })

      if (!classifyResponse.ok) throw new Error('Failed to classify description')

      const { category } = await classifyResponse.json()

      const newQuestion = {
        title,
        description,
        category,
        customCategories,
        code,
        userId,
        createdAt: currentDate
      }

      const response = await fetch('http://127.0.0.1:8000/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuestion)
      })

      if (!response.ok) throw new Error('Failed to submit question')
      alert('Question submitted successfully')
      router.push('/question-answer')
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    }
  }

  const handleCategoryChange = e => {
    setCategory(e.target.value)
    if (e.target.value !== '직접 입력') {
      setCustomCategoryInput('')
    }
  }

  const handleAddCustomCategory = e => {
    if (e.key === 'Enter' && e.target.value) {
      setCustomCategories(prev => [...prev, e.target.value])
      e.target.value = ''
    }
  }

  const handleCodeChange = e => {
    setCode(e.target.value)
  }

  const handleDeleteCustomCategory = categoryToDelete => () => {
    setCustomCategories(prev => prev.filter(category => category !== categoryToDelete))
  }

  return (
    <Container maxWidth='sm' sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant='h4' component='h1' align='center' gutterBottom>
          질문 등록하기
        </Typography>
        <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label='제목'
            fullWidth
            margin='normal'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <TextField
            label='문제 설명'
            fullWidth
            multiline
            rows={4}
            margin='normal'
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            minLength={20}
          />
          <TextField
            label='코드 (선택)'
            fullWidth
            multiline
            rows={4}
            margin='normal'
            value={code}
            onChange={handleCodeChange}
            placeholder='코드를 입력하세요'
          />
          <FormControl fullWidth margin='normal'>
            {/* <InputLabel id='카테고리'>카테고리 선택</InputLabel>
            <Select value={category} onChange={handleCategoryChange}>
              {popularCategories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select> */}
          </FormControl>
          {/* {category === '직접 입력' && (
            <TextField
              label='카테고리'
              fullWidth
              margin='normal'
              value={customCategoryInput}
              onChange={e => setCustomCategoryInput(e.target.value)}
              onKeyPress={handleAddCustomCategory}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <IconButton edge='start' color='primary'>
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )} */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {customCategories.map(category => (
              <Chip
                key={category}
                label={category}
                onDelete={handleDeleteCustomCategory(category)}
                deleteIcon={<CancelIcon />}
                color='primary'
              />
            ))}
          </Box>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button type='submit' variant='contained' color='primary' fullWidth>
                질문 등록
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Link href='/question-answer' passHref>
                <Button variant='contained' color='secondary' fullWidth>
                  취소
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}
