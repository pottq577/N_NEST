import { useState } from 'react'

export default function Component() {
  const [introduction, setIntroduction] = useState('')
  const [body, setBody] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [finalSummary, setFinalSummary] = useState('')
  const [imageBase64, setImageBase64] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const summaryIntro = await fetchSummary(introduction, 'Introduction')
      const summaryBody = await fetchSummary(body, 'Body')
      const summaryConclusion = await fetchSummary(conclusion, 'Conclusion')
      const combinedSummary = `${summaryIntro} ${summaryBody} ${summaryConclusion}`
      const finalSummaryText = await fetchSummary(combinedSummary, 'finalsum')

      setFinalSummary(finalSummaryText)
      const imageResponse = await handleImageGeneration(finalSummaryText)

      setImageBase64(imageResponse.base64_image) // Use base64 image directly

      await saveSummaryData({
        finalSummary: finalSummaryText,
        imageData: imageResponse.base64_image // 이미지를 base64 형식으로 저장합니다.
      })

      // 초기화 코드 추가
      setIntroduction('')
      setBody('')
      setConclusion('')
      setImageBase64('')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const saveSummaryData = async data => {
    try {
      const response = await fetch('http://127.0.0.2:8000/saveSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          finalSummary: data.finalSummary,
          imageData: data.imageData
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to save summary data, server responded with status ${response.status}`)
      }

      const responseData = await response.json()
      console.log('Data saved successfully:', responseData)
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const fetchSummary = async (text, section) => {
    const response = await fetch(`http://127.0.0.1:8000/summarize/${section}?text=${encodeURIComponent(text)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const result = await response.json()

    return result.text
  }

  const handleImageGeneration = async text => {
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: text })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const result = await response.json()
      console.log('Image generation result:', result)
      if (!result.base64_image) {
        throw new Error('Base64 image not found in response')
      }
      setImageBase64(result.base64_image) // Use base64 image directly

      return result
    } catch (error) {
      console.error('Failed to generate image:', error)
      throw error
    }
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-xl'>
        <h1 className='text-5xl font-bold text-center text-gray-800 mb-8'>Automated Essay Summarizer</h1>
        <form className='space-y-10' onSubmit={handleSubmit}>
          <TextareaField
            label='Introduction'
            placeholder='Type your introduction here.'
            value={introduction}
            onChange={setIntroduction}
          />
          <TextareaField label='Body' placeholder='Type your body here.' value={body} onChange={setBody} />
          <TextareaField
            label='Conclusion'
            placeholder='Type your conclusion here.'
            value={conclusion}
            onChange={setConclusion}
          />
          <button type='submit' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
            Summarize and Generate Image
          </button>
        </form>
        {imageBase64 && (
          <div className='mt-8 text-center'>
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt='Generated'
              className='inline-block max-w-full h-auto rounded-lg shadow'
            />
            {finalSummary && <p className='mt-4 bg-gray-100 border border-gray-300 rounded-lg p-4'>{finalSummary}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function TextareaField({ label, placeholder, value, onChange }) {
  return (
    <div className='space-y-3'>
      <label className='block text-lg font-semibold text-gray-700'>{label}</label>
      <textarea
        className='w-full h-32 px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500'
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      ></textarea>
    </div>
  )
}
