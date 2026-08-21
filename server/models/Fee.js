const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String },
    enrollmentNo: { type: String },
    section: { type: String, required: true },
    dept: { type: String, required: true },
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
    remainingFees: { type: Number, default: 0 },
    payments: [{
        amount: { type: Number, required: true },
        description: { type: String },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

feeSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
