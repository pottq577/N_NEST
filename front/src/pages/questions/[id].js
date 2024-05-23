import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function QuestionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [questionDetails, setQuestionDetails] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [generalAnswerText, setGeneralAnswerText] = useState('');
  const [userId, setUserId] = useState('');
  const [codeAnswers, setCodeAnswers] = useState({});
  const [selectedLine, setSelectedLine] = useState(null);
  const [expandedLines, setExpandedLines] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId('');
        console.error('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchQuestionDetails();
  }, [id]);

  async function fetchQuestionDetails() {
    if (id) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setQuestionDetails(data);
        setCodeAnswers(data.codeAnswers || {});
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    }
  }

  const handleLineClick = (lineNumber) => {
    setExpandedLines(prev => ({ ...prev, [lineNumber]: !prev[lineNumber] }));
    setSelectedLine(lineNumber);
  };

  const handleAnswerSubmit = async () => {
    if (answerText.trim() && selectedLine !== null) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}/answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineNumber: selectedLine,
            text: answerText,
            userId: userId,
          })
        });

        if (response.ok) {
          await response.json();
          setAnswerText('');
          setSelectedLine(null);
          fetchQuestionDetails();
        } else {
          const errorData = await response.json();
          throw new Error(`Failed to submit answer: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error('Error posting answer:', error);
        alert(`답변 등록에 실패하였습니다: ${error.message}`);
      }
    } else {
      alert('답변을 입력해 주세요.');
    }
  };

  const handleGeneralAnswerSubmit = async () => {
    if (generalAnswerText.trim()) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}/general-answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: generalAnswerText,
            userId: userId,
          })
        });

        if (response.ok) {
          await response.json();
          setGeneralAnswerText('');
          fetchQuestionDetails();
        } else {
          const errorData = await response.json();
          throw new Error(`Failed to submit general answer: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error('Error posting general answer:', error);
        alert(`답변 등록에 실패하였습니다: ${error.message}`);
      }
    } else {
      alert('답변을 입력해 주세요.');
    }
  };

  const handleResolveToggle = async (lineNumber, answerIndex) => {
    if (userId === questionDetails.userId) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}/answers/${lineNumber}/${answerIndex}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await response.json();
          fetchQuestionDetails();
        } else {
          const errorData = await response.json();
          throw new Error(`Failed to toggle resolve: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error('Error toggling resolve:', error);
        alert(`해결 상태 변경에 실패하였습니다: ${error.message}`);
      }
    }
  };

  if (!questionDetails) {
    return <p>Loading...</p>;
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
            {questionDetails.code.split('\n').map((line, index) => (
              <div
                key={index}
                style={{
                  ...styles.codeLine,
                  backgroundColor: expandedLines[index] ? '#e8f4f8' : 'inherit',
                  borderLeft: expandedLines[index] ? '4px solid #007bff' : 'none'
                }}
                onClick={() => handleLineClick(index)}
              >
                <code>{line}</code>
                {codeAnswers[index] && (
                  <span style={styles.comment}>
                    {codeAnswers[index].length}
                  </span>
                )}
                {expandedLines[index] && codeAnswers[index] && (
                  <div style={styles.answersContainer}>
                    {codeAnswers[index].map((answer, idx) => (
                      <div key={idx} style={styles.answerCard}>
                        <div style={styles.innerCard}>
                          <span style={styles.smallMeta}>By User: {answer.userId}</span>
                          <p>{answer.text}</p>
                          <button onClick={() => handleResolveToggle(index, idx)}>
                            {answer.resolved === 'true' ? 'Unresolve' : 'Resolve'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </pre>
          <button onClick={() => setSelectedLine(null)}>
            {selectedLine !== null ? 'Cancel' : 'Add Answer'}
          </button>
        </div>
        <p>{questionDetails.description}</p>
      </div>

      {selectedLine !== null && (
        <div style={styles.commentBox}>
          <textarea
            style={styles.commentTextarea}
            placeholder='Add your answer'
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          ></textarea>
          <button style={styles.commentButton} onClick={handleAnswerSubmit}>
            Save Answer
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h2>General Answers:</h2>
        {questionDetails.generalAnswers && questionDetails.generalAnswers.length > 0 ? (
          questionDetails.generalAnswers.map((answer, index) => (
            <div key={index} style={styles.answerCard}>
              <div style={styles.innerCard}>
                <span style={styles.smallMeta}>By User: {answer.userId}</span>
                <p>{answer.text}</p>
                <span style={styles.meta}>Answered: {new Date(answer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No general answers yet.</p>
        )}
      </div>
      <div style={styles.card}>
        <textarea
          style={styles.textarea}
          placeholder='Your General Answer'
          value={generalAnswerText}
          onChange={(e) => setGeneralAnswerText(e.target.value)}
        ></textarea>
        <button style={styles.button} onClick={handleGeneralAnswerSubmit}>
          Post Your General Answer
        </button>
      </div>
    </div>
  );
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
  codeLine: {
    position: 'relative',
    cursor: 'pointer',
    padding: '5px 10px'
  },
  comment: {
    position: 'absolute',
    left: '100%',
    marginLeft: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '12px'
  },
  commentBox: {
    display: 'flex',
    flexDirection: 'column',
    margin: '20px 0'
  },
  commentTextarea: {
    width: '100%',
    height: '100px',
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px'
  },
  commentButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
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
    fontSize: '0.8em',
    color: '#666',
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
    backgroundColor: '#f9f9f9',
    border: '1px solid #e1e1e1',
    padding: '10px',
    borderRadius: '8px',
    margin: '10px 0'
  },
  answersContainer: {
    marginTop: '10px',
    borderTop: '1px solid #ddd',
    paddingTop: '10px'
  }
};
