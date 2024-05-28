import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel
} from '@mui/material';
import { auth } from '../../../lib/firebase'; // 사용자의 Firebase 인증 정보 가져오기
import { onAuthStateChanged } from 'firebase/auth';

export default function StudentTeamRegistration() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [maxTeams, setMaxTeams] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [userId, setUserId] = useState('');
  const [githubId, setGithubId] = useState('');
  const [studentId, setStudentId] = useState(''); // 학번 저장
  const [tabIndex, setTabIndex] = useState(0);
  const [evaluationAssignments, setEvaluationAssignments] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [manualStudentId, setManualStudentId] = useState(''); // 수동 학번 설정

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const githubResponse = await axios.get(`http://127.0.0.1:8000/api/students/github/${user.uid}`);
          const studentInfo = githubResponse.data;
          setGithubId(studentInfo.githubId);
         
          setStudentId('2021243023')
          //setStudentId(studentInfo.studentId);  // 학번 설정
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
    const effectiveStudentId = manualStudentId || studentId;
    if (effectiveStudentId && selectedCourse) {
      fetchEvaluationAssignments(effectiveStudentId);
      fetchEvaluationCriteria(selectedCourse);
    }
  }, [studentId, manualStudentId, selectedCourse]);

  const fetchEvaluationAssignments = async (studentId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/evaluation_assignments/${studentId}`);
      setEvaluationAssignments(response.data.evaluations);
    } catch (error) {
      console.error('Error fetching evaluation assignments:', error);
    }
  };

  const fetchEvaluationCriteria = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/evaluations/${courseCode}`);
      setCriteria(response.data.criteria);
    } catch (error) {
      console.error('Error fetching evaluation criteria:', error);
    }
  };

  const handleCourseChange = async (event) => {
    const courseCode = event.target.value;
    setSelectedCourse(courseCode);
    fetchMaxTeams(courseCode);
  };

  const fetchMaxTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}/max_teams`);
      setMaxTeams(response.data.max_teams);
    } catch (error) {
      console.error('Error fetching max teams:', error);
    }
  };

  const generateTeamOptions = () => {
    const options = [];
    for (let i = 1; i <= maxTeams; i++) {
      options.push(`Team ${i}`);
    }
    return options;
  };

  const registerTeam = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/teams/register', {
        course_code: selectedCourse,
        team_name: selectedTeam,
        githubId: userId
      });
      alert('Registered successfully');
    } catch (error) {
      console.error('Error registering team:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleScoreChange = (teamName, criteriaName, score) => {
    setEvaluations(prevEvaluations => ({
      ...prevEvaluations,
      [teamName]: {
        ...prevEvaluations[teamName],
        [criteriaName]: score
      }
    }));
  };

  const submitEvaluations = async () => {
    const effectiveStudentId = manualStudentId || studentId; // 사용자가 수동으로 입력한 학번을 우선 사용

    try {
      for (const teamName of Object.keys(evaluations)) {
        await axios.post('http://127.0.0.1:8000/api/evaluate', {
          course_code: selectedCourse,
          evaluator_id: effectiveStudentId,  // GitHub 아이디 대신 학번을 전송
          team_name: teamName,
          scores: evaluations[teamName]
        });
      }
      alert('Evaluations submitted successfully');
    } catch (error) {
      console.error('Error submitting evaluations:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Student Team Registration</Typography>
      <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
        <InputLabel>Select a course</InputLabel>
        <Select value={selectedCourse} onChange={handleCourseChange} label="Select a course">
          <MenuItem value="" disabled>Select a course</MenuItem>
          {courses.map(course => (
            <MenuItem key={course.code} value={course.code}>
              {course.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
        <InputLabel>Select a team</InputLabel>
        <Select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} disabled={!selectedCourse} label="Select a team">
          <MenuItem value="" disabled>Select a team</MenuItem>
          {generateTeamOptions().map(team => (
            <MenuItem key={team} value={team}>
              {team}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={registerTeam} disabled={!selectedTeam}>
        Register to Team
      </Button>

      <TextField
        label="Manual Student ID"
        variant="outlined"
        fullWidth
        style={{ marginTop: '16px', marginBottom: '16px' }}
        value={manualStudentId}
        onChange={(e) => setManualStudentId(e.target.value)}
        placeholder="Enter student ID manually"
      />

      {selectedCourse && (
        <div>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Register" />
            <Tab label="Evaluate" />
          </Tabs>

          {tabIndex === 1 && (
            <div>
              <Typography variant="h5" gutterBottom>Evaluation Assignments</Typography>
              {evaluationAssignments.length > 0 ? (
                evaluationAssignments.map((team, index) => (
                  <div key={index}>
                    <Typography variant="h6">{team}</Typography>
                    {criteria.map((criterion, idx) => (
                      <Box key={idx} display="flex" alignItems="center" mb={2}>
                        <Typography style={{ flex: 1 }}>{criterion}</Typography>
                        <Select
                          style={{ flex: 1 }}
                          onChange={(e) => handleScoreChange(team, criterion, parseInt(e.target.value))}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>Select a score</MenuItem>
                          {[1, 2, 3, 4, 5].map(score => (
                            <MenuItem key={score} value={score}>{score}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                    ))}
                  </div>
                ))
              ) : (
                <Typography>No evaluation assignments found</Typography>
              )}
              <Button variant="contained" color="primary" onClick={submitEvaluations}>Submit Evaluations</Button>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
