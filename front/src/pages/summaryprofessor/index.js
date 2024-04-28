import React, { useState } from 'react'

export default function Component() {
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
    <div className='container'>
      <div className='form-container'>
        <h1 className='title'>Text Summary Generator</h1>
        <div className='category-buttons'>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleSelectCategory(category)}
              className={`category-button ${selectedCategories.includes(category) ? 'selected' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
        {selectedCategories.includes('기타') && (
          <input
            type='text'
            placeholder='Specify the "Other" category name'
            value={otherCategoryName}
            onChange={e => handleOtherCategoryNameChange(e.target.value)}
            className='category-input'
          />
        )}
        {selectedCategories.map(category => (
          <div key={category} className='category-form'>
            <input
              type='text'
              placeholder={`Enter text for ${category}`}
              value={inputs[category]}
              onChange={e => handleChange(category, e.target.value)}
              className='text-input'
            />
            <button onClick={() => handleSubmit(category)} disabled={isLoading} className='submit-button'>
              Submit
            </button>
            {isLoading && <div className='loader'></div>}
            {error && <p className='error-text'>{error}</p>}
            <p className='summary-text'>{summaries[category] || '결과를 기다리는 중입니다...'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
