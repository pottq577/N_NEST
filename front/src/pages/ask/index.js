// pages/ask.js
import React, { useState } from 'react'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')

  const handleSubmit = event => {
    event.preventDefault()

    console.log('Question submitted', { title, details })
  }

  return (
    <div className='ask-question-container'>
      <h2>Writing a good question</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='question-title'>Title</label>
          <input
            type='text'
            id='question-title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='e.g. Is there an R function for finding the index of an element in a vector?'
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='question-details'>What are the details of your problem?</label>
          <textarea
            id='question-details'
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder='Introduce the problem and expand on what you put in the title. Minimum 20 characters.'
            required
          />
        </div>
        <button type='submit'>Submit your question</button>
      </form>
      <style jsx>{`
        .ask-question-container {
          max-width: 800px;
          margin: auto;
          padding: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        input,
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #ccc;
        }
        button {
          padding: 0.5rem 1rem;
          background-color: blue;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
