/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react'

export default function ProjectSubmissionForm() {
  const [projectTitle, setProjectTitle] = useState('')
  const [technologiesUsed, setTechnologiesUsed] = useState('')
  const [problemToSolve, setProblemToSolve] = useState('')
  const [summary, setSummary] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const url = `http://localhost:8001/summarize/Gen/${encodeURIComponent(projectTitle)}/${encodeURIComponent(
      technologiesUsed
    )}/${encodeURIComponent(problemToSolve)}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch the project summary. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className='container'>
      <div className='form-container'>
        <h1 className='title'>Project Document Generator</h1>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <label htmlFor='project-title'>Project Title</label>
            <input
              type='text'
              id='project-title'
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              required
            />
          </div>
          <div className='input-group'>
            <label htmlFor='technologies-used'>Technologies Used</label>
            <input
              type='text'
              id='technologies-used'
              value={technologiesUsed}
              onChange={e => setTechnologiesUsed(e.target.value)}
              required
            />
          </div>
          <div className='input-group'>
            <label htmlFor='problem-to-solve'>Problem to Solve</label>
            <textarea
              id='problem-to-solve'
              value={problemToSolve}
              onChange={e => setProblemToSolve(e.target.value)}
              required
            ></textarea>
          </div>
          <div className='button-container'>
            <button type='submit'>Submit Project</button>
          </div>
        </form>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className='error'>{error}</p>
        ) : (
          <div className='summary-container'>
            <h3>Generated Summary</h3>
            <p>
              <strong>Project Title:</strong> {summary.project_title}
            </p>
            <p>
              <strong>Background:</strong> {summary.background}
            </p>
            <p>
              <strong>Development Content:</strong> {summary.development_content}
            </p>
            <p>
              <strong>Expected Effects:</strong> {summary.expected_effects}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f7f7f7;
        }
        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }
        .title {
          font-size: 2.2rem;
          color: #333;
          text-align: center;
          margin-bottom: 2rem;
        }
        .input-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #666;
          font-weight: 600;
        }
        input[type='text'],
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          box-sizing: border-box;
        }
        textarea {
          height: 120px;
          resize: vertical;
        }
        .button-container {
          display: flex;
          justify-content: flex-end;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background-color: #5cb85c;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #4cae4c;
        }
        button:active {
          transform: translateY(2px);
        }
      `}</style>
    </div>
  )
}
