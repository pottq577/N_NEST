import { useState } from 'react'

export default function Component() {
  const [introduction, setIntroduction] = useState('')
  const [body, setBody] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [introductionSummary, setIntroductionSummary] = useState('')
  const [bodySummary, setBodySummary] = useState('')
  const [conclusionSummary, setConclusionSummary] = useState('')
  const [imageURL, setImageURL] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const responseIntroduction = await fetchSummary(introduction, 'Introduction')
      setIntroductionSummary(responseIntroduction)
      const responseBody = await fetchSummary(body, 'Body')
      setBodySummary(responseBody)
      const responseConclusion = await fetchSummary(conclusion, 'Conclusion')
      setConclusionSummary(responseConclusion)

      // 모든 섹션의 요약이 완료된 후 이미지 생성 요청
      const combinedSummary = `${responseIntroduction} ${responseBody} ${responseConclusion}`
      handleImageGeneration(combinedSummary)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchSummary = async (text, section) => {
    const response = await fetch(`http://127.0.0.1:8000/summarize/${section}?text=${encodeURIComponent(text)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
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
      const result = await response.json()
      setImageURL(result.image_url)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-xl'>
        <h1 className='text-5xl font-bold text-center text-gray-800 mb-8'>Automated Essay Summarizer</h1>
        <p className='text-center text-lg text-gray-600 mb-8'>
          Enter your essay details below and get results instantly.
        </p>

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
            Summarize
          </button>
        </form>

        {introductionSummary && <SummaryField label='Introduction Summary' summary={introductionSummary} />}
        {bodySummary && <SummaryField label='Body Summary' summary={bodySummary} />}
        {conclusionSummary && <SummaryField label='Conclusion Summary' summary={conclusionSummary} />}
        {imageURL && (
          <div className='mt-8 text-center'>
            <img src={imageURL} alt='Generated' className='inline-block max-w-full h-auto rounded-lg shadow' />
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

function SummaryField({ label, summary }) {
  return (
    <div className='space-y-3 mt-8'>
      <h2 className='text-lg font-semibold text-gray-700'>{label}</h2>
      <p className='bg-gray-100 border border-gray-300 rounded-lg p-4'>{summary}</p>
    </div>
  )
}
