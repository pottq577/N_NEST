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

const categories = ['All', 'frontend', 'backend', 'database', 'security', 'network', 'cloud', 'others']

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

  const QuestionsList = ({ question }) => (
    <Grid item xs={12} key={question.id}>
      <Card>
        <CardContent>
          <Grid container>
            <Grid
              item
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                mr: 5
              }}
            >
              <Typography variant='body2' color='textSecondary'>
                {question.votes ? question.votes.length : 0} votes
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {question.answers ? question.answers.length : 0} answers
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {question.views ? question.views.length : 0} views
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <Link href={`/question-detail/${question.id}`} passHref>
                <Typography variant='h6' component='a' color='primary' gutterBottom>
                  {question.title}
                </Typography>
              </Link>
              <Typography variant='subtitle2' gutterBottom>
                {question.description}
              </Typography>
              <Box display='flex' flexWrap='wrap' mt={2}>
                <Chip label={question.category} color='primary' />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  )

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>Q&A</Typography>
        <Link href='/question-ask' passHref>
          <Button variant='contained' color='primary'>
            질문하기
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
          currentQuestions.map(question => <QuestionsList key={question.index} question={question} />)
        ) : (
          <Grid item xs={12} display='flex' justifyContent='center' alignItems='center' minHeight='50vh'>
            <Typography variant='h6'>질문이 없습니다.</Typography>
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
