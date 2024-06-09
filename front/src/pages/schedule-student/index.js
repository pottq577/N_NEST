import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, MenuItem, Button, Typography, Box, Tab, Tabs, Paper } from '@mui/material';
import { auth } from '../../../lib/firebase'; // Import Firebase authentication
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { setHours, setMinutes, format, isBefore, getDay } from 'date-fns';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysOfWeekKor = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const ReservationPage = () => {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [studentUserId, setStudentUserId] = useState(null); // State to store the current user's UID
  const [userReservations, setUserReservations] = useState([]); // State to store user reservations
  const [tabIndex, setTabIndex] = useState(0); // State to manage tab selection

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/professors/available');
        console.log(response.data);  // 로깅 추가
        setProfessors(response.data);
      } catch (error) {
        console.error('교수 데이터를 가져오는 중 오류 발생:', error);
        alert('교수 데이터를 가져오는 중 오류 발생: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudentUserId(user.uid);
      } else {
        console.error('로그인된 사용자가 없습니다.');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedProfessor) {
      const fetchData = async () => {
        try {
          const availabilityResponse = await axios.get('http://localhost:8000/availability/user', { params: { userId: selectedProfessor.professor_id } });
          setWeeklySchedule(availabilityResponse.data.weeklySchedule);
          setUnavailableTimes(availabilityResponse.data.unavailableTimes);

          const reservationsResponse = await axios.get('http://localhost:8000/reservations/');
          setReservations(reservationsResponse.data);
        } catch (error) {
          console.error('데이터를 가져오는 중 오류 발생:', error);
          alert('데이터를 가져오는 중 오류 발생: ' + (error.response?.data?.detail || 'Unknown error'));
        }
      };

      fetchData();
    }
  }, [selectedProfessor]);

  useEffect(() => {
    if (studentUserId) {
      const fetchUserReservations = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/reservations/user?user_id=${studentUserId}`);
          setUserReservations(response.data);
          console.log('Fetched user reservations:', response.data); // 로깅 추가
        } catch (error) {
          console.error('사용자 예약 데이터를 가져오는 중 오류 발생:', error);
          alert('사용자 예약 데이터를 가져오는 중 오류 발생: ' + (error.response?.data?.detail || 'Unknown error'));
        }
      };

      fetchUserReservations();
    }
  }, [studentUserId]);

  const handleReservation = async () => {
    if (!studentName || !selectedDate || !selectedTime || !selectedProfessor) {
      alert('모든 필드를 입력해 주세요.');
      return;
    }

    const selectedDay = daysOfWeek[getDay(new Date(selectedDate))];

    const reservationData = {
      studentName,
      professor_id: selectedProfessor.professor_id,
      professor_name: selectedProfessor.name,
      day: selectedDay,
      date: selectedDate,
      time: selectedTime,
      userId: studentUserId // Include the current user's UID
    };

    console.log("서버로 예약 데이터 전송:", reservationData);

    try {
      await axios.post('http://localhost:8000/reservation/', reservationData);
      alert('예약이 성공적으로 완료되었습니다!');
      setStudentName('');
      setSelectedDate('');
      setSelectedTime('');

      // Fetch the updated reservations after making a new reservation
      const reservationsResponse = await axios.get('http://localhost:8000/reservations/');
      setReservations(reservationsResponse.data);

      // Fetch the updated user reservations
      const userReservationsResponse = await axios.get(`http://localhost:8000/reservations/user?user_id=${studentUserId}`);
      setUserReservations(userReservationsResponse.data);
      console.log('Updated user reservations:', userReservationsResponse.data); // 로깅 추가
    } catch (error) {
      console.error('예약 중 오류 발생:', error);
      alert('예약 중 오류 발생: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const generateTimeSlots = (startTime, endTime, interval, day) => {
    let current = setHours(setMinutes(new Date(), parseInt(startTime.split(':')[1])), parseInt(startTime.split(':')[0]));
    const end = setHours(setMinutes(new Date(), parseInt(endTime.split(':')[1])), parseInt(endTime.split(':')[0]));
    const slots = [];
    while (isBefore(current, end)) {
      const timeSlot = format(current, 'HH:mm');
      const isUnavailable = unavailableTimes.some(slot => slot.day === day && slot.time === timeSlot);
      const isFullyBooked = reservations.filter(reservation => reservation.day === day && reservation.time === timeSlot).length >= (weeklySchedule[day]?.maxCapacity || 1);
      if (!isUnavailable && !isFullyBooked) {
        slots.push(timeSlot);
      }
      current = setMinutes(current, current.getMinutes() + interval);
    }

    return slots;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    const selectedDay = daysOfWeek[getDay(new Date(selectedDate))];

    return weeklySchedule[selectedDay]?.start && weeklySchedule[selectedDay]?.end
      ? generateTimeSlots(weeklySchedule[selectedDay].start, weeklySchedule[selectedDay].end, weeklySchedule[selectedDay].interval, selectedDay)
      : [];
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>예약하기</Typography>
      <Paper>
        <Tabs
          value={tabIndex}
          onChange={(event, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="새 예약" />
          <Tab label="내 예약" />
        </Tabs>
      </Paper>
      {tabIndex === 0 && (
        <Box>
          <TextField
            select
            label="교수 선택"
            value={selectedProfessor ? selectedProfessor.professor_id : ''}
            onChange={e => setSelectedProfessor(professors.find(prof => prof.professor_id === e.target.value))}
            fullWidth
            variant="outlined"
            margin="normal"
          >
            {professors.map(prof => (
              <MenuItem key={prof.professor_id} value={prof.professor_id}>{prof.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="학생 이름"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="날짜"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          {selectedDate && (
            <TextField
              select
              label="시간"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
            >
              {getAvailableTimeSlots().map(time => (
                <MenuItem key={time} value={time}>{time}</MenuItem>
              ))}
            </TextField>
          )}
          <Button variant="contained" color="primary" onClick={handleReservation} fullWidth>
            예약하기
          </Button>
        </Box>
      )}
      {tabIndex === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>내 예약</Typography>
          {userReservations.length > 0 ? (
            userReservations.map(reservation => (
              <Box key={reservation._id} mb={2} p={2} border={1} borderColor="grey.300" borderRadius={4}>
                <Typography><strong>교수 이름:</strong> {reservation.professor_name}</Typography>
                <Typography><strong>날짜:</strong> {reservation.date}</Typography>
                <Typography><strong>시간:</strong> {reservation.time}</Typography>
              </Box>
            ))
          ) : (
            <Typography>예약 정보가 없습니다.</Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ReservationPage;
