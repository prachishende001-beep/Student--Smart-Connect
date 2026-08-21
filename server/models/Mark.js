const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrollmentNo: { type: String, required: true },
    studentName: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    examName: { type: String },
    subjectName: { type: String, required: true },
    section: { type: String, required: true },
    dept: { type: String, required: true },
    marks: { type: Number, required: true },
    outOf: { type: Number, required: true }
}, { timestamps: true });

markSchema.index({ enrollmentNo: 1, examId: 1, subjectName: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
