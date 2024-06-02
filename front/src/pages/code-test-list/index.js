import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material'

export default function ProblemsList() {
  const [problems, setProblems] = useState([])

  const fetchProblems = async () => {
    const response = await fetch('http://localhost:8000/problems/')
    const data = await response.json()
    setProblems(data)
  }

  useEffect(() => {
    fetchProblems()
  }, [])

  return (
    <Container>
      <Typography variant='h4' component='h1' gutterBottom>
        문제 목록
      </Typography>
      <Grid container spacing={4}>
        {problems.map(problem => (
          <Grid item key={problem._id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' component='h2'>
                  {problem.title}
                </Typography>
                <Button variant='contained' color='primary' sx={{ mt: 5 }}>
                  <Link href={`/code-test/${problem._id}`}>
                    <a style={{ color: 'inherit', textDecoration: 'none' }}>문제 보기</a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
