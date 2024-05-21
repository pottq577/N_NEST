import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { auth } from '../../../lib/firebase'; // Firebase 설정 가져오기
import { onAuthStateChanged } from 'firebase/auth';

export default function QuestionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [questionDetails, setQuestionDetails] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [userId, setUserId] = useState('');
  const [codeComments, setCodeComments] = useState({});
  const [selectedLine, setSelectedLine] = useState(null);
  const [commentText, setCommentText] = useState('');

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
        setCodeComments(data.codeComments || {});
      } catch (error) {
        console.error('Error fetching question details:', error);
      }
    }
  }

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lineNumber: selectedLine,
            text: commentText,
            userId: userId,
            resolved: 'false'
          })
        });

        if (response.ok) {
          await response.json();
          setCommentText('');
          setSelectedLine(null);
          fetchQuestionDetails(); // Refresh comments
        } else {
          const errorData = await response.json();
          throw new Error(`Failed to submit comment: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error('Error posting comment:', error);
        alert(`댓글 등록에 실패하였습니다: ${error.message}`);
      }
    } else {
      alert('댓글을 입력해 주세요.');
    }
  };

  const handleLineClick = (lineNumber) => {
    setSelectedLine(lineNumber);
    setCommentText(codeComments[lineNumber]?.text || '');
  };

  const handleResolveToggle = async (lineNumber) => {
    if (userId === questionDetails.userId) { // 작성자만 변경 가능
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}/comments/${lineNumber}/resolve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await response.json();
          fetchQuestionDetails(); // Refresh comments
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

  const handleAnswerSubmit = async () => {
    if (answerText.trim()) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}/answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: answerText,
            userId: userId,
            codeComments: Object.fromEntries(
              Object.entries(codeComments).map(([key, value]) => [
                String(key),
                { ...value, resolved: String(value.resolved) } // resolved 값을 문자열로 변환
              ])
            )
          })
        });

        if (response.ok) {
          await response.json();
          window.location.reload();
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
                  backgroundColor: codeComments[index]?.resolved === 'true' ? '#d4edda' : 'inherit'
                }}
                onClick={() => handleLineClick(index)}
              >
                <code>{line}</code>
                {codeComments[index] && (
                  <span style={styles.comment}>
                    {codeComments[index].text}
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleResolveToggle(index);
                    }}>
                      {codeComments[index].resolved === 'true' ? 'Unresolve' : 'Resolve'}
                    </button>
                  </span>
                )}
              </div>
            ))}
          </pre>
          <button onClick={() => setSelectedLine(null)}>
            {selectedLine !== null ? 'Cancel Comment' : 'Add Comment'}
          </button>
        </div>
        <p>{questionDetails.description}</p>
      </div>

      {selectedLine !== null && (
        <div style={styles.commentBox}>
          <textarea
            style={styles.commentTextarea}
            placeholder='Add your comment'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          ></textarea>
          <button style={styles.commentButton} onClick={handleCommentSubmit}>
            Save Comment
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h2>Answers:</h2>
        {questionDetails.answers && questionDetails.answers.length > 0 ? (
          questionDetails.answers.map((answer, index) => (
            <div key={index} style={styles.answerCard}>
              <div style={styles.innerCard}>
                <span style={styles.smallMeta}>By User: {answer.userId}</span>
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
          onChange={(e) => setAnswerText(e.target.value)}
        ></textarea>
        <button style={styles.button} onClick={handleAnswerSubmit}>
          Post Your Answer
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
    cursor: 'pointer'
  },
  comment: {
    position: 'absolute',
    left: '100%',
    marginLeft: '10px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #e1e1e1',
    padding: '5px',
    borderRadius: '5px'
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
  }
};
