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
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 1.5rem;
        }
        button {
          padding: 0.5rem 1rem;
          background-color: blue;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        article {
          border-bottom: 1px solid #ccc;
          padding: 0.5rem 0;
        }
        h2 {
          font-size: 1.25rem;
          color: navy;
        }
        .question-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #555;
        }
        category-select {
          margin-left: 1rem;
          padding: 0.5rem;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        .question-category {
          background-color: #eef;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          margin-left: 1rem;
        }
      `}</style>
    </div>
  )
}
