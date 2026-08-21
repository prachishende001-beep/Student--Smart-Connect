const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    role: {
        type: String,
        enum: ['principal', 'hod', 'fa', 'teacher', 'student'],
        default: 'student'
    },

    dept: { type: String },
    sec: { type: String },
    mobNo: { type: String },
    srNo: { type: Number },
    enrollmentNo: { type: String },
    startingYear: { type: Number },
    passoutYear: { type: Number },

    isRegistered: { type: Boolean, default: false },

    otp: { type: String },
    otpExpires: { type: Date },

    profilePic: { type: String },
    isActive: { type: Boolean, default: true }

}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);