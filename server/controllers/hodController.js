const User = require('../models/User');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const { sendCredentials } = require('../utils/mailer');
const crypto = require('crypto');

const getDeptStudents = async (req, res) => {
    try {
        const hodDept = req.user.dept;
        if (!hodDept) return res.status(400).json({ message: 'HOD department not found in token' });

        const students = await User.find({ role: 'student', dept: hodDept });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department students', error: error.message });
    }
};

const getDeptTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: { $in: ['teacher', 'fa', 'hod'] } });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers', error: error.message });
    }
};

const getDeptSections = async (req, res) => {
    try {
        const hodDept = req.user.dept;
        const sections = await Section.find({ dept: hodDept }).populate('fa', 'name email').populate('subjects.teacher', 'name email');
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sections', error: error.message });
    }
};

const assignFA = async (req, res) => {
    try {
        const { sectionName, teacherId } = req.body;
        const hodDept = req.user.dept;

        const teacher = await User.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        let section = await Section.findOne({ dept: hodDept, name: sectionName });
        if (!section) {
            section = new Section({ dept: hodDept, name: sectionName, subjects: [] });
        }

        section.fa = teacherId;
        await section.save();

        if (teacher.role === 'teacher') {
            teacher.role = 'fa';
            const tempPassword = crypto.randomBytes(4).toString('hex');
            teacher.password = tempPassword;
            await teacher.save();
            await sendCredentials(teacher.email, tempPassword, teacher.name, `Faculty Advisor for Section ${sectionName}`);
        }

        res.status(200).json({ message: 'FA assigned successfully', section });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning FA', error: error.message });
    }
};

const assignSubjectTeacher = async (req, res) => {
    try {
        const { sectionName, subjectName, teacherId } = req.body;
        const hodDept = req.user.dept;

        const teacher = await User.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        let section = await Section.findOne({ dept: hodDept, name: sectionName });
        if (!section) {
            section = new Section({ dept: hodDept, name: sectionName, subjects: [] });
        }

        const existingSubjectIndex = section.subjects.findIndex(s => s.name === subjectName);
        if (existingSubjectIndex >= 0) {
            section.subjects[existingSubjectIndex].teacher = teacherId;
        } else {
            section.subjects.push({ name: subjectName, teacher: teacherId });
        }

        await section.save();

        // Optionally send email to subject teacher if they are just a 'teacher' and haven't logged in yet
        // For simplicity, we just send notification
        if (teacher.role === 'teacher') {
            const tempPassword = crypto.randomBytes(4).toString('hex');
            teacher.password = tempPassword;
            await teacher.save();
            await sendCredentials(teacher.email, tempPassword, teacher.name, `Subject Teacher for ${subjectName} in Section ${sectionName}`);
        }

        res.status(200).json({ message: 'Subject teacher assigned successfully', section });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning subject teacher', error: error.message });
    }
};

const getDeptSubjects = async (req, res) => {
    try {
        const hodDept = req.user.dept;
        const subjects = await Subject.find({ dept: hodDept });
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department subjects', error: error.message });
    }
};

const getDeptAttendance = async (req, res) => {
    try {
        const hodDept = req.user.dept;
        const records = await Attendance.find({ dept: hodDept });

        // Aggregate by section
        const sectionStats = {};
        records.forEach(r => {
            if (!sectionStats[r.section]) {
                sectionStats[r.section] = { present: 0, total: 0 };
            }
            sectionStats[r.section].total += 1;
            if (r.status === 'present') sectionStats[r.section].present += 1;
        });

        res.status(200).json(sectionStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department attendance', error: error.message });
    }
};

const getDeptMarks = async (req, res) => {
    try {
        const hodDept = req.user.dept;
        const marks = await Mark.find({ dept: hodDept });

        // Aggregate by section and exam
        const stats = {};
        marks.forEach(m => {
            const key = `${m.section}_${m.examName}`;
            if (!stats[key]) {
                stats[key] = { section: m.section, examName: m.examName, totalMarks: 0, outOf: 0, count: 0 };
            }
            stats[key].totalMarks += m.marks;
            stats[key].outOf += m.outOf;
            stats[key].count += 1;
        });

        res.status(200).json(Object.values(stats));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department marks', error: error.message });
    }
};

module.exports = {
    getDeptStudents,
    getDeptTeachers,
    getDeptSections,
    assignFA,
    assignSubjectTeacher,
    getDeptSubjects,
    getDeptAttendance,
    getDeptMarks
};

