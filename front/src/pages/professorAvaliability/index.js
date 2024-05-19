import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { setHours, setMinutes, format, isBefore } from 'date-fns';
import { Container, TextField, MenuItem, Button, Typography, Grid, Box, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeIntervals = [15, 30, 45, 60];

const AvailabilitySettings = () => {
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: { start: '09:00', end: '17:00', interval: 30, maxCapacity: 1 },
    Tuesday: { start: '09:00', end: '17:00', interval: 30, maxCapacity: 1 },
    Wednesday: { start: '09:00', end: '17:00', interval: 30, maxCapacity: 1 },
    Thursday: { start: '09:00', end: '17:00', interval: 30, maxCapacity: 1 },
    Friday: { start: '09:00', end: '17:00', interval: 30, maxCapacity: 1 },
    Saturday: { start: null, end: null, interval: 30, maxCapacity: 1 },
    Sunday: { start: null, end: null, interval: 30, maxCapacity: 1 }
  });
  const [unavailableTimes, setUnavailableTimes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/availability/');
        setWeeklySchedule(response.data.weeklySchedule);
        setUnavailableTimes(response.data.unavailableTimes);
      } catch (error) {
        console.error('Error fetching availability:', error);
        alert('Error fetching availability: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    };

    fetchData();
  }, []);

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
      weeklySchedule,
      unavailableTimes
    };

    console.log("Sending to server:", availabilityData);

    try {
      await saveAvailability(availabilityData);
      alert('Availability settings saved successfully!');
    } catch (error) {
      console.error('Error processing availability:', error);
      alert('Error processing availability: ' + (error.response?.data?.detail || 'Unknown error'));
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Availability Settings</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {daysOfWeek.map(day => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <Typography variant="h6">{day}</Typography>
              <TextField
                label="Start Time"
                type="time"
                value={weeklySchedule[day].start || ''}
                onChange={e => handleTimeChange(day, 'start', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min
                disabled={weeklySchedule[day].start === null}
                variant="outlined"
                margin="normal"
              />
              <TextField
                label="End Time"
                type="time"
                value={weeklySchedule[day].end || ''}
                onChange={e => handleTimeChange(day, 'end', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min
                disabled={weeklySchedule[day].end === null}
                variant="outlined"
                margin="normal"
              />
              <TextField
                select
                label="Time Interval (minutes)"
                value={weeklySchedule[day].interval}
                onChange={e => handleTimeChange(day, 'interval', parseInt(e.target.value))}
                fullWidth
                variant="outlined"
                margin="normal"
                disabled={weeklySchedule[day].start === null}
              >
                {timeIntervals.map(interval => (
                  <MenuItem key={interval} value={interval}>{interval}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Max Capacity per Slot"
                type="number"
                value={weeklySchedule[day].maxCapacity}
                onChange={e => handleTimeChange(day, 'maxCapacity', parseInt(e.target.value))}
                fullWidth
                variant="outlined"
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={weeklySchedule[day].start === null}
              />
              <Button variant="contained" color="secondary" onClick={() => handleDayToggle(day)} fullWidth>
                {weeklySchedule[day].start === null ? 'Enable' : 'Disable'}
              </Button>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Save Settings
            </Button>
          </Grid>
        </Grid>
      </form>

      <Box mt={5}>
        <Typography variant="h5">Weekly Schedule</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
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
                      {weeklySchedule[day].start && weeklySchedule[day].end &&
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
    </Container>
  );
};

export default AvailabilitySettings;
