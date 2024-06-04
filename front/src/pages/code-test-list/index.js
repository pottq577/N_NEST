import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container, Grid, Card, CardContent, Typography, AppBar, Toolbar, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}))

const ProblemsList = () => {
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
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Problems List
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {problems.map(problem => (
            <Grid item xs={12} sm={6} md={4} key={problem._id}>
              <StyledCard>
                <CardContent>
                  <Typography variant='h6' component='div'>
                    <Link href={`/code-test/${problem._id}`}>
                      <a>{problem.title}</a>
                    </Link>
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    {problem.description}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default ProblemsList
