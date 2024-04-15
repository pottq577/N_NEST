import React, { useState } from 'react'

export default function Component() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [inputs, setInputs] = useState({})
  const [summaries, setSummaries] = useState({})
  const [otherCategoryName, setOtherCategoryName] = useState('') // "기타" 카테고리의 사용자 정의 이름
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['기술', '활용방안', '기대효과', '필요성', '기타']

  const handleSelectCategory = category => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category])
      setInputs({ ...inputs, [category]: '' })
      if (category === '기타') {
        setOtherCategoryName('') // "기타" 카테고리 선택 시 초기화
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
    let finalCategory = category === '기타' ? otherCategoryName : category // "기타"가 선택된 경우, 사용자 정의 이름 사용
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
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch summary, please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl'>
        <h1 className='text-3xl font-bold text-center text-gray-800 mb-8'>Text Summary Generator</h1>
        <div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleSelectCategory(category)}
              className='m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              {category}
            </button>
          ))}
        </div>
        {selectedCategories.includes('기타') && (
          <div className='mt-4'>
            <input
              type='text'
              placeholder='Specify the "Other" category name'
              value={otherCategoryName}
              onChange={e => handleOtherCategoryNameChange(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded shadow'
            />
          </div>
        )}
        {selectedCategories.map(category => (
          <div key={category} className='mt-4'>
            <input
              type='text'
              placeholder={`Enter text for ${category}`}
              value={inputs[category]}
              onChange={e => handleChange(category, e.target.value)}
              className='w-full p-2 border border-gray-300 rounded shadow'
            />
            <button
              onClick={() => handleSubmit(category)}
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
            >
              Submit
            </button>
            {isLoading && <p>Loading...</p>}
            {error && <p className='text-red-500'>{error}</p>}
            <p className='mt-2 p-2 bg-gray-100 border border-gray-300 rounded'>
              {summaries[category] || '결과를 기다리는 중입니다...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
