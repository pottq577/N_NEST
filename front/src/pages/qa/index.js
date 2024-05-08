// pages/ask.js

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function QuestionListPage() {
  const [questions, setQuestions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', 'CSS', 'Android', 'JavaScript', 'React']

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://127.0.0.2:8000/list/questions')
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        console.log('Fetched data:', data) // This will show the structure of the data
        setQuestions(data)
      } catch (error) {
        console.error('Error fetching questions:', error)
      }
    }

    fetchQuestions()
  }, [])

  return (
    <div className='container'>
      <header className='header'>
        <h1>All Questions</h1>
        <div className='filter'>
          <label htmlFor='category-select'>Choose a category:</label>
          <select id='category-select' value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Link href='/ask' passHref>
            <button type='button' className='askButton'>
              Ask Question
            </button>
          </Link>
        </div>
      </header>

      <main className='main'>
        {questions
          .filter(question => selectedCategory === 'All' || question.category === selectedCategory)
          .map(question => (
            <article key={question._id} className='questionCard'>
              <Link href={`/questions/${question._id}`} passHref>
                <a className='questionTitle'>
                  <h2>{question.title}</h2>
                </a>
              </Link>
              <div className='questionStats'>
                <span>{question.votes} votes</span>
                <span>{question.answers.length} answers</span> {/* If answers is an array */}
                <span>{question.views} views</span>
                <span className='categoryTag'>{question.category}</span>
              </div>
            </article>
          ))}
      </main>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
        }
        .header {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        .filter {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }
        .main {
          width: 100%;
        }
        .questionCard {
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }
        .questionCard:hover {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        .questionTitle {
          color: #007bff;
          text-decoration: none;
        }
        .questionStats {
          margin-top: 10px;
          font-size: 0.9rem;
        }
        .categoryTag {
          background-color: #007bff;
          color: white;
          padding: 2px 5px;
          border-radius: 5px;
          font-size: 0.8rem;
        }
        .askButton {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .askButton:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  )
}
