const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const sectionSchema = new mongoose.Schema({
    dept: { type: String, required: true },
    name: { type: String, required: true }, // e.g., 'A', 'B'
    fa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subjects: [subjectSchema]
}, { timestamps: true });

// Ensure unique sections per department
sectionSchema.index({ dept: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
