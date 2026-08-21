const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileId: { type: String, required: true },
    type: { type: String, default: 'other' }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
