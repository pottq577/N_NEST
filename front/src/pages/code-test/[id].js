import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Button, Container, Grid, MenuItem, Select, Typography } from '@mui/material'
import Editor from '@monaco-editor/react'

export default function SolveProblem() {
  const router = useRouter()
  const { id } = router.query
  const [problem, setProblem] = useState(null)
  const [code, setCode] = useState('// Write your code here')
  const [language, setLanguage] = useState('python')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProblem = async () => {
      if (router.isReady) {
        try {
          const response = await fetch(`http://localhost:8000/problems/${id}`)
          if (response.ok) {
            const data = await response.json()
            setProblem(data)
          } else {
            console.error('Failed to fetch problem', response.statusText)
          }
        } catch (err) {
          console.error('Error fetching problem:', err)
        }
      }
    }

    fetchProblem()
  }, [id, router.isReady])

  const submitCode = async () => {
    const response = await fetch('http://localhost:8000/submissions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: id,
        user_id: 'example_user_id', // 실제로는 인증된 사용자 ID를 사용해야 합니다.
        code,
        language
      })
    })
    const data = await response.json()
    if (data.error) {
      setError(data.error)
    } else {
      setResult(data)
      setError('')
    }
  }

  const renderProblemDetail = (title, content) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant='h6'>{title}</Typography>
      <Typography variant='body1'>{content}</Typography>
    </Box>
  )

  const renderResultDetail = (label, value) => (
    <Typography>
      <Typography component='span' sx={{ fontWeight: 'bold' }}>
        {label}:
      </Typography>{' '}
      {value}
    </Typography>
  )

  if (!problem) return <div>Loading...</div>

  return (
    <Container maxWidth='md'>
      <Box sx={{ mt: 4 }}>
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            {problem.title}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {renderProblemDetail('문제 설명', problem.description)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProblemDetail('입력 설명', problem.input_description)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProblemDetail('출력 설명', problem.output_description)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProblemDetail('입력 샘플', <pre>{problem.sample_input}</pre>)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderProblemDetail('출력 샘플', <pre>{problem.sample_output}</pre>)}
            </Grid>
          </Grid>
          <Editor height='50vh' language={language} value={code} onChange={value => setCode(value)} />
          <Box sx={{ mt: 2 }}>
            <Select value={language} onChange={e => setLanguage(e.target.value)} fullWidth>
              <MenuItem value='python'>Python</MenuItem>
              <MenuItem value='javascript'>JavaScript</MenuItem>
              {/* 필요한 다른 언어도 추가할 수 있습니다. */}
            </Select>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant='contained' color='primary' onClick={submitCode} fullWidth>
            Submit
          </Button>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant='h6'>Result:</Typography>
          {result ? (
            <Box>
              {renderResultDetail('Status', result.is_correct ? '성공' : '실패')}
              {renderResultDetail('Stdout', result.stdout)}
              {renderResultDetail('Time', `${result.time} seconds`)}
              {renderResultDetail('Memory', `${result.memory} bytes`)}
              {result.stderr && renderResultDetail('Stderr', result.stderr)}
              {result.compile_output && renderResultDetail('Compile Output', result.compile_output)}
              {result.message && renderResultDetail('Message', result.message)}
            </Box>
          ) : (
            <Typography>No result yet</Typography>
          )}
          {error && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='h6'>Error:</Typography>
              <pre>{error}</pre>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  )
}
