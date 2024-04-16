import { useRouter } from 'next/router'
import React from 'react'

export default function QuestionDetailPage() {
  const router = useRouter()
  const { id } = router.query

  // Dummy data to mimic fetched data
  const questionDetails = {
    id: 1,
    title: 'Library for DB connection, entity, repo for tables in Microservice Architecture',
    content:
      'There are many Microservices that uses same Databases but different/same tables. Want to know is defining the SDK/library that connects to DB, use entities and repos from library and this library can be used by all microservices for DB connection/entities/jpa repository.',
    tags: ['spring-boot', 'spring-data-jpa', 'sdk', 'shared-libraries'],
    answers: [],
    relatedQuestions: [
      // Related questions would be fetched or calculated
    ]
  }

  return (
    <div className='question-detail-container'>
      <h1>{questionDetails.title}</h1>
      <div className='question-meta'>
        <span>Asked today</span>
        <span>Modified today</span>
        <span>Viewed 2 times</span>
      </div>
      <p>{questionDetails.content}</p>
      <div className='question-tags'>
        {questionDetails.tags.map((tag, index) => (
          <span key={index} className='question-tag'>
            {tag}
          </span>
        ))}
      </div>
      {/* ... Place for answers and related questions ... */}
      <div className='add-answer-section'>
        <textarea placeholder='Your Answer'></textarea>
        <button>Post Your Answer</button>
      </div>
      {/* ... Additional page content ... */}
      <style jsx>{`
        .question-detail-container {
          max-width: 800px;
          margin: auto;
          padding: 1rem;
        }
        .question-meta {
          font-size: 0.875rem;
          color: #777;
          margin-bottom: 1rem;
        }
        .question-tags span {
          display: inline-block;
          background-color: #eef;
          padding: 0.25rem 0.5rem;
          margin-right: 0.5rem;
          border-radius: 5px;
        }
        .add-answer-section textarea {
          width: 100%;
          margin-bottom: 0.5rem;
        }
        .add-answer-section button {
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
