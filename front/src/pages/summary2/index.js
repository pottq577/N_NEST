import { useState } from 'react'

export default function Component() {
  const [introduction, setIntroduction] = useState('')
  const [body, setBody] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [finalSummary, setFinalSummary] = useState('')
  const [imageBase64, setImageBase64] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const summaryIntro = await fetchSummary(introduction, 'Introduction')
      const summaryBody = await fetchSummary(body, 'Body')
      const summaryConclusion = await fetchSummary(conclusion, 'Conclusion')
      const combinedSummary = `${summaryIntro} ${summaryBody} ${summaryConclusion}`
      const finalSummaryText = await fetchSummary(combinedSummary, 'finalsum')

      setFinalSummary(finalSummaryText)
      const imageResponse = await handleImageGeneration(finalSummaryText)

      setImageBase64(imageResponse.base64_image)

      await saveSummaryData({
        finalSummary: finalSummaryText,
        imageData: imageResponse.base64_image
      })

      setIsLoading(false)
      setIntroduction('')
      setBody('')
      setConclusion('')
      setImageBase64('')
    } catch (error) {
      console.error('Error:', error)
      setIsLoading(false)
    }
  }

  const saveSummaryData = async data => {
    try {
      const response = await fetch('http://127.0.0.1:8001/saveSummary', {
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
    const response = await fetch(`http://127.0.0.1:8001/summarize/${section}?text=${encodeURIComponent(text)}`, {
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
      const response = await fetch('http://127.0.0.1:8001/generate-image/', {
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
    <div className='container'>
      <div className='form-container'>
        <h1 className='title'>Automated Essay Summarizer</h1>
        <form onSubmit={handleSubmit}>
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
          <button className='submit-button' disabled={isLoading}>
            Summarize and Generate Image
          </button>
          {isLoading && <div className='loading-icon'></div>}
        </form>
      </div>
    </div>
  )
}

function TextareaField({ label, placeholder, value, onChange }) {
  return (
    <div className='textarea-container'>
      <label>{label}</label>
      <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}></textarea>
    </div>
  )
}
