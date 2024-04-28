const mongoose = require('mongoose')

const summarySchema = new mongoose.Schema({
  finalSummary: String,
  imageData: String // 필드 이름을 imageURL에서 imageData로 변경
})

// 'productTest' 컬렉션에 연결하여 모델을 생성
const Summary = mongoose.model('Summary', summarySchema, 'productTest')

module.exports = Summary
