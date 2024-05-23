import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { setHours, setMinutes, format, isBefore, getDay } from 'date-fns';
import { Container, TextField, MenuItem, Button, Typography, Box } from '@mui/material';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ReservationPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/availability/');
        setUsers(response.data.map(item => item.userId));
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Error fetching users: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const fetchData = async () => {
        try {
          const availabilityResponse = await axios.get('http://localhost:8000/availability/user', { params: { userId: selectedUser } });
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
  }, [selectedUser]);

  const handleReservation = async () => {
    if (!studentName || !selectedDate || !selectedTime || !selectedUser) {
      alert('Please fill in all fields');
      return;
    }

    const selectedDay = daysOfWeek[getDay(new Date(selectedDate))];
    const reservationData = {
      studentName,
      userId: selectedUser,
      day: selectedDay,
      date: selectedDate,
      time: selectedTime
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
      <Box>
        <TextField
          select
          label="Select User"
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          fullWidth
          variant="outlined"
          margin="normal"
        >
          {users.map(userId => (
            <MenuItem key={userId} value={userId}>{userId}</MenuItem>
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
    </Container>
  );
};

export default ReservationPage;
