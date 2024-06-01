import React, { useEffect, useState } from 'react'
import { Container, Box, Typography, TextField, Button, Card, CardContent, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { auth } from '../../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function QuestionDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [questionDetails, setQuestionDetails] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [generalAnswerText, setGeneralAnswerText] = useState('')
  const [userId, setUserId] = useState('')
  const [codeAnswers, setCodeAnswers] = useState({})
  const [selectedLine, setSelectedLine] = useState(null)
  const [expandedLines, setExpandedLines] = useState({})
  const [hasResolvedAnswer, setHasResolvedAnswer] = useState(false)
  const [userTitle, setUserTitle] = useState('Beginner')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid)
        fetchUserTitle(user.uid)
        checkUserResolvedAnswers(user.uid, id)
      } else {
        setUserId('')
        console.error('No user is signed in')
      }
    })

    return () => unsubscribe()
  }, [id])

  useEffect(() => {
    fetchQuestionDetails()
  }, [id])

  async function fetchQuestionDetails() {
    if (id) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/questions/${id}`)
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setQuestionDetails(data)
        setCodeAnswers(data.codeAnswers || {})
        checkUserResolvedAnswers(userId, id)
      } catch (error) {
        console.error('Error fetching question details:', error)
      }
    }
  }

  async function fetchUserTitle(userId) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}/title`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setUserTitle(data.title || 'Beginner')
    } catch (error) {
      console.error('Error fetching user title:', error)
    }
  }

  async function checkUserResolvedAnswers(userId, questionId) {
    if (!userId || !questionId) return

    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}/resolved-answers?questionId=${questionId}`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setHasResolvedAnswer(data.hasResolvedAnswer)
    } catch (error) {
      console.error('Error checking resolved answers:', error)
    }
  }

  const handleLineClick = lineNumber => {
    setExpandedLines(prev => ({ ...prev, [lineNumber]: !prev[lineNumber] }))
    setSelectedLine(lineNumber)
    checkUserResolvedAnswers(userId, id)
  }

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
            userTitle: userTitle
          })
        })

        if (response.ok) {
          await response.json()
          setAnswerText('')
          setSelectedLine(null)
          fetchQuestionDetails()
        } else {
          const errorData = await response.json()
          throw new Error(`Failed to submit answer: ${JSON.stringify(errorData)}`)
        }
      } catch (error) {
        console.error('Error posting answer:', error)
        alert(`답변 등록에 실패하였습니다: ${error.message}`)
      }
    } else {
      alert('답변을 입력해 주세요.')
    }
  }

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
            userTitle: userTitle
          })
        })

        if (response.ok) {
          await response.json()
          setGeneralAnswerText('')
          fetchQuestionDetails()
        } else {
          const errorData = await response.json()
          throw new Error(`Failed to submit general answer: ${JSON.stringify(errorData)}`)
        }
      } catch (error) {
        console.error('Error posting general answer:', error)
        alert(`답변 등록에 실패하였습니다: ${error.message}`)
      }
    } else {
      alert('답변을 입력해 주세요.')
    }
  }

  const handleResolveToggle = async (lineNumber, answerIndex) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/questions/${id}/answers/${lineNumber}/${answerIndex}/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        alert(`Answer resolve status toggled. New title: ${data.answer_user_new_title}`)
        fetchQuestionDetails()
        setHasResolvedAnswer(data.hasResolvedAnswer)
      } else {
        const errorData = await response.json()
        throw new Error(`Failed to toggle resolve: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('Error toggling resolve:', error)
      alert(`해결 상태 변경에 실패하였습니다: ${error.message}`)
    }
  }

  const handleResolveGeneralAnswerToggle = async answerIndex => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/questions/${id}/general-answers/${answerIndex}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Answer resolve status toggled. New title: ${data.answer_user_new_title}`)
        fetchQuestionDetails()
        setHasResolvedAnswer(data.hasResolvedAnswer)
      } else {
        const errorData = await response.json()
        throw new Error(`Failed to toggle resolve: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('Error toggling resolve:', error)
      alert(`해결 상태 변경에 실패하였습니다: ${error.message}`)
    }
  }

  if (!questionDetails) {
    return <p>Loading...</p>
  }

  return (
    <Container maxWidth='md'>
      {questionDetails ? (
        <>
          <Card>
            <CardContent>
              <Typography variant='h4' component='h1' gutterBottom>
                {questionDetails.title}
              </Typography>
              <Box display='flex' justifyContent='space-between' mb={2}>
                <Typography variant='subtitle1'>
                  Asked: {new Date(questionDetails.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant='subtitle1'>Category: {questionDetails.category}</Typography>
              </Box>
              <Typography variant='subtitle1'>Code snippet:</Typography>
              <Box component='pre' sx={styles.code}>
                {questionDetails.code.split('\n').map((line, index) => (
                  <Box
                    key={index}
                    sx={{
                      ...styles.codeLine,
                      backgroundColor: expandedLines[index] ? '#e8f4f8' : 'inherit',
                      borderLeft: expandedLines[index] ? '4px solid #007bff' : 'none'
                    }}
                    onClick={() => handleLineClick(index)}
                  >
                    <code>{line}</code>
                    {codeAnswers[index] && (
                      <Typography variant='body2' component='span' sx={styles.comment}>
                        {codeAnswers[index].length}
                      </Typography>
                    )}
                    {expandedLines[index] && codeAnswers[index] && (
                      <Box sx={styles.answersContainer}>
                        {codeAnswers[index].map((answer, idx) => (
                          <Card key={idx} sx={styles.answerCard}>
                            <CardContent>
                              <Typography variant='body2' color='textSecondary'>
                                Title: {answer.userTitle}
                              </Typography>
                              <Typography variant='body2'>{answer.text}</Typography>
                              <Button
                                onClick={() => handleResolveToggle(index, idx)}
                                disabled={answer.resolved === 'false' && hasResolvedAnswer}
                              >
                                {answer.resolved === 'true' ? 'Unresolve' : 'Resolve'}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
              <Button variant='outlined' onClick={() => setSelectedLine(null)}>
                {selectedLine !== null ? 'Cancel' : 'Add Answer'}
              </Button>
              <Typography variant='body1' mt={2}>
                {questionDetails.description}
              </Typography>
            </CardContent>
          </Card>

          {selectedLine !== null && (
            <Box sx={styles.commentBox}>
              <TextField
                multiline
                rows={4}
                variant='outlined'
                fullWidth
                placeholder='Add your answer'
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
              />
              <Button variant='contained' onClick={handleAnswerSubmit} sx={{ mt: 2 }}>
                Save Answer
              </Button>
            </Box>
          )}

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h5' component='h2'>
                General Answers:
              </Typography>
              {questionDetails.generalAnswers && questionDetails.generalAnswers.length > 0 ? (
                questionDetails.generalAnswers.map((answer, index) => (
                  <Card key={index} sx={styles.answerCard}>
                    <CardContent>
                      <Typography variant='body2' color='textSecondary'>
                        Title: {answer.userTitle}
                      </Typography>
                      <Typography variant='body2'>{answer.text}</Typography>
                      <Button
                        onClick={() => handleResolveGeneralAnswerToggle(index)}
                        disabled={answer.resolved === 'false' && hasResolvedAnswer}
                      >
                        {answer.resolved === 'true' ? 'Unresolve' : 'Resolve'}
                      </Button>
                      <Typography variant='body2' color='textSecondary'>
                        Answered: {new Date(answer.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant='body1'>No general answers yet.</Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <TextField
                multiline
                rows={4}
                variant='outlined'
                fullWidth
                placeholder='Your General Answer'
                value={generalAnswerText}
                onChange={e => setGeneralAnswerText(e.target.value)}
              />
              <Button variant='contained' onClick={handleGeneralAnswerSubmit} sx={{ mt: 2 }}>
                Post Your General Answer
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <CircularProgress />
      )}
    </Container>
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
}
