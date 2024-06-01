import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  Grid,
  CardMedia,
  Avatar,
  Paper,
  Divider,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  ListItemText,
  InputLabel,
  Tabs,
  Tab
} from '@mui/material'
import { styled } from '@mui/system'
import { useRouter } from 'next/router'
import axios from 'axios'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import AddIcon from '@mui/icons-material/Add'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { auth } from '../../../lib/firebase' // 사용자의 Firebase 인증 정보 가져오기
import { onAuthStateChanged } from 'firebase/auth'

const CustomCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10]
  }
}))

const CustomAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white
}))

const CourseDetail = () => {
  const router = useRouter()
  const { code } = router.query
  const [courseData, setCourseData] = useState(null)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [maxTeams, setMaxTeams] = useState(5)
  const [criteria, setCriteria] = useState([])
  const [newCriteria, setNewCriteria] = useState('')
  const [teams, setTeams] = useState([])
  const [assignedEvaluations, setAssignedEvaluations] = useState({})
  const [evaluationResults, setEvaluationResults] = useState([])
  const [evaluationProgress, setEvaluationProgress] = useState([])
  const [tabIndex, setTabIndex] = useState(0)
  const [userId, setUserId] = useState('')
  const [githubId, setGithubId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [isListOpen, setIsListOpen] = useState(true)

  const handleToggleList = () => {
    setIsListOpen(!isListOpen)
  }

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/courses/${code}`)
        setCourseData(response.data)
        setMaxTeams(response.data.max_teams || 5) // 팀 수 설정
        setCriteria(response.data.criteria || []) // 평가 기준 설정
        fetchTeams(response.data.course.code)
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Failed to load course data')
      }
    }

    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects')
        setProjects(response.data)
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects')
      }
    }

    if (code) {
      fetchCourseData()
      fetchProjects()
    }
  }, [code])

  useEffect(() => {
    if (projects && courseData) {
      const filtered = projects.filter(project => project.course_code === code)
      setFilteredProjects(filtered)
      setIsLoading(false)
    }
  }, [projects, courseData, code])

  const handleDragEnd = result => {
    if (!result.destination) return

    if (result.destination.droppableId === 'evaluationZone') {
      const projectId = result.draggableId
      router.push(`/evaluate/${projectId}`)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUserId(user.uid)
        try {
          const githubResponse = await axios.get(`http://localhost:8000/api/students/github/${user.uid}`)
          const studentInfo = githubResponse.data
          setGithubId(studentInfo.githubId)
          setStudentId(studentInfo.studentId)
        } catch (error) {
          console.error('Error fetching GitHub ID:', error)
        }
      } else {
        setUserId('')
        console.error('No user is signed in')
      }
    })

    return () => unsubscribe()
  }, [])

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  const fetchTeams = async courseCode => {
    try {
      const response = await axios.get(`http://localhost:8000/api/courses/${courseCode}/teams`)
      setTeams(response.data.teams || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      setTeams([])
    }
  }

  const fetchEvaluationProgress = async courseCode => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evaluation-progress/${courseCode}`)
      setEvaluationProgress(response.data)
    } catch (error) {
      console.error('Error fetching evaluation progress:', error)
    }
  }

  const saveEvaluationCriteria = async () => {
    try {
      await axios.post('http://localhost:8000/api/evaluations', {
        course_code: code,
        criteria: criteria,
        max_teams: maxTeams
      })
      alert('Evaluation criteria saved successfully')
    } catch (error) {
      console.error('Error saving evaluation criteria:', error)
    }
  }

  const addCriteria = () => {
    if (newCriteria && !criteria.includes(newCriteria)) {
      setCriteria([...criteria, newCriteria])
      setNewCriteria('')
    }
  }

  const removeCriteria = crit => {
    const updatedCriteria = criteria.filter(c => c !== crit)
    setCriteria(updatedCriteria)
  }

  const startEvaluation = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/start-evaluation/${code}`)
      alert('Evaluation started successfully and teams assigned')
      setAssignedEvaluations(response.data)
      console.log('Assigned evaluations:', response.data)
    } catch (error) {
      console.error('Error starting evaluation:', error)
    }
  }

  const fetchEvaluationResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evaluation-results/${code}`)
      setEvaluationResults(response.data)
    } catch (error) {
      console.error('Error fetching evaluation results:', error)
    }
  }

  const registerTeam = async teamName => {
    try {
      await axios.post('http://localhost:8000/api/teams/register', {
        course_code: code,
        team_name: teamName,
        githubId: userId
      })
      alert(`Joined ${teamName} successfully`)
      fetchTeams(code)
    } catch (error) {
      console.error(`Error joining ${teamName}:`, error)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container>
        <Typography color='error'>{error}</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      {courseData && (
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
          {/* 과목 정보 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' gutterBottom>
              {courseData.course.name}
            </Typography>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              {courseData.course.professor} 교수
            </Typography>
            <Typography variant='body1' gutterBottom>
              {courseData.course.day} {courseData.course.time}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>과목 코드: </strong> {courseData.course.code}
            </Typography>
          </Box>
          <Divider />

          {/* 학생 리스트 */}
          <Box sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='h5' component='h2' gutterBottom>
                수강 학생 명단 ({courseData.students.length}명)
              </Typography>
              <IconButton onClick={handleToggleList}>{isListOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
            </Box>
            {isListOpen && (
              <List>
                {courseData.students.map((student, index) => (
                  <ListItem key={index} sx={{ padding: 1 }}>
                    <CustomAvatar sx={{ marginRight: 2 }}>{student.name.charAt(0)}</CustomAvatar>
                    <Typography variant='body1'>{student.name}</Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider />

          {/* 평가  */}
          <Box sx={{ mt: 4 }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label='평가 기준' />
              <Tab label='팀 정보' />
              <Tab label='평가 프로세스' />
              <Tab label='최종 결과' />
            </Tabs>

            {/* 평가 기준 */}
            {tabIndex === 0 && (
              <>
                <Box my={4}>
                  <TextField
                    label='최대 팀 수'
                    variant='outlined'
                    type='number'
                    value={maxTeams}
                    onChange={e => setMaxTeams(e.target.value)}
                    style={{ marginRight: '16px' }}
                  />
                </Box>

                <Box mt={4}>
                  <Typography variant='h5' gutterBottom>
                    평가 기준 설정
                  </Typography>
                  <Box display='flex' alignItems='center'>
                    <TextField
                      label='새로운 기준'
                      variant='outlined'
                      value={newCriteria}
                      onChange={e => setNewCriteria(e.target.value)}
                      style={{ marginRight: '16px' }}
                    />
                    <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={addCriteria}>
                      기준 추가
                    </Button>
                  </Box>
                  <List>
                    {criteria.map((crit, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={crit} />
                        <IconButton edge='end' aria-label='delete' onClick={() => removeCriteria(crit)}>
                          {/* Remove Icon */}
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Button variant='contained' color='secondary' onClick={saveEvaluationCriteria}>
                  평가 기준 저장
                </Button>
              </>
            )}

            {/* 팀 정보 */}
            {tabIndex === 1 && (
              <>
                <Box mt={4}>
                  <Typography variant='h5' gutterBottom>
                    팀 정보
                  </Typography>
                  <List>
                    {teams && teams.length > 0 ? (
                      teams.map((team, index) => (
                        <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <ListItemText primary={`Team: ${team.team_name}`} />
                          <IconButton edge='end' aria-label='add' onClick={() => registerTeam(team.team_name)}>
                            <AddIcon />
                          </IconButton>
                        </ListItem>
                      ))
                    ) : (
                      <Typography>팀이 없습니다.</Typography>
                    )}
                  </List>
                </Box>

                <Box mt={4}>
                  <Typography variant='h5' gutterBottom>
                    할당된 평가
                  </Typography>
                  <List>
                    {Object.entries(assignedEvaluations).map(([studentId, teamNames], index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`Student ID: ${studentId}, Assigned Teams: ${
                            Array.isArray(teamNames) ? teamNames.join(', ') : ''
                          }`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Button variant='contained' color='primary' onClick={startEvaluation}>
                  평가 시작
                </Button>
              </>
            )}

            {/* 평가 프로세스 */}
            {tabIndex === 2 && (
              <>
                <Box mt={4}>
                  <Typography variant='h5' gutterBottom>
                    평가 프로세스
                  </Typography>
                  <List>
                    {evaluationProgress && evaluationProgress.length > 0 ? (
                      evaluationProgress.map((progress, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`Team: ${progress.team_name}, Total Score: ${progress.total_score}`} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography>평가 프로세스가 등록되지 않았습니다.</Typography>
                    )}
                  </List>
                </Box>
              </>
            )}

            {/* 최종 결과 */}
            {tabIndex === 3 && (
              <>
                <Box mt={4}>
                  <Typography variant='h5' gutterBottom>
                    최종 결과
                  </Typography>
                  <Button variant='contained' color='primary' onClick={fetchEvaluationResults}>
                    최종 결과 가져오기
                  </Button>
                  <List>
                    {evaluationResults && evaluationResults.length > 0 ? (
                      evaluationResults.map((result, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${result.team_name}: ${result.total_score}점`} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography>최종 결과가 없습니다.</Typography>
                    )}
                  </List>
                </Box>
              </>
            )}
          </Box>
          <Divider />

          {/* 관련 프로젝트 리스트 */}
          <Box sx={{ mt: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              관련 프로젝트 목록
            </Typography>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Grid container spacing={4}>
                <Droppable droppableId='projects' direction='horizontal'>
                  {provided => (
                    <Grid item xs={12} {...provided.droppableProps} ref={provided.innerRef}>
                      <Grid container spacing={4}>
                        {filteredProjects.map((project, index) => (
                          <Draggable key={project._id} draggableId={project._id} index={index}>
                            {provided => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <CustomCard
                                  sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                >
                                  <CardMedia
                                    component='img'
                                    height='140'
                                    image={project.generated_image_url}
                                    alt='Project Image'
                                    onClick={() => router.push(`/project/${project._id}`)}
                                  />
                                  <CardContent>
                                    <Typography gutterBottom variant='h5' component='div'>
                                      {project.project_name}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      {project.summary}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      By: {project.username}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      Views: {project.views ?? 0}
                                    </Typography>
                                  </CardContent>
                                </CustomCard>
                              </Grid>
                            )}
                          </Draggable>
                        ))}
                      </Grid>
                      {provided.placeholder}
                    </Grid>
                  )}
                </Droppable>
              </Grid>
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Droppable droppableId='evaluationZone'>
                  {provided => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ p: 2 }}>
                      <Typography variant='h6' color='textSecondary'>
                        Drag projects here to evaluate
                      </Typography>
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            </DragDropContext>
          </Box>
        </Paper>
      )}
    </Container>
  )
}

export default CourseDetail
