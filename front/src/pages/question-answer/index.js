import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Pagination
} from '@mui/material'

const categories = [
  'All',
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
  '기타'
]

export default function QuestionListPage() {
  const [questions, setQuestions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const questionsPerPage = 10

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/list/questions')
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setQuestions(data)
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const indexOfLastQuestion = currentPage * questionsPerPage
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage
  const currentQuestions = questions
    .filter(question => selectedCategory === 'All' || question.category === selectedCategory)
    .slice(indexOfFirstQuestion, indexOfLastQuestion)

  const totalPages = Math.ceil(
    questions.filter(question => selectedCategory === 'All' || question.category === selectedCategory).length /
      questionsPerPage
  )

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>All Questions</Typography>
        <Link href='/question-ask' passHref>
          <Button variant='contained' color='primary'>
            Ask Question
          </Button>
        </Link>
      </Box>

      <Box display='flex' justifyContent='center' mb={4} flexWrap='wrap' gap={1}>
        {categories.map(category => (
          <Chip
            key={category}
            label={category}
            onClick={() => setSelectedCategory(category)}
            color={selectedCategory === category ? 'primary' : 'default'}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12} display='flex' justifyContent='center'>
            <CircularProgress />
          </Grid>
        ) : currentQuestions.length > 0 ? (
          currentQuestions.map(question => (
            <Grid item xs={12} key={question.id}>
              <Card>
                <CardContent>
                  <Link href={`/question-detail/${question.id}`} passHref>
                    <Typography variant='h6' component='a' color='primary' gutterBottom>
                      {question.title}
                    </Typography>
                  </Link>
                  <Box display='flex' flexWrap='wrap' mt={2}>
                    <Typography variant='body2' color='textSecondary' sx={{ marginRight: 2 }}>
                      {question.votes} votes
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ marginRight: 2 }}>
                      {question.answers ? question.answers.length : 0} answers
                    </Typography>
                    <Typography variant='body2' color='textSecondary' sx={{ marginRight: 2 }}>
                      {question.views} views
                    </Typography>
                    <Chip label={question.category} color='primary' />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>No questions found.</Typography>
          </Grid>
        )}
      </Grid>

      {totalPages > 1 && (
        <Box display='flex' justifyContent='center' mt={4}>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color='primary' />
        </Box>
      )}
    </Container>
  )
}
