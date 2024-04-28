const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Summary = require('./SummaryModel') // 모델 파일 임포트
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cors = require('cors')
app.use(bodyParser.json())
app.use(cors())

// MongoDB 연결
mongoose.connect('mongodb+srv://CBJ:admin13579@cluster1.vtagppt.mongodb.net/Test?retryWrites=true&w=majority')
// MongoDB 데이터베이스에서 Summary 데이터를 조회하는 GET 요청 처리
// 모든 요약 데이터 조회
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

const host = '127.0.0.2'
const port = 8000
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`)
})
// const mongoose = require('mongoose')

// // MongoDB 사용자 이름, 비밀번호, 클러스터 주소를 직접 입력
// const username = 'CBJ'
// const password = 'admin13579'
// const cluster = 'cluster1.vtagppt.mongodb.net'

// const uri = `mongodb+srv://${username}:${password}@${cluster}`

// mongoose
//   .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err))

// const db = mongoose.connection

// // MongoDB 스키마 정의
// const summarySchema = new mongoose.Schema({
//   introduction: String,
//   body: String,
//   conclusion: String,
//   finalSummary: String,
//   imageURL: String
// })

// // MongoDB 모델 생성
// const Summary = mongoose.model('Summary', summarySchema)
