import Head from 'next/head';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Select,
  MenuItem,
  Typography,
  Button,
} from '@mui/material';

export default function StudentTeamRegistration() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [teams, setTeams] = useState([]);
  const [maxTeams, setMaxTeams] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState('');
  const studentId = "Student1"; // 실제로는 인증된 사용자 정보를 사용

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchMaxTeams = async (courseCode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/courses/${courseCode}/max_teams`);
      setMaxTeams(response.data.max_teams);
    } catch (error) {
      console.error('Error fetching max teams:', error);
    }
  };

  const handleCourseChange = async (event) => {
    const courseCode = event.target.value;
    setSelectedCourse(courseCode);
    fetchTeams(courseCode);
    fetchMaxTeams(courseCode);
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
        student_id: studentId,
        team_name: selectedTeam
      });
      alert('Registered successfully');
    } catch (error) {
      console.error('Error registering team:', error);
    }
  };

  return (
    <Container>
      <Head>
        <title>Student Team Registration</title>
      </Head>
      <Typography variant="h4" gutterBottom>Student Team Registration</Typography>

      {/* 과목 선택 부분 */}
      <Select
        value={selectedCourse}
        onChange={handleCourseChange}
        displayEmpty
        fullWidth
        variant="outlined"
        style={{ marginBottom: '16px' }}
      >
        <MenuItem value="" disabled>Select a course</MenuItem>
        {courses.map(course => (
          <MenuItem key={course.code} value={course.code}>
            {course.name}
          </MenuItem>
        ))}
      </Select>

      {/* 팀 선택 부분 */}
      <Select
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        displayEmpty
        fullWidth
        variant="outlined"
        style={{ marginBottom: '16px' }}
        disabled={!selectedCourse}
      >
        <MenuItem value="" disabled>Select a team</MenuItem>
        {generateTeamOptions().map(team => (
          <MenuItem key={team} value={team}>
            {team}
          </MenuItem>
        ))}
      </Select>

      <Button variant="contained" color="primary" onClick={registerTeam} disabled={!selectedTeam}>
        Register to Team
      </Button>
    </Container>
  );
}
