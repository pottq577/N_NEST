import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import { useRouter } from 'next/router';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const CustomCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10],
  },
}));

const CustomAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const CourseDetail = () => {
  const router = useRouter();
  const { code } = router.query;
  const [courseData, setCourseData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEvaluationSubmitted, setIsEvaluationSubmitted] = useState(false);
  const [maxTeams, setMaxTeams] = useState(5);
  const [criteria, setCriteria] = useState([]);
  const [newCriteria, setNewCriteria] = useState('');
  const [teams, setTeams] = useState([]);
  const [assignedEvaluations, setAssignedEvaluations] = useState({});
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [evaluationProgress, setEvaluationProgress] = useState([]);
  const [evaluationAssignments, setEvaluationAssignments] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [userId, setUserId] = useState('');
  const [githubId, setGithubId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (code) {
      fetchEvaluationProgress(code);
    }
  }, [code]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/courses/${code}`);
        setCourseData(response.data);
        setMaxTeams(response.data.max_teams || 5); // 팀 수 설정
        fetchTeams(response.data.course.code);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data');
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
      }
    };

    if (code) {
      fetchCourseData();
      fetchProjects();
      fetchEvaluationCriteria(code);
    }
  }, [code]);

  useEffect(() => {
    if (studentId && code) {
      fetchEvaluationAssignments();
    }
  }, [studentId, code]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const githubResponse = await axios.get(`http://localhost:8000/api/students/github/${user.uid}`);
          const studentInfo = githubResponse.data;
          setGithubId(studentInfo.githubId);
          setStudentId(studentInfo.studentId);
        } catch (error) {
          console.error('Error fetching GitHub ID:', error);
        }
      } else {
        setUserId('');
        console.error('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (projects && courseData) {
      const filtered = projects.filter((project) => project.course_code === code);
      setFilteredProjects(filtered);
      setIsLoading(false);
    }
  }, [projects, courseData, code]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (result.destination.droppableId === 'evaluationZone') {
      const projectId = result.draggableId;
      router.push(`/evaluate/${projectId}`);
    }
  };

  const fetchEvaluationAssignments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evaluation-assignments/${code}/${studentId}`);
      setEvaluationAssignments(response.data.evaluations || []);
    } catch (error) {
      console.error('Error fetching evaluation assignments:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const isEmailUser = !user.providerData.some((provider) => provider.providerId === 'github.com');
        setUserRole(isEmailUser ? 'professor' : 'student');
      } else {
        setUserId('');
        setUserRole('professor');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const fetchTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/courses/${courseCode}/teams`);
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const fetchEvaluationProgress = async (courseCode) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evaluation-progress/${courseCode}`);
      setEvaluationProgress(response.data);
    } catch (error) {
      console.error('Error fetching evaluation progress:', error);
    }
  };

  const fetchEvaluationCriteria = async (courseCode) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evaluations/${courseCode}`);
      setCriteria(response.data.criteria);
      setMaxTeams(response.data.max_teams || 5);
    } catch (error) {
      console.error('Error fetching evaluation criteria:', error);
    }
  };

  const saveEvaluationCriteria = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/evaluations', {
        course_code: code,
        criteria: criteria,
        max_teams: maxTeams,
      });
      alert('Evaluation criteria saved successfully');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'Evaluation criteria already exists. Do you want to update it?') {
        setOpenDialog(true);
      } else {
        console.error('Error saving evaluation criteria:', error);
      }
    }
  };

  const updateEvaluationCriteria = async () => {
    try {
      const response = await axios.put('http://localhost:8000/api/evaluations', {
        course_code: code,
        criteria: criteria,
        max_teams: maxTeams,
      });
      alert('Evaluation criteria updated successfully');
    } catch (error) {
      console.error('Error updating evaluation criteria:', error);
    }
    setOpenDialog(false);
  };

  const addCriteria = () => {
    if (newCriteria && !criteria.includes(newCriteria)) {
      setCriteria([...criteria, newCriteria]);
      setNewCriteria('');
    }
  };

  const removeCriteria = (crit) => {
    const updatedCriteria = criteria.filter((c) => c !== crit);
    setCriteria(updatedCriteria);
  };

  const startEvaluation = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/start-evaluation/${code}`);
      alert('Evaluation started successfully and teams assigned');
      setAssignedEvaluations(response.data);
      fetchEvaluationAssignments();
    } catch (error) {
      console.error('Error starting evaluation:', error);
    }
  };

  const fetchEvaluationResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/evaluation-results/${code}`);
      setEvaluationResults(response.data);
    } catch (error) {
      console.error('Error fetching evaluation results:', error);
    }
  };

  const registerTeam = async (teamName) => {
    try {
      await axios.post('http://localhost:8000/api/teams/register', {
        course_code: code,
        team_name: teamName,
        githubId: githubId,
      });
      alert(`Joined ${teamName} successfully`);
      fetchTeams(code);
    } catch (error) {
      console.error(`Error joining ${teamName}:`, error);
    }
  };

  const handleScoreChange = (teamName, criteriaName, score) => {
    setEvaluations((prevEvaluations) => ({
      ...prevEvaluations,
      [teamName]: {
        ...prevEvaluations[teamName],
        [criteriaName]: score,
      },
    }));
  };

  const submitEvaluations = async () => {
    try {
      for (const teamName of Object.keys(evaluations)) {
        await axios.post('http://localhost:8000/api/evaluate', {
          course_code: code,
          evaluator_id: studentId,
          team_name: teamName,
          scores: evaluations[teamName]
        });
      }
      alert('Evaluations submitted successfully');
      setIsEvaluationSubmitted(true); // 평가 제출 후 상태 업데이트
    } catch (error) {
      console.error('Error submitting evaluations:', error);
      if (error.response && error.response.status === 400 && error.response.data.detail === "You have already submitted an evaluation for this team.") {
        alert('You have already submitted an evaluation for this team.');
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color='error'>{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      {courseData && (
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' gutterBottom>
              {courseData.course.name}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Professor:</strong> {courseData.course.professor}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Day:</strong> {courseData.course.day}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Time:</strong> {courseData.course.time}
            </Typography>
            <Typography variant='body1' gutterBottom>
              <strong>Code:</strong> {courseData.course.code}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              수강 학생 명단
            </Typography>
            <List>
              {courseData.students.map((student, index) => (
                <ListItem key={index} sx={{ padding: 1 }}>
                  <CustomAvatar sx={{ marginRight: 2 }}>{student.name.charAt(0)}</CustomAvatar>
                  <Typography variant='body1'>{student.name}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
          <Divider />

          <Box sx={{ mt: 4 }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              {userRole === 'professor' ? (
                [
                  <Tab key="create-team" label="팀, 평가항목 생성" />,
                  <Tab key="progress" label="평가 진행사항" />,
                  <Tab key="results" label="최종 결과" />,
                ]
              ) : (
                [
                  <Tab key="join-team" label="팀 참가" />,
                  <Tab key="evaluate" label="평가하기" />,
                ]
              )}
            </Tabs>

            {userRole === 'professor' && tabIndex === 0 && (
              <>
                <Box mt={2}>
                  <TextField
                    label="Max Teams"
                    variant="outlined"
                    type="number"
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(e.target.value)}
                    style={{ marginRight: '16px' }}
                  />
                </Box>

                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>Evaluation Criteria</Typography>
                  <Box display="flex" alignItems="center">
                    <TextField
                      label="New Criteria"
                      variant="outlined"
                      value={newCriteria}
                      onChange={(e) => setNewCriteria(e.target.value)}
                      style={{ marginRight: '16px' }}
                    />
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={addCriteria}>
                      Add Criteria
                    </Button>
                  </Box>
                  <List>
                    {criteria.map((crit, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={crit} />
                        <IconButton edge="end" aria-label="delete" onClick={() => removeCriteria(crit)}>
                          {/* Remove Icon */}
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Button variant="contained" color="secondary" onClick={saveEvaluationCriteria}>
                  Save Evaluation Criteria
                </Button>
              </>
            )}

            {userRole === 'student' && tabIndex === 0 && (
              <>
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>Team Status</Typography>
                  <List>
                    {teams.map((team, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={team.team_name}
                          secondary={team.students.map((student) => student.name).join(', ')}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <List>
                    {teams.map((team, index) => (
                      <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <ListItemText primary={team.team_name} />
                        <IconButton edge="end" aria-label="add" onClick={() => registerTeam(team.team_name)}>
                          <AddIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            {userRole === 'professor' && tabIndex === 1 && (
              <>
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>Evaluation Progress</Typography>
                  <List>
                    {evaluationProgress && evaluationProgress.length > 0 ? (
                      evaluationProgress.map((progress, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`Team: ${progress.team_name}, Total Score: ${progress.total_score}`} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography>No evaluation progress available</Typography>
                    )}
                  </List>
                </Box>
              </>
            )}

            {userRole === 'professor' && tabIndex === 2 && (
              <>
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>Final Results</Typography>
                  <Button variant="contained" color="primary" onClick={fetchEvaluationResults}>
                    Fetch Final Results
                  </Button>
                  <List>
                    {evaluationResults && evaluationResults.length > 0 ? (
                      evaluationResults.map((result, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`Team: ${result.team_name}, Total Score: ${result.total_score}`} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography>No final results available</Typography>
                    )}
                  </List>
                </Box>
              </>
            )}

            {userRole === 'student' && tabIndex === 1 && (
              <>
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>Evaluate Teams</Typography>
                  {evaluationAssignments.length > 0 ? (
                    evaluationAssignments.map((team, index) => (
                      <div key={index}>
                        <Typography variant="h6">{team}</Typography>
                        {criteria.map((criterion, idx) => (
                          <Box key={idx} display="flex" alignItems="center" mb={2}>
                            <Typography style={{ flex: 1 }}>{criterion}</Typography>
                            <TextField
                              type="number"
                              onChange={(e) => handleScoreChange(team, criterion, parseInt(e.target.value))}
                              style={{ flex: 1 }}
                              inputProps={{ min: 1, max: 5 }}
                            />
                          </Box>
                        ))}
                      </div>
                    ))
                  ) : (
                    <Typography>No evaluation assignments found</Typography>
                  )}
                  <Button variant="contained" color="primary" onClick={submitEvaluations} disabled={isEvaluationSubmitted}>
                    Submit Evaluations
                  </Button>
                </Box>
              </>
            )}
          </Box>

          <Divider />
          <Box sx={{ mt: 4 }}>
            <Typography variant='h5' component='h2' gutterBottom>
              관련 프로젝트 목록
            </Typography>
            {userRole === 'professor' && (
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
                    backgroundColor: '#f9f9f9',
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
            )}
            {userRole === 'student' && (
              <Grid container spacing={4}>
                {filteredProjects.map((project, index) => (
                  <Grid item xs={12} sm={6} md={4} key={project._id}>
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
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Evaluation Criteria</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Evaluation criteria already exists. Do you want to update it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={updateEvaluationCriteria} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetail;
