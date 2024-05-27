import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuestionListPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const questionsPerPage = 10;
  const categories = ['All', 'CSS', 'Android', 'JavaScript', 'React'];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/list/questions');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Fetched data:', data); // This will show the structure of the data
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions
    .filter(question => selectedCategory === 'All' || question.category === selectedCategory)
    .slice(indexOfFirstQuestion, indexOfLastQuestion);

  const totalPages = Math.ceil(
    questions.filter(question => selectedCategory === 'All' || question.category === selectedCategory).length / questionsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!questions || questions.length === 0) {
    return <p>No questions found.</p>;
  }

  return (
    <div className='container'>
      <header className='header'>
        <h1>All Questions</h1>
        <div className='filter'>
          {/* <label htmlFor='category-select'>Choose a category:</label>
          <select id='category-select' value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select> */}
          <Link href='/ask' passHref>
            <button type='button' className='askButton'>
              Ask Question
            </button>
          </Link>
        </div>
      </header>

      <main className='main'>
        {currentQuestions.map(question => (
          <article key={question.id} className='questionCard'>
            <Link href={`/questions/${question.id}`} passHref>
              <a className='questionTitle'>
                <h2>{question.title}</h2>
              </a>
            </Link>
            <div className='questionStats'>
              <span>{question.votes} votes</span>
              <span>{question.answers ? question.answers.length : 0} answers</span>
              <span>{question.views} views</span>
              <span className='categoryTag'>{question.category}</span>
            </div>
          </article>
        ))}
        <div className='pagination'>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
        }
        .header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .filter {
          display: flex;
          align-items: center;
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
          display: flex;
          gap: 15px; /* Adds space between stats */
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
        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        .pagination button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          margin: 0 5px;
          padding: 5px 10px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .pagination button:hover {
          background-color: #0056b3;
        }
        .pagination .active {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}
