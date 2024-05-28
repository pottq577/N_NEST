import Head from 'next/head';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputLabel,
  FormControl,
  Tab,
  Tabs
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function ProfessorEvaluation() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [maxTeams, setMaxTeams] = useState(5);
  const [criteria, setCriteria] = useState([]);
  const [newCriteria, setNewCriteria] = useState('');
  const [teams, setTeams] = useState([]);  // 초기 값을 빈 배열로 설정
  const [tabIndex, setTabIndex] = useState(0);
  const [assignedEvaluations, setAssignedEvaluations] = useState({});
  const [evaluationResults, setEvaluationResults] = useState([]); // 평가 결과 저장
  const [evaluationProgress, setEvaluationProgress] = useState([]); // 평가 진행 상황 저장

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = (event) => {
    const courseCode = event.target.value;
    setSelectedCourse(courseCode);
    localStorage.setItem('selectedCourse', courseCode); // 선택된 과목을 로컬 스토리지에 저장
    fetchTeams(courseCode);
    fetchEvaluationProgress(courseCode); // 과목 변경 시 평가 진행 상황도 가져오기
  };

  const fetchTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}/teams`);
      console.log('Fetched teams:', response.data.teams); // teams 데이터를 가져와 설정하기 전 로그
      setTeams(response.data.teams || []);  // 데이터가 없으면 빈 배열로 설정
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]); // 오류 발생 시 teams를 빈 배열로 설정
    }
  };

  const fetchEvaluationProgress = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/evaluation-progress/${courseCode}`);
      setEvaluationProgress(response.data);
    } catch (error) {
      console.error('Error fetching evaluation progress:', error);
    }
  };

  const saveEvaluationCriteria = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/evaluations', {
        course_code: selectedCourse,
        criteria: criteria,
        max_teams: maxTeams
      });
      alert('Evaluation criteria saved successfully');
    } catch (error) {
      console.error('Error saving evaluation criteria:', error);
    }
  };

  const addCriteria = () => {
    if (newCriteria && !criteria.includes(newCriteria)) {
      setCriteria([...criteria, newCriteria]);
      setNewCriteria('');
    }
  };

  const removeCriteria = (crit) => {
    const updatedCriteria = criteria.filter(c => c !== crit);
    setCriteria(updatedCriteria);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const startEvaluation = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/start-evaluation/${selectedCourse}`);
      alert('Evaluation started successfully and teams assigned');
      setAssignedEvaluations(response.data);
      console.log('Assigned evaluations:', response.data);
    } catch (error) {
      console.error('Error starting evaluation:', error);
    }
  };

  const fetchEvaluationResults = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/evaluation-results/${selectedCourse}`);
      setEvaluationResults(response.data);
    } catch (error) {
      console.error('Error fetching evaluation results:', error);
    }
  };

  useEffect(() => {
    console.log('Teams state updated:', teams); // teams 상태가 업데이트될 때 로그
  }, [teams]);

  return (
    <Container>
      <Head>
        <title>Professor Evaluation</title>
      </Head>
      <Typography variant="h4" gutterBottom>Professor Evaluation</Typography>

      <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
        <InputLabel>Select a course</InputLabel>
        <Select
          value={selectedCourse}
          onChange={handleCourseChange}
          displayEmpty
          fullWidth
          label="Select a course"
        >
          <MenuItem value="" disabled>Select a course</MenuItem>
          {courses.map(course => (
            <MenuItem key={course.code} value={course.code}>
              {course.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCourse && (
        <>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Evaluation Criteria" />
            <Tab label="Team Status" />
            <Tab label="Evaluation Progress" />
            <Tab label="Final Results" />
          </Tabs>

          {tabIndex === 0 && (
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

          {tabIndex === 1 && (
            <>
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>Team Status</Typography>
                <List>
                  {teams && teams.length > 0 ? (
                    teams.map((team, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={`Team: ${team.team_name}, Students: ${team.students.map(student => student.name).join(', ')}`} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography>No teams available</Typography>
                  )}
                </List>

                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>Assigned Evaluations</Typography>
                  <List>
                    {Object.entries(assignedEvaluations).map(([studentId, teamNames], index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={`Student ID: ${studentId}, Assigned Teams: ${teamNames.join(', ')}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>

              <Button variant="contained" color="primary" onClick={startEvaluation}>
                Start Evaluation
              </Button>
            </>
          )}

          {tabIndex === 2 && (
            <>
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>Evaluation Progress</Typography>
                <List>
                  {evaluationProgress && evaluationProgress.length > 0 ? (
                    evaluationProgress.map((progress, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={`Team: ${progress.team_name}, Total Score: ${progress.total_score}`} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography>No evaluation progress available</Typography>
                  )}
                </List>
              </Box>
            </>
          )}

          {tabIndex === 3 && (
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
                        <ListItemText 
                          primary={`Team: ${result.team_name}, Total Score: ${result.total_score}`} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography>No final results available</Typography>
                  )}
                </List>
              </Box>
            </>
          )}
        </>
      )}
    </Container>
  );
}
