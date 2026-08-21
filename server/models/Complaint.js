const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dept: { type: String, required: true },
    sec: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    faComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
