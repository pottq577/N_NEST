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
const { Question, Answer } = require('./models/questionModel')
app.use(bodyParser.json())
app.use(cors())

require('dotenv').config()

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })

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

app.get('/list/questions', async (req, res) => {
  try {
    const questions = await Question.find().populate('answers')
    res.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/questions', async (req, res) => {
  try {
    const { title, description, category, customCategories, code, userId } = req.body
    const newQuestion = new Question({
      title,
      description,
      category,
      customCategories,
      code,
      createdBy: userId
    })
    await newQuestion.save()
    res.status(201).json({ message: 'Question saved successfully' })
  } catch (error) {
    console.error('Failed to save question:', error)
    res.status(500).json({ error: 'Error saving question' })
  }
})

app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('answers')
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }
    res.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/questions/:questionId/answers', async (req, res) => {
  try {
    const { text, userId } = req.body
    const question = await Question.findById(req.params.questionId)
    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }
    const newAnswer = { text, createdBy: userId }
    question.answers.push(newAnswer)
    await question.save()
    res.status(201).json({ message: 'Answer added successfully' })
  } catch (error) {
    console.error('Failed to add answer:', error)
    res.status(500).json({ error: 'Error adding answer' })
  }
})

const port = process.env.PORT || 8000
const host = process.env.HOST || '127.0.0.2'
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`)
})
