import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { auth } from '../../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Container, TextField, Button, Typography, Box, Paper, Grid } from '@mui/material'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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

  const handleCodeChange = e => {
    setCode(e.target.value)
  }

  return (
    <Container maxWidth='sm' sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant='h4' component='h1' align='center' gutterBottom>
          Ask a Question
        </Typography>
        <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label='Title'
            fullWidth
            margin='normal'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <TextField
            label='Description'
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
            label='Code (optional)'
            fullWidth
            multiline
            rows={4}
            margin='normal'
            value={code}
            onChange={handleCodeChange}
            placeholder='Insert code here if any...'
          />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button type='submit' variant='contained' color='primary' fullWidth>
                Submit Question
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Link href='/question-answer' passHref>
                <Button variant='contained' color='secondary' fullWidth>
                  Cancel
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}
