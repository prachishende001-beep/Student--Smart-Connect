const mongoose = require('mongoose');

const scheduleEntrySchema = new mongoose.Schema({
    subject: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});

const examSchema = new mongoose.Schema({
    examName: { type: String, required: true },
    dept: { type: String, required: true },
    section: { type: String, required: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    isLive: { type: Boolean, default: false },
    schedule: [scheduleEntrySchema]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
