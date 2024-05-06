import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const ProfessorPage = () => {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await axios.get('http://127.0.0.2:8000/api/appointments')

      const formattedEvents = data.map(app => ({
        title: `상담: ${app.student.name}`,
        start: new Date(app.date),
        end: new Date(app.date),
        allDay: false
      }))
      setEvents(formattedEvents)
    }
    fetchEvents()
  }, [])

  const addAvailability = async () => {
    const newEvent = {
      start: new Date(),
      end: new Date(),
      title: '가능한 시간'
    }
    const { data } = await axios.post('http://127.0.0.2:8000/api/professors/add-time', { newEvent })
    setEvents([...events, newEvent])
  }

  return (
    <div>
      <h1>교수 관리 페이지</h1>
      <Calendar localizer={localizer} events={events} startAccessor='start' endAccessor='end' style={{ height: 500 }} />
      <button onClick={addAvailability}>시간 추가하기</button>
    </div>
  )
}

export default ProfessorPage
