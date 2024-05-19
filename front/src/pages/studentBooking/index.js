import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { setHours, setMinutes, format, isBefore } from 'date-fns';
import { Container, TextField, MenuItem, Button, Typography, Box } from '@mui/material';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ReservationPage = () => {
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const availabilityResponse = await axios.get('http://localhost:8000/availability/');
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
  }, []);

  const handleReservation = async () => {
    if (!studentName || !selectedDay || !selectedTime) {
      alert('Please fill in all fields');
      return;
    }

    const reservationData = {
      studentName,
      day: selectedDay,
      time: selectedTime
    };

    console.log("Sending reservation to server:", reservationData);

    try {
      await axios.post('http://localhost:8000/reservation/', reservationData);
      alert('Reservation made successfully!');
      setStudentName('');
      setSelectedDay('');
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Make a Reservation</Typography>
      <Box>
        <TextField
          label="Student Name"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          select
          label="Day"
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          fullWidth
          variant="outlined"
          margin="normal"
        >
          {daysOfWeek.map(day => (
            <MenuItem key={day} value={day}>{day}</MenuItem>
          ))}
        </TextField>
        {selectedDay && (
          <TextField
            select
            label="Time"
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          >
            {weeklySchedule[selectedDay]?.start && weeklySchedule[selectedDay]?.end &&
              generateTimeSlots(weeklySchedule[selectedDay].start, weeklySchedule[selectedDay].end, weeklySchedule[selectedDay].interval, selectedDay).map(time => (
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
