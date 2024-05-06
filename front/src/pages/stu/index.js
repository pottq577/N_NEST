import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const StudentPage = () => {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await axios.get('http://127.0.0.2:8000/api/professors')

      const formattedEvents = data.map(prof => ({
        title: `${prof.name} 상담 가능`,
        start: new Date(prof.availableTimes.date), // 가정: 각 교수 데이터에 date 포함
        end: new Date(prof.availableTimes.date),
        professorId: prof._id,
        allDay: false
      }))
      setEvents(formattedEvents)
    }
    fetchEvents()
  }, [])

  const handleSelectEvent = event => {
    setSelectedEvent(event)
  }

  const bookAppointment = async () => {
    if (!selectedEvent) return

    const { data } = await axios.post('http://127.0.0.2:8000/api/appointments', {
      date: selectedEvent.start,
      time: selectedEvent.start,
      professor: selectedEvent.professorId,
      student: '학생ID' // 현재 로그인한 학생의 ID 사용
    })
    alert('예약 완료')
  }

  return (
    <div>
      <h1>학생 상담 예약 페이지</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
      />
      <button onClick={bookAppointment} disabled={!selectedEvent}>
        예약하기
      </button>
    </div>
  )
}

export default StudentPage
