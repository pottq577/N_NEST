// models/Professor.js
const mongoose = require('mongoose')
const professorSchema = new mongoose.Schema({
  name: String,
  email: String,
  availableTimes: [
    {
      date: String,
      times: [String]
    }
  ]
})
module.exports = mongoose.model('Professor', professorSchema)
