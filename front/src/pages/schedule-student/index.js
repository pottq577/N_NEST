import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, MenuItem, Button, Typography, Box, Tab, Tabs, Paper } from '@mui/material';
import { auth } from '../../../lib/firebase'; // Import Firebase authentication
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { setHours, setMinutes, format, isBefore, getDay } from 'date-fns';
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ReservationPage = () => {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userId, setUserId] = useState(null); // State to store the current user's UID
  const [userReservations, setUserReservations] = useState([]); // State to store user reservations
  const [tabIndex, setTabIndex] = useState(0); // State to manage tab selection

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/professors/available');
        console.log(response.data);  // 로깅 추가
        setProfessors(response.data);
      } catch (error) {
        console.error('Error fetching professors:', error);
        alert('Error fetching professors: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.error('No user is signed in');
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
          console.error('Error fetching data:', error);
          alert('Error fetching data: ' + (error.response?.data?.detail || 'Unknown error'));
        }
      };

      fetchData();
    }
  }, [selectedProfessor]);

  useEffect(() => {
    if (userId) {
      const fetchUserReservations = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/reservations/user?user_id=${userId}`);
          setUserReservations(response.data);
        } catch (error) {
          console.error('Error fetching user reservations:', error);
          alert('Error fetching user reservations: ' + (error.response?.data?.detail || 'Unknown error'));
        }
      };

      fetchUserReservations();
    }
  }, [userId]);

  const handleReservation = async () => {
    if (!studentName || !selectedDate || !selectedTime || !selectedProfessor) {
      alert('Please fill in all fields');
      return;
    }

    const selectedDay = daysOfWeek[getDay(new Date(selectedDate))];

    const reservationData = {
      studentName,
      userId: selectedProfessor.professor_id,
      day: selectedDay,
      date: selectedDate,
      time: selectedTime,
      studentUserId: userId // Include the current user's UID
    };

    console.log("Sending reservation to server:", reservationData);

    try {
      await axios.post('http://localhost:8000/reservation/', reservationData);
      alert('Reservation made successfully!');
      setStudentName('');
      setSelectedDate('');
      setSelectedTime('');

      // Fetch the updated reservations after making a new reservation
      const reservationsResponse = await axios.get('http://localhost:8000/reservations/');
      setReservations(reservationsResponse.data);

      // Fetch the updated user reservations
      const userReservationsResponse = await axios.get(`http://localhost:8000/reservations/user?user_id=${userId}`);
      setUserReservations(userReservationsResponse.data);
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Error making reservation: ' + (error.response?.data?.detail || 'Unknown error'));
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
      <Typography variant="h4" gutterBottom>Make a Reservation</Typography>
      <Paper>
        <Tabs
          value={tabIndex}
          onChange={(event, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="New Reservation" />
          <Tab label="My Reservations" />
        </Tabs>
      </Paper>
      {tabIndex === 0 && (
        <Box>
          <TextField
            select
            label="Select Professor"
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
            label="Student Name"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Date"
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
              label="Time"
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
            Make Reservation
          </Button>
        </Box>
      )}
      {tabIndex === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>My Reservations</Typography>
          {userReservations.length > 0 ? (
            userReservations.map(reservation => (
              <Box key={reservation._id} mb={2} p={2} border={1} borderColor="grey.300" borderRadius={4}>
                <Typography><strong>Professor Name:</strong> {reservation.professor_name}</Typography>
                <Typography><strong>Date:</strong> {reservation.date}</Typography>
                <Typography><strong>Time:</strong> {reservation.time}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No reservations found.</Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ReservationPage;
