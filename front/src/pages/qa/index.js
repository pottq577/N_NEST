import React, { useState } from 'react'
import Link from 'next/link'

export default function QuestionListPage() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title:
        'Using only CSS, is there a way to limit text inside a div to exactly, X number of characters without the use of Ellipsis?',
      category: 'CSS',
      votes: 0,
      answers: 0,
      views: 12
    },
    {
      id: 2,
      title: 'How to communicate with the server through retrofit2?',
      category: 'Android',
      votes: 0,
      answers: 0,
      views: 5
    }
  ])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'CSS', 'Android', 'JavaScript', 'React'] // Add more categories as needed

  return (
    <div className='container'>
      <header>
        <h1>All Questions</h1>
        <div>
          <label htmlFor='category-select'>Choose a category:</label>
          <select id='category-select' value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <Link href='/ask' passHref>
          <button type='button'>Ask Question</button>
        </Link>
      </header>

      <main>
        {questions
          .filter(question => selectedCategory === 'All' || question.category === selectedCategory)
          .map(question => (
            <article key={question.id}>
              <Link href={`/questions/${question.id}`}>
                <a>
                  <h2>{question.title}</h2>
                </a>
              </Link>
              <div className='question-stats'>
                <span>{question.votes} votes</span>
                <span>{question.answers} answers</span>
                <span>{question.views} views</span>
                <span className='question-category'>{question.category}</span>
              </div>
            </article>
          ))}
      </main>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          max-width: 800px;
          margin: auto;
          padding: 1rem;
          font-family: 'Arial', sans-serif;
          height: 100vh;
        }
        header {
          margin-bottom: 1rem;
        }
        main {
          flex-grow: 1;
          overflow-y: auto;
        }
        h1,
        select {
          color: #333; // 기존 텍스트 색상 유지
        }
        h2 {
          font-size: 1.5rem;
          color: #007bff; // 파란색으로 변경
          margin-bottom: 0.5rem;
        }
        button {
          padding: 0.5rem 1rem;
          background-color: #007bff; // 원래의 파란색으로 변경
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3; // 호버 상태의 색상
        }
        .question-stats {
          gap: 1rem;
        }
        .question-category {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  )
}
