// models/Student.js
const mongoose = require('mongoose')
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
})
module.exports = mongoose.model('Student', studentSchema)
