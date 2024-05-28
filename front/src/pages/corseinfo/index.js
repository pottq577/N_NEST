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
  Paper,
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
  const [teams, setTeams] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

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
  };

  const fetchTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
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
      await axios.post(`http://127.0.0.1:8000/api/start-evaluation/${selectedCourse}`);
      alert('Evaluation started successfully');
    } catch (error) {
      console.error('Error starting evaluation:', error);
    }
  };

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
                  {teams.map((team, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`Team: ${team.team_name}, Students: ${team.students.join(', ')}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Button variant="contained" color="primary" onClick={startEvaluation}>
                Start Evaluation
              </Button>
            </>
          )}
        </>
      )}
    </Container>
  );
}
