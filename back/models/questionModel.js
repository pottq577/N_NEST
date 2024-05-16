const mongoose = require('mongoose')
const { Schema } = mongoose

const answerSchema = new Schema({
  text: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

const questionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  customCategories: [{ type: String }],
  code: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  answers: [answerSchema]
})

const Question = mongoose.model('Question', questionSchema)
const Answer = mongoose.model('Answer', answerSchema)

module.exports = { Question, Answer }
