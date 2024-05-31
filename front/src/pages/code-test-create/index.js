import { useState } from 'react'
import { Box, Button, Container, Grid, TextField, Typography } from '@mui/material'

export default function CreateProblem() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [inputDescription, setInputDescription] = useState('')
  const [outputDescription, setOutputDescription] = useState('')
  const [sampleInput, setSampleInput] = useState('')
  const [sampleOutput, setSampleOutput] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    const problem = {
      title,
      description,
      input_description: inputDescription,
      output_description: outputDescription,
      sample_input: sampleInput,
      sample_output: sampleOutput
    }

    const response = await fetch('http://localhost:8000/problems/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problem)
    })

    if (response.ok) {
      alert('문제가 성공적으로 생성되었습니다.')

      // Reset form
      setTitle('')
      setDescription('')
      setInputDescription('')
      setOutputDescription('')
      setSampleInput('')
      setSampleOutput('')
    } else {
      alert('문제를 생성하는 데 실패했습니다.')
    }
  }

  const renderTextField = (label, value, setter, rows = 1) => (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={e => setter(e.target.value)}
      required
      margin='normal'
      multiline={rows > 1}
      rows={rows}
    />
  )

  return (
    <Container maxWidth='md'>
      <Typography variant='h4' component='h1' gutterBottom>
        코딩 테스트 문제 생성
      </Typography>
      <Box component='form' onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {renderTextField('제목', title, setTitle)}
        {renderTextField('문제 설명', description, setDescription, 4)}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderTextField('입력 설명', inputDescription, setInputDescription, 3)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField('출력 설명', outputDescription, setOutputDescription, 3)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField('입력 샘플', sampleInput, setSampleInput, 2)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField('출력 샘플', sampleOutput, setSampleOutput, 2)}
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button type='submit' variant='contained' color='primary' fullWidth>
            문제 생성
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
