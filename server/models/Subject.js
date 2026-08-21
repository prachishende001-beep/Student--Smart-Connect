const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dept: { type: String, required: true }
}, { timestamps: true });

// Ensure unique subjects per department
subjectSchema.index({ name: 1, dept: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
