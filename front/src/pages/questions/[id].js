import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

export default function QuestionDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [questionDetails, setQuestionDetails] = useState(null)
  const [answerText, setAnswerText] = useState('')

  useEffect(() => {
    fetchQuestionDetails()
  }, [id])

  async function fetchQuestionDetails() {
    if (id) {
      try {
        const response = await fetch(`http://127.0.0.2:8000/api/questions/${id}`)
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setQuestionDetails(data)
      } catch (error) {
        console.error('Error fetching question details:', error)
      }
    }
  }

  const handleAnswerSubmit = async () => {
    if (answerText.trim()) {
      try {
        const response = await fetch(`http://127.0.0.2:8000/api/questions/${id}/answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: answerText,
            userId: '5f8d0d55b54764421b7156db' // 실제 사용자 ID를 적절히 가져와서 사용해야 합니다.
          })
        })

        if (response.ok) {
          await response.json()
          window.location.reload() // 답변 등록 후 페이지를 새로 고침
        } else {
          throw new Error('Failed to submit answer')
        }
      } catch (error) {
        console.error('Error posting answer:', error)
        alert('답변 등록에 실패하였습니다.')
      }
    } else {
      alert('답변을 입력해 주세요.')
    }
  }

  if (!questionDetails) {
    return <p>Loading...</p>
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>{questionDetails.title}</h1>
        <div>
          <span style={styles.meta}>Asked: {new Date(questionDetails.createdAt).toLocaleDateString()}</span>
          <span style={styles.meta}>Category: {questionDetails.category}</span>
          <span style={styles.meta}>Code snippet:</span>
          <pre style={styles.code}>
            <code>{questionDetails.code}</code>
          </pre>
        </div>
        <p>{questionDetails.description}</p>
      </div>
      {/* <div style={{ ...styles.card, ...styles.tagContainer }}>
        {questionDetails.customCategories.length > 0 &&
          questionDetails.customCategories.map((tag, index) => (
            <span key={index} style={styles.tag}>
              {tag}
            </span>
          ))}
      </div> */}
      <div style={styles.card}>
        <h2>Answers:</h2>
        {questionDetails.answers && questionDetails.answers.length > 0 ? (
          questionDetails.answers.map((answer, index) => (
            <div key={index} style={styles.answerCard}>
              <div style={styles.innerCard}>
                <span style={styles.smallMeta}>By User: {answer.createdBy}</span>
                <p>{answer.text}</p>
                <span style={styles.meta}>Answered: {new Date(answer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No answers yet.</p>
        )}
      </div>
      <div style={styles.card}>
        <textarea
          style={styles.textarea}
          placeholder='Your Answer'
          value={answerText}
          onChange={e => setAnswerText(e.target.value)}
        ></textarea>
        <button style={styles.button} onClick={handleAnswerSubmit}>
          Post Your Answer
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    margin: '20px'
  },
  card: {
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white'
  },
  innerCard: {
    padding: '10px',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 10px #ccc',
    margin: '10px 0'
  },
  meta: {
    display: 'block',
    marginTop: '5px'
  },
  code: {
    background: '#f4f4f4',
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap'
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  tag: {
    padding: '5px 10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '15px'
  },
  textarea: {
    width: '100%',
    height: '100px',
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px'
  },
  smallMeta: {
    fontSize: '0.8em', // 더 작은 글씨 크기
    color: '#666', // 회색으로 표시
    marginBottom: '5px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  answerCard: {
    backgroundColor: '#f9f9f9', // 답변 카드의 배경색
    border: '1px solid #e1e1e1', // 답변 카드의 테두리
    padding: '10px',
    borderRadius: '8px',
    margin: '10px 0'
  }
}
