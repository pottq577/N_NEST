import React, { useState } from 'react'
import { Container, TextField, Button, CircularProgress, Typography, Box } from '@mui/material'

export default function DynamicPromptingComponent() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [inputs, setInputs] = useState({})
  const [summaries, setSummaries] = useState({})
  const [otherCategoryName, setOtherCategoryName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['기술', '활용방안', '기대효과', '필요성', '기타']

  const handleSelectCategory = category => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category])
      setInputs({ ...inputs, [category]: '' })
      if (category === '기타') {
        setOtherCategoryName('')
      }
    }
  }

  const handleChange = (category, value) => {
    setInputs({ ...inputs, [category]: value })
  }

  const handleOtherCategoryNameChange = value => {
    setOtherCategoryName(value)
  }

  const handleSubmit = async category => {
    let finalCategory = category === '기타' ? otherCategoryName : category
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(
        `http://localhost:8000/summarize/${finalCategory}?text=${encodeURIComponent(inputs[category])}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setSummaries(prevSummaries => ({ ...prevSummaries, [category]: data.text || '결과가 없습니다' }))
      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch summary, please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Box my={4}>
        <Typography variant='h4' gutterBottom>
          Text Summary Generator
        </Typography>
        <Box display='flex' flexDirection='row' flexWrap='wrap' mb={2}>
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => handleSelectCategory(category)}
              variant={selectedCategories.includes(category) ? 'contained' : 'outlined'}
              sx={{ marginRight: 1, marginBottom: 1 }}
            >
              {category}
            </Button>
          ))}
        </Box>
        {selectedCategories.includes('기타') && (
          <TextField
            fullWidth
            label='Specify the "Other" category name'
            value={otherCategoryName}
            onChange={e => handleOtherCategoryNameChange(e.target.value)}
            variant='outlined'
            sx={{ mb: 2 }}
          />
        )}
        {selectedCategories.map(category => (
          <Box key={category} mb={2}>
            <TextField
              fullWidth
              label={`Enter text for ${category}`}
              value={inputs[category]}
              onChange={e => handleChange(category, e.target.value)}
              variant='outlined'
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Button
              onClick={() => handleSubmit(category)}
              variant='contained'
              color='primary'
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
            {isLoading && <CircularProgress />}
            {error && (
              <Typography color='error' sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Typography variant='body1'>{summaries[category] || '결과를 기다리는 중입니다...'}</Typography>
          </Box>
        ))}
      </Box>
    </Container>
  )
}
