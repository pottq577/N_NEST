const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Summary = require('./SummaryModel')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cors = require('cors')
const Student = require('./models/Student')
const Professor = require('./models/Professor')
app.use(bodyParser.json())
app.use(cors())

mongoose.connect('mongodb+srv://CBJ:admin13579@cluster1.vtagppt.mongodb.net/Test?retryWrites=true&w=majority')

app.get('/api/summaries', async (req, res) => {
  try {
    const summaries = await Summary.find()
    res.json(summaries)
  } catch (error) {
    console.error('Error fetching summaries:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 요약 데이터 저장
app.post('/saveSummary', async (req, res) => {
  try {
    const { finalSummary, imageData } = req.body
    const summary = new Summary({ finalSummary, imageData })
    await summary.save()
    res.status(201).json({ message: 'Summary and image saved successfully' })
  } catch (error) {
    console.error('Failed to save summary:', error)
    res.status(500).json({ error: 'Error saving summary' })
  }
})

// 교수 목록 조회
app.get('/api/professors', async (req, res) => {
  try {
    const professors = await Professor.find()
    res.json(professors)
  } catch (error) {
    console.error('Error fetching professors:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 학생 목록 조회
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find()
    res.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 교수 상담 가능 시간 추가
app.post('/api/professors/add-time', async (req, res) => {
  try {
    const { professorId, date, times } = req.body
    const professor = await Professor.findById(professorId)
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' })
    }
    professor.availableTimes.push({ date, times })
    await professor.save()
    res.status(201).json({ message: 'Available times added successfully' })
  } catch (error) {
    console.error('Failed to add available times:', error)
    res.status(500).json({ error: 'Error adding available times' })
  }
})

const host = '127.0.0.2'
const port = 8000
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`)
})
