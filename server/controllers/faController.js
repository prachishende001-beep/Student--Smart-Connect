const User = require('../models/User');
const Section = require('../models/Section');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const { parseExcel } = require('../utils/excelParser');

const getFASection = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId })
            .populate('fa', 'name email')
            .populate('subjects.teacher', 'name email');
        if (!section) return res.status(404).json({ message: 'No section assigned to this FA' });
        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FA section', error: error.message });
    }
};

const getFAStudents = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned to this FA' });
        const students = await User.find({ role: 'student', dept: section.dept, sec: section.name }).sort({ srNo: 1 });
        res.status(200).json({ students, section: { name: section.name, dept: section.dept } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

// ─── FEES ────────────────────────────────────────────────────────────────────

const getFees = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });
        const fees = await Fee.find({ section: section.name, dept: section.dept });
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fees', error: error.message });
    }
};

const uploadFees = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });

        const data = parseExcel(req.file.path);
        const bulkOps = [];

        for (const rawRow of data) {
            const row = {};
            for (const key in rawRow) {
                row[key.toLowerCase().trim()] = rawRow[key];
            }

            const enrollmentNo = String(row['enrollment no.'] || '').trim();
            const student = enrollmentNo
                ? await User.findOne({ enrollmentNo, dept: section.dept, sec: section.name })
                : null;

            const totalFees = Number(row['total fees'] || 0);
            const paidFees = Number(row['paid fees'] || 0);

            bulkOps.push({
                updateOne: {
                    filter: student ? { studentId: student._id } : { enrollmentNo },
                    update: {
                        $set: {
                            studentId: student?._id,
                            studentName: row['student name'] || student?.name || '',
                            enrollmentNo,
                            section: section.name,
                            dept: section.dept,
                            totalFees,
                            paidFees,
                            remainingFees: totalFees - paidFees
                        }
                    },
                    upsert: true
                }
            });
        }

        if (bulkOps.length > 0) await Fee.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Fees uploaded successfully', count: bulkOps.length });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading fees', error: error.message });
    }
};

const addManualFee = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });

        const { studentId, totalFees, paymentAmount, description } = req.body;
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const total = Number(totalFees || 0);
        const amount = Number(paymentAmount || 0);

        let fee = await Fee.findOne({ studentId });

        if (!fee) {
            fee = new Fee({
                studentId,
                studentName: student.name,
                enrollmentNo: student.enrollmentNo,
                section: section.name,
                dept: section.dept,
                totalFees: total,
                paidFees: amount,
                remainingFees: total - amount,
                payments: amount > 0 ? [{ amount, description, date: new Date() }] : []
            });
        } else {
            if (totalFees !== undefined) fee.totalFees = total;
            if (amount > 0) {
                fee.payments.push({ amount, description, date: new Date() });
                fee.paidFees += amount;
            }
            fee.remainingFees = fee.totalFees - fee.paidFees;
        }

        await fee.save();
        res.status(200).json({ message: 'Fee record updated', fee });
    } catch (error) {
        res.status(500).json({ message: 'Error saving fee', error: error.message });
    }
};

// ─── EXAMS ───────────────────────────────────────────────────────────────────

const getExams = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });
        const exams = await Exam.find({ section: section.name, dept: section.dept }).sort({ createdAt: -1 });
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

const { sendExamNotifications } = require('../utils/notificationUtils');

const createExam = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });

        const { examName, fromDate, toDate, schedule } = req.body;
        if (!examName || !fromDate || !toDate || !schedule?.length) {
            return res.status(400).json({ message: 'Exam name, dates and schedule are required' });
        }

        const exam = new Exam({
            examName,
            dept: section.dept,
            section: section.name,
            fromDate,
            toDate,
            schedule,
            isLive: false // Will be set to true automatically by cron job on fromDate
        });
        await exam.save();

        const msg = `📢 New Exam Scheduled: "${examName}" (${fromDate} to ${toDate})`;
        await sendExamNotifications(exam, msg);

        res.status(201).json({ message: 'Exam scheduled and users notified!', exam });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling exam', error: error.message });
    }
};

const goLiveExam = async (req, res) => {
    // Deprecated for manual use, retaining for backward compatibility
    res.status(400).json({ message: 'Exams now automatically transition to Live state.' });
};

const resolveComplaint = async (req, res) => {
    try {
        const { faComment } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        complaint.status = 'resolved';
        complaint.faComment = faComment;
        await complaint.save();

        res.status(200).json({ message: 'Complaint resolved', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Error resolving complaint', error: error.message });
    }
};

const getSectionComplaints = async (req, res) => {
    try {
        const faId = req.user.id;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });

        const complaints = await Complaint.find({ dept: section.dept, sec: section.name })
            .populate('studentId', 'name enrollmentNo email')
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
};

const getSectionAttendance = async (req, res) => {
    try {
        const faId = req.user.id;
        const { date } = req.query;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });

        const filter = { dept: section.dept, section: section.name };
        if (date) filter.date = date;

        const records = await Attendance.find(filter);

        if (date) {
            return res.status(200).json(records);
        }

        // Aggregate by student
        const attendanceData = {};
        records.forEach(r => {
            if (!attendanceData[r.enrollmentNo]) {
                attendanceData[r.enrollmentNo] = {
                    name: r.studentName,
                    enrollmentNo: r.enrollmentNo,
                    subjects: {}
                };
            }
            if (!attendanceData[r.enrollmentNo].subjects[r.subjectName]) {
                attendanceData[r.enrollmentNo].subjects[r.subjectName] = { present: 0, total: 0 };
            }
            attendanceData[r.enrollmentNo].subjects[r.subjectName].total += 1;
            if (r.status === 'present') attendanceData[r.enrollmentNo].subjects[r.subjectName].present += 1;
        });

        res.status(200).json(Object.values(attendanceData));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

const getSectionMarks = async (req, res) => {
    try {
        const faId = req.user.id;
        const { examId } = req.query;
        const section = await Section.findOne({ fa: faId });
        if (!section) return res.status(404).json({ message: 'No section assigned' });

        const filter = { dept: section.dept, section: section.name };
        if (examId) filter.examId = examId;

        const marks = await Mark.find(filter).sort({ createdAt: -1 });
        res.status(200).json(marks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
};

module.exports = {
    getFASection,
    getFAStudents,
    getFees,
    uploadFees,
    addManualFee,
    getExams,
    createExam,
    goLiveExam,
    getSectionComplaints,
    resolveComplaint,
    getSectionAttendance,
    getSectionMarks
};
