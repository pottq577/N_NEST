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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

export default function StudentEvaluation() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [evaluations, setEvaluations] = useState({});
  const [criteria, setCriteria] = useState([]);
  const [evaluationStarted, setEvaluationStarted] = useState(false);
  const studentId = "Student1"; // 실제로는 인증된 사용자 정보를 사용

  useEffect(() => {
    const selectedCourse = localStorage.getItem('selectedCourse');
    if (selectedCourse) {
      fetchTeams(selectedCourse);
      fetchEvaluationCriteria(selectedCourse);
    }
  }, []);

  const fetchTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
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

  const registerTeam = async (teamName) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/teams/register', {
        course_code: localStorage.getItem('selectedCourse'),
        student_id: studentId,
        team_name: teamName
      });
      alert('Registered successfully');
    } catch (error) {
      console.error('Error registering team:', error);
    }
  };

  const handleTeamChange = async (event) => {
    const teamName = event.target.value;
    setSelectedTeam(teamName);
    registerTeam(teamName);
  };

  const startEvaluation = async () => {
    const selectedCourse = localStorage.getItem('selectedCourse');
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/teams/assign`, { course_code: selectedCourse });
      setEvaluations(response.data);
      setEvaluationStarted(true);
    } catch (error) {
      console.error('Error starting evaluation:', error);
    }
  };

  const submitEvaluation = async (teamName, scores) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/evaluate', {
        student_id: studentId,
        team_name: teamName,
        scores
      });
      // 평가 제출 후 로직 처리
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
  };

  return (
    <Container>
      <Head>
        <title>Student Evaluation</title>
      </Head>
      <Typography variant="h4" gutterBottom>Student Evaluation</Typography>

      {/* 팀 선택 부분 */}
      <Select
        value={selectedTeam}
        onChange={handleTeamChange}
        displayEmpty
        fullWidth
        variant="outlined"
        style={{ marginBottom: '16px' }}
      >
        <MenuItem value="" disabled>Select a team</MenuItem>
        {teams.map(team => (
          <MenuItem key={team._id} value={team.team_name}>
            {team.team_name}
          </MenuItem>
        ))}
      </Select>

      {evaluationStarted && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Evaluate Team: {selectedTeam}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Criteria</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteria.map((criteria, index) => (
                  <TableRow key={index}>
                    <TableCell>{criteria}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        variant="outlined"
                        onChange={(e) => {
                          const score = e.target.value;
                          submitEvaluation(selectedTeam, { [criteria]: score });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Button variant="contained" color="primary" onClick={startEvaluation}>
        Start Evaluation
      </Button>
    </Container>
  );
}
