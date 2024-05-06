import { useState } from 'react'

export default function Component() {
  const [introduction, setIntroduction] = useState('')
  const [body, setBody] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [output, setOutput] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    const data = {
      text: `${introduction}\n\n${body}\n\n${conclusion}`
    }

    try {
      const response = await fetch('http://127.0.0.1:8001/summarize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      setOutput(result.summary)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-xl'>
        <h1 className='text-5xl font-bold text-center text-gray-800 mb-8'>Automated Essay Summarize</h1>
        <p className='text-center text-lg text-gray-600 mb-8'>
          Enter your essay details below and get results instantly.
        </p>

        <form className='space-y-10' onSubmit={handleSubmit}>
          <div className='space-y-3'>
            <label htmlFor='introduction' className='block text-lg font-semibold text-gray-700'>
              Introduction
            </label>
            <textarea
              className='w-full h-32 px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500'
              id='introduction'
              placeholder='Type your introduction here.'
              value={introduction}
              onChange={e => setIntroduction(e.target.value)}
            ></textarea>
          </div>
          <div className='space-y-3'>
            <label htmlFor='body' className='block text-lg font-semibold text-gray-700'>
              Body
            </label>
            <textarea
              className='w-full h-48 px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500'
              id='body'
              placeholder='Type your body here.'
              value={body}
              onChange={e => setBody(e.target.value)}
            ></textarea>
          </div>
          <div className='space-y-3'>
            <label htmlFor='conclusion' className='block text-lg font-semibold text-gray-700'>
              Conclusion
            </label>
            <textarea
              className='w-full h-32 px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500'
              id='conclusion'
              placeholder='Type your conclusion here.'
              value={conclusion}
              onChange={e => setConclusion(e.target.value)}
            ></textarea>
          </div>
          <button type='submit' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
            Summarize
          </button>
          <div className='space-y-3'>
            <label htmlFor='output' className='block text-lg font-semibold text-gray-700'>
              Output
            </label>
            <textarea
              className='w-full h-32 px-4 py-3 text-base text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow focus:outline-none'
              id='output'
              value={output}
              readOnly
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  )
}
