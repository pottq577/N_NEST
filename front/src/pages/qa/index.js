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
          max-width: 800px;
          margin: auto;
          padding: 1rem;
          font-family: 'Arial', sans-serif;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 2rem;
          color: #333;
        }
        button {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        article {
          border-bottom: 1px solid #ccc;
          padding: 1rem 0;
        }
        h2 {
          font-size: 1.5rem;
          color: #007bff;
          margin-bottom: 0.5rem;
        }
        .question-stats {
          display: flex;
          gap: 1rem;
          font-size: 1rem;
          color: #777;
        }
        .question-category {
          background-color: #f8f9fa;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
        }
        select {
          padding: 0.5rem;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
      `}</style>
    </div>
  )
}
