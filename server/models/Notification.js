const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For individual notifications
    targetRoles: [{ type: String, enum: ['principal', 'hod', 'fa', 'teacher', 'student'] }], // For broadcasts
    targetDept: { type: String }, // e.g. "IT"
    targetSection: { type: String }, // e.g. "A"
    title: { type: String },
    message: { type: String, required: true },
    senderRole: { type: String }, // For easier UI identifying
    attachments: [{
        url: { type: String },
        fileType: { type: String },
        name: { type: String }
    }],
    isBroadcast: { type: Boolean, default: false },
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track read status for broadcasts
    isRead: { type: Boolean, default: false }, // For individual notifications
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
