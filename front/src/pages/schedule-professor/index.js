import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, MenuItem, Button, Typography, Grid, Box, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab } from '@mui/material';
import { auth } from '../../../lib/firebase';
import { setHours, setMinutes, format, isBefore } from 'date-fns';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeIntervals = [15, 30, 45, 60];


const defaultWeeklySchedule = daysOfWeek.reduce((schedule, day) => {
  schedule[day] = {
    start: null,
    end: null,
    interval: 30,
    maxCapacity: 1
  };
  return schedule;
}, {});

const AvailabilitySettings = () => {
  const [userEmail, setUserEmail] = useState('');
  const [weeklySchedule, setWeeklySchedule] = useState(defaultWeeklySchedule);
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
        fetchData(user.email);
        fetchReservations(user.email);
      } else {
        setUserEmail('');
        console.error('로그인된 사용자가 없습니다.');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async (email) => {
    try {
      const response = await axios.get('http://localhost:8000/availability/userp', { params: { email } });
      if (response.data && response.data.weeklySchedule) {
        setWeeklySchedule(response.data.weeklySchedule);
      } else {
        setWeeklySchedule(defaultWeeklySchedule);
      }
      setUnavailableTimes(response.data.unavailableTimes || []);
    } catch (error) {
      console.error('예약 가능 정보를 가져오는 중 오류 발생:', error);
      alert('예약 가능 정보를 가져오는 중 오류 발생: ' + (error.response?.data?.detail || '알 수 없는 오류'));
    }
  };

  const fetchReservations = async (email) => {
    try {
      const response = await axios.get('http://localhost:8000/reservations/professor', { params: { email } });
      setReservations(response.data);
    } catch (error) {
      console.error('예약 정보를 가져오는 중 오류 발생:', error);
      alert('예약 정보를 가져오는 중 오류 발생: ' + (error.response?.data?.detail || '알 수 없는 오류'));
    }
  };

  const handleTimeChange = (day, type, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleTimeToggle = (day, time) => {
    const timeSlot = { day, time };
    setUnavailableTimes(prev => {
      const exists = prev.some(slot => slot.day === day && slot.time === time);
      if (exists) {
        return prev.filter(slot => !(slot.day === day && slot.time === time));
      } else {
        return [...prev, timeSlot];
      }
    });
  };

  const handleDayToggle = (day) => {
    const isDisabled = weeklySchedule[day].start === null;
    if (isDisabled) {
      handleTimeChange(day, 'start', '09:00');
      handleTimeChange(day, 'end', '17:00');
    } else {
      handleTimeChange(day, 'start', null);
      handleTimeChange(day, 'end', null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const availabilityData = {
      email: userEmail,
      weeklySchedule,
      unavailableTimes
    };

    console.log("서버로 전송 중:", availabilityData);

    try {
      await saveAvailability(availabilityData);
      alert('예약 가능 설정이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('예약 가능 정보를 처리하는 중 오류 발생:', error);
      alert('예약 가능 정보를 처리하는 중 오류 발생: ' + (error.response?.data?.detail || '알 수 없는 오류'));
    }
  };

  const saveAvailability = async (availabilityData) => {
    const response = await axios.post('http://localhost:8000/availability/', availabilityData);
    return response.data;
  };

  const generateTimeSlots = (startTime, endTime, interval) => {
    let current = setHours(setMinutes(new Date(), parseInt(startTime.split(':')[1])), parseInt(startTime.split(':')[0]));
    const end = setHours(setMinutes(new Date(), parseInt(endTime.split(':')[1])), parseInt(endTime.split(':')[0]));
    const slots = [];
    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm'));
      current = setMinutes(current, current.getMinutes() + interval);
    }
    return slots;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>예약 가능 설정</Typography>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="예약 가능 설정" />
        <Tab label="예약 정보 보기" />
      </Tabs>
      {tabValue === 0 && (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {daysOfWeek.map(day => (
              <Grid item xs={12} sm={6} md={4} key={day}>
                <Typography variant="h6">{day}</Typography>
                <TextField
                  label="시작 시간"
                  type="time"
                  value={weeklySchedule[day]?.start || ''}
                  onChange={e => handleTimeChange(day, 'start', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }} // 5 min
                  disabled={weeklySchedule[day]?.start === null}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  label="종료 시간"
                  type="time"
                  value={weeklySchedule[day]?.end || ''}
                  onChange={e => handleTimeChange(day, 'end', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }} // 5 min
                  disabled={weeklySchedule[day]?.end === null}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  select
                  label="시간 간격 (분)"
                  value={weeklySchedule[day]?.interval || 30}
                  onChange={e => handleTimeChange(day, 'interval', parseInt(e.target.value))}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  disabled={weeklySchedule[day]?.start === null}
                >
                  {timeIntervals.map(interval => (
                    <MenuItem key={interval} value={interval}>{interval}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="슬롯당 최대 인원"
                  type="number"
                  value={weeklySchedule[day]?.maxCapacity || 1}
                  onChange={e => handleTimeChange(day, 'maxCapacity', parseInt(e.target.value))}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 0 }}
                  disabled={weeklySchedule[day]?.start === null}
                />
                <Button variant="contained" color="secondary" onClick={() => handleDayToggle(day)} fullWidth>
                  {weeklySchedule[day]?.start === null ? '활성화' : '비활성화'}
                </Button>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                설정 저장
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      {tabValue === 1 && (
        <Box mt={5}>
          <Typography variant="h5">다가오는 예약 정보</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>학생 이름</TableCell>
                  <TableCell>날짜</TableCell>
                  <TableCell>요일</TableCell>
                  <TableCell>시간</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map(reservation => (
                  <TableRow key={reservation._id}>
                    <TableCell>{reservation.studentName}</TableCell>
                    <TableCell>{reservation.date}</TableCell>
                    <TableCell>{reservation.day}</TableCell>
                    <TableCell>{reservation.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 0 && (
        <Box mt={5}>
          <Typography variant="h5">주간 일정</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>시간</TableCell>
                  {daysOfWeek.map(day => (
                    <TableCell key={day}>{day}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {generateTimeSlots('00:00', '23:45', timeIntervals[0]).map(time => (
                  <TableRow key={time}>
                    <TableCell>{time}</TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell key={`${day}-${time}`}>
                        {weeklySchedule[day]?.start && weeklySchedule[day]?.end &&
                          generateTimeSlots(weeklySchedule[day].start, weeklySchedule[day].end, weeklySchedule[day].interval).includes(time) && (
                            <Checkbox
                              checked={!unavailableTimes.some(slot => slot.day === day && slot.time === time)}
                              onChange={() => handleTimeToggle(day, time)}
                              color="primary"
                            />
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default AvailabilitySettings;