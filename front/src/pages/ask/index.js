// pages/ask.js

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AskQuestionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('CSS') // 기본 카테고리 설정
  const [customCategories, setCustomCategories] = useState([])
  const [code, setCode] = useState('')
  const router = useRouter()

  const handleSubmit = e => {
    e.preventDefault()

    const newQuestion = {
      title,
      description,
      category,
      customCategories,
      code
    }
    console.log('Submitting new question:', newQuestion)

    router.push('/')
  }

  const handleCategoryChange = e => {
    setCategory(e.target.value)
  }

  const handleAddCustomCategory = e => {
    if (e.key === 'Enter' && e.target.value) {
      setCustomCategories(prev => [...prev, e.target.value])
      e.target.value = '' // 입력 필드 초기화
    }
  }

  const handleCodeChange = e => {
    setCode(e.target.value)
  }

  return (
    <div className='container'>
      <form onSubmit={handleSubmit}>
        <h1>Ask a Question</h1>
        <div className='form-group'>
          <label htmlFor='question-title'>Title</label>
          <input type='text' id='question-title' value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className='form-group'>
          <label htmlFor='question-category'>Category</label>
          <select id='question-category' value={category} onChange={handleCategoryChange}>
            <option value='CSS'>CSS</option>
            <option value='JavaScript'>JavaScript</option>
            <option value='React'>React</option>
            <option value='Android'>Android</option>
            {/* 기타 기술 카테고리를 추가할 수 있습니다 */}
          </select>
          {customCategories.map((cat, index) => (
            <div key={index} className='custom-category'>
              {cat}
            </div>
          ))}
          <input type='text' placeholder='Add custom category' onKeyPress={handleAddCustomCategory} />
        </div>
        <div className='form-group'>
          <label htmlFor='question-description'>Description</label>
          <textarea
            id='question-description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className='form-group'>
          <label htmlFor='question-code'>Code (optional)</label>
          <textarea
            id='question-code'
            value={code}
            onChange={handleCodeChange}
            placeholder='Insert code here if any...'
          ></textarea>
        </div>
        <div className='button-group'>
          <button type='submit'>Submit Question</button>
          <Link href='/'>
            <button type='button'>Cancel</button>
          </Link>
        </div>
      </form>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 1rem;
          font-family: 'Arial', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          color: #333;
          margin-bottom: 2rem;
        }
        .form-group {
          width: 100%;
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        input,
        select,
        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        textarea {
          height: 150px;
          margin-bottom: 1rem; // 코드 입력 영역과 거리를 둠
        }
        .button-group {
          display: flex;
          justify-content: space-between;
        }
        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        button[type='submit'] {
          background-color: #007bff;
          color: white;
        }
        button[type='submit']:hover {
          background-color: #0056b3;
        }
        button[type='button'] {
          background-color: #6c757d;
          color: white;
        }
        button[type='button']:hover {
          background-color: #5a6268;
        }
        .custom-category {
          background-color: #e9ecef;
          border-radius: 5px;
          padding: 0.25rem 0.5rem;
          display: inline-block;
          margin-right: 0.5rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}
