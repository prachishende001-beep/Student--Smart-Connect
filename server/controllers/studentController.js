const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Exam = require('../models/Exam');
const Fee = require('../models/Fee');
const Section = require('../models/Section');
const Document = require('../models/Document');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { sendOTP } = require('../utils/mailer');
const imagekit = require('../utils/imagekit');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// ─── REGISTRATION ────────────────────────────────────────────────────────────

const requestRegistrationOTP = async (req, res) => {
    try {
        console.log("➡️ Request OTP API called");
        console.log("📥 Request Body:", req.body);

        const { enrollmentNo } = req.body;

        if (!enrollmentNo) {
            console.log("❌ Enrollment number missing");
            return res.status(400).json({ message: 'Enrollment number required' });
        }

        const student = await User.findOne({ enrollmentNo, role: 'student' });

        if (!student) {
            console.log("❌ Student not found");
            return res.status(404).json({ message: 'Student not found. Contact administration.' });
        }

        if (student.isRegistered) {
            console.log("❌ Student already registered");
            return res.status(400).json({ message: 'Student is already registered' });
        }

        if (!student.email) {
            console.log("❌ Student email missing");
            return res.status(400).json({ message: 'No email found for this student. Contact admin.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log("🔑 Generated OTP:", otp);

        student.otp = otp;
        student.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await student.save();

        console.log("✅ OTP saved in database");
        console.log("⌛ OTP expiry:", student.otpExpires);

        await sendOTP(student.email, otp, 'registration');

        res.status(200).json({ message: `OTP sent to ${student.email}` });

    } catch (error) {
        console.error("🔥 OTP Error:", error);
        res.status(500).json({ message: 'Error generating OTP', error: error.message });
    }
};
const completeRegistration = async (req, res) => {
    try {
        console.log("➡️ Complete Registration API called");
        console.log("📥 Request Body:", req.body);

        const { enrollmentNo, otp, password } = req.body;

        if (!enrollmentNo || !otp || !password) {
            console.log("❌ Missing fields");
            return res.status(400).json({ message: 'All fields required' });
        }

        console.log("🔍 Searching student with enrollmentNo:", enrollmentNo);

        const student = await User.findOne({ enrollmentNo, role: 'student' });

        if (!student) {
            console.log("❌ Student not found");
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log("✅ Student found:", student.enrollmentNo);
        console.log("🔑 Stored OTP:", student.otp);
        console.log("⌛ OTP Expiry:", student.otpExpires);
        console.log("🧾 Entered OTP:", otp);

        if (student.otp !== otp || student.otpExpires < new Date()) {
            console.log("❌ Invalid or expired OTP");
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        console.log("✅ OTP verified");

        student.password = password; // Pre-save hook will hash it
        student.isRegistered = true;
        student.otp = undefined;
        student.otpExpires = undefined;

        await student.save();

        console.log("🎉 Registration completed for:", enrollmentNo);

        res.status(200).json({ message: 'Registration complete. You can now login.' });

    } catch (error) {
        console.error("🔥 Registration Error:", error);
        res.status(500).json({ message: 'Error completing registration', error: error.message });
    }
};

// ─── DASHBOARD DATA ──────────────────────────────────────────────────────────

const getDashboardData = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const { dept, sec: sectionName, enrollmentNo } = student;
        const section = await Section.findOne({ name: sectionName, dept }).populate('fa', 'name email mobNo');

        // Attendance stats
        const records = await Attendance.find({ enrollmentNo });
        const attendanceStats = {};
        records.forEach(r => {
            if (!attendanceStats[r.subjectName]) {
                attendanceStats[r.subjectName] = { present: 0, total: 0 };
            }
            attendanceStats[r.subjectName].total += 1;
            if (r.status === 'present') attendanceStats[r.subjectName].present += 1;
        });

        // Marks
        const marks = await Mark.find({ enrollmentNo }).sort({ createdAt: -1 });

        // Fees
        const fee = await Fee.findOne({ enrollmentNo }) || null;

        // Exams
        const today = new Date().toISOString().split('T')[0];
        const exams = await Exam.find({ section: sectionName, dept, isLive: true, toDate: { $gte: today } }).sort({ fromDate: 1 });

        res.status(200).json({
            profile: {
                name: student.name,
                email: student.email,
                enrollmentNo: student.enrollmentNo,
                dept: student.dept,
                sec: student.sec,
                profilePic: student.profilePic,
                fa: section?.fa ? { name: section.fa.name, email: section.fa.email, phone: section.fa.mobNo } : null
            },
            attendanceStats,
            marks,
            fee,
            exams
        });

    } catch (error) {
        console.error("🔥 Dashboard Error:", error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};

// ─── DOCUMENT LOCKER ─────────────────────────────────────────────────────────

const uploadDocument = async (req, res) => {
    try {
        console.log("➡️ Upload Document API called");

        if (!req.file) {
            console.log("❌ No file uploaded");
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("📁 Uploaded File Info:", req.file);
        console.log("👤 User ID:", req.user?.id);
        console.log("📥 Request Body:", req.body);

        const { name, type } = req.body;

        console.log("📖 Reading file from path:", req.file.path);

        const fileContent = fs.readFileSync(req.file.path);

        console.log("☁️ Uploading file to ImageKit...");

        const uploadResponse = await imagekit.upload({
            file: fileContent,
            fileName: req.file.originalname,
            folder: `/student-docs/${req.user.id}`
        });

        console.log("✅ ImageKit Upload Success");
        console.log("🔗 File URL:", uploadResponse.url);
        console.log("🆔 File ID:", uploadResponse.fileId);

        const newDoc = new Document({
            studentId: req.user.id,
            name: name || req.file.originalname,
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
            type: type || 'other'
        });

        console.log("💾 Saving document to database...");

        await newDoc.save();

        console.log("✅ Document saved in DB:", newDoc._id);

        console.log("🧹 Deleting temp file:", req.file.path);
        fs.unlinkSync(req.file.path);

        console.log("🎉 Upload process completed");

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: newDoc
        });

    } catch (error) {

        console.error("🔥 Upload Error:", error);

        if (req.file) {
            console.log("🧹 Cleaning temp file after error:", req.file.path);
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: 'Upload failed',
            error: error.message
        });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No photo uploaded' });

        const fileContent = fs.readFileSync(req.file.path);
        const uploadResponse = await imagekit.upload({
            file: fileContent,
            fileName: `profile_${req.user.id}_${Date.now()}.jpg`,
            folder: `/student-profiles`
        });

        // Update user record
        await User.findByIdAndUpdate(req.user.id, { profilePic: uploadResponse.url });

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'Profile photo updated', url: uploadResponse.url });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, studentId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        await imagekit.deleteFile(doc.fileId);
        await Document.findByIdAndDelete(doc._id);

        res.status(200).json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Deletion failed', error: error.message });
    }
};

// ─── COMPLAINTS ──────────────────────────────────────────────────────────────

const raiseComplaint = async (req, res) => {
    try {
        const { category, description } = req.body;
        const student = await User.findById(req.user.id);

        const complaint = new Complaint({
            studentId: req.user.id,
            dept: student.dept,
            sec: student.sec,
            category,
            description
        });

        await complaint.save();

        try {
            const sectionRecord = await Section.findOne({ name: student.sec, dept: student.dept });
            if (sectionRecord && sectionRecord.fa) {
                const notif = new Notification({
                    recipientId: sectionRecord.fa,
                    message: `New complaint raised by ${student.name} (${student.enrollmentNo}): ${category}`,
                    isRead: false
                });
                await notif.save();
            }
        } catch (err) {
            console.error('Error creating notification for complaint:', err.message);
        }

        res.status(201).json({ message: 'Complaint registered successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Failed to raise complaint', error: error.message });
    }
};

const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
};

module.exports = {
    requestRegistrationOTP,
    completeRegistration,
    getDashboardData,
    uploadDocument,
    getDocuments,
    deleteDocument,
    raiseComplaint,
    getComplaints,
    uploadProfilePic
};
