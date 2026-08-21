const User = require('../models/User');
const Section = require('../models/Section');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const { parseExcel } = require('../utils/excelParser');
const xlsx = require('xlsx');

// ─── OVERVIEW ────────────────────────────────────────────────────────────────

const getTeacherData = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Find all sections where this teacher is assigned to at least one subject
        const sections = await Section.find({ 'subjects.teacher': teacherId })
            .populate('subjects.teacher', 'name email');

        // Build list of { section, subject } pairs for this teacher
        const assignments = [];
        for (const sec of sections) {
            for (const sub of sec.subjects) {
                if (sub.teacher && sub.teacher._id.toString() === teacherId) {
                    assignments.push({
                        section: sec.name,
                        dept: sec.dept,
                        subjectName: sub.name,
                        sectionId: sec._id
                    });
                }
            }
        }

        // Fetch students for each unique section/dept
        const sectionKeys = [...new Set(assignments.map(a => `${a.dept}|${a.section}`))];
        const studentMap = {};
        for (const key of sectionKeys) {
            const [dept, section] = key.split('|');
            const students = await User.find({ role: 'student', dept, sec: section }).sort({ srNo: 1 });
            studentMap[key] = students;
        }

        res.status(200).json({ assignments, studentMap });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teacher data', error: error.message });
    }
};

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

const getAttendance = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { date, subjectName, section, dept } = req.query;
        const records = await Attendance.find({ teacherId, subjectName, section, dept, date });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

const saveAttendance = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { date, subjectName, section, dept, records } = req.body;

        if (!date || !subjectName || !section || !dept || !records?.length) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const bulkOps = records.map(r => ({
            updateOne: {
                filter: { enrollmentNo: r.enrollmentNo, subjectName, date },
                update: {
                    $set: {
                        studentId: r.studentId,
                        enrollmentNo: r.enrollmentNo,
                        studentName: r.studentName,
                        teacherId,
                        subjectName,
                        section,
                        dept,
                        date,
                        status: r.status
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Attendance saved', count: bulkOps.length });
    } catch (error) {
        res.status(500).json({ message: 'Error saving attendance', error: error.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { date, subjectName, section, dept } = req.query;
        const result = await Attendance.deleteMany({ teacherId, date, subjectName, section, dept });
        res.status(200).json({ message: 'Attendance deleted', count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting attendance', error: error.message });
    }
};

const uploadAttendanceExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const teacherId = req.user.id;
        const { date, subjectName, section, dept } = req.body;

        const data = parseExcel(req.file.path);
        const bulkOps = data.map(row => ({
            updateOne: {
                filter: { enrollmentNo: String(row['enrollment no.']), subjectName, date },
                update: {
                    $set: {
                        enrollmentNo: String(row['enrollment no.']),
                        studentName: row['student name'] || '',
                        teacherId,
                        subjectName,
                        section,
                        dept,
                        date,
                        status: String(row['status'] || 'absent').toLowerCase() === 'present' ? 'present' : 'absent'
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Attendance uploaded', count: bulkOps.length });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading attendance', error: error.message });
    }
};

// ─── MARKS ───────────────────────────────────────────────────────────────────

const getCompletedExams = async (req, res) => {
    try {
        const teacherId = req.user.id;
        // Find sections where this teacher teaches
        const sections = await Section.find({ 'subjects.teacher': teacherId });
        const sectionDepts = sections.map(s => ({ section: s.name, dept: s.dept }));

        const today = new Date().toISOString().split('T')[0];
        const exams = [];
        for (const { section, dept } of sectionDepts) {
            const found = await Exam.find({ section, dept, isLive: true, toDate: { $lt: today } });
            exams.push(...found);
        }

        // Remove duplicates by id
        const unique = [...new Map(exams.map(e => [e._id.toString(), e])).values()];
        res.status(200).json(unique);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

const getExamTimetable = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const sections = await Section.find({ 'subjects.teacher': teacherId });
        const sectionDepts = sections.map(s => ({ section: s.name, dept: s.dept }));

        const exams = [];
        for (const { section, dept } of sectionDepts) {
            const found = await Exam.find({ section, dept, isLive: true }).sort({ fromDate: 1 });
            exams.push(...found);
        }

        const unique = [...new Map(exams.map(e => [e._id.toString(), e])).values()];
        res.status(200).json(unique);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable', error: error.message });
    }
};

const getMarks = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { examId, subjectName, section, dept } = req.query;
        const marks = await Mark.find({ teacherId, examId, subjectName, section, dept });
        res.status(200).json(marks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
};

const saveMarks = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { examId, examName, subjectName, section, dept, records } = req.body;

        const bulkOps = records.map(r => ({
            updateOne: {
                filter: { enrollmentNo: r.enrollmentNo, examId, subjectName },
                update: {
                    $set: {
                        studentId: r.studentId,
                        enrollmentNo: r.enrollmentNo,
                        studentName: r.studentName,
                        teacherId,
                        examId,
                        examName,
                        subjectName,
                        section,
                        dept,
                        marks: Number(r.marks),
                        outOf: Number(r.outOf)
                    }
                },
                upsert: true
            }
        }));

        await Mark.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Marks saved', count: bulkOps.length });
    } catch (error) {
        res.status(500).json({ message: 'Error saving marks', error: error.message });
    }
};

const uploadMarksExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const teacherId = req.user.id;
        const { examId, examName, subjectName, section, dept } = req.body;

        const data = parseExcel(req.file.path);
        const bulkOps = data.map(row => ({
            updateOne: {
                filter: { enrollmentNo: String(row['enrollment no.']), examId, subjectName },
                update: {
                    $set: {
                        enrollmentNo: String(row['enrollment no.']),
                        studentName: row['student name'] || '',
                        teacherId,
                        examId,
                        examName,
                        subjectName,
                        section,
                        dept,
                        marks: Number(row['marks'] || 0),
                        outOf: Number(row['out of'] || 100)
                    }
                },
                upsert: true
            }
        }));

        await Mark.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Marks uploaded', count: bulkOps.length });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading marks', error: error.message });
    }
};

// ─── TEMPLATE DOWNLOAD ───────────────────────────────────────────────────────

const downloadTeacherTemplate = async (req, res) => {
    try {
        const { type, section, dept } = req.query;
        const students = await User.find({ role: 'student', sec: section, dept }).sort({ srNo: 1 });

        let headers, rows, fileName;

        if (type === 'attendance') {
            headers = [['enrollment no.', 'student name', 'status']];
            rows = students.map(s => [s.enrollmentNo || '', s.name, 'present']);
            fileName = `attendance_template_${section}.xlsx`;
        } else if (type === 'marks') {
            headers = [['enrollment no.', 'student name', 'marks', 'out of']];
            rows = students.map(s => [s.enrollmentNo || '', s.name, '', '']);
            fileName = `marks_template_${section}.xlsx`;
        } else {
            return res.status(400).json({ message: 'Invalid type' });
        }

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet([...headers, ...rows]);
        xlsx.utils.book_append_sheet(wb, ws, 'Template');
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (error) {
        res.status(500).json({ message: 'Error generating template', error: error.message });
    }
};

module.exports = {
    getTeacherData,
    getAttendance,
    saveAttendance,
    deleteAttendance,
    uploadAttendanceExcel,
    getCompletedExams,
    getExamTimetable,
    getMarks,
    saveMarks,
    uploadMarksExcel,
    downloadTeacherTemplate
};
