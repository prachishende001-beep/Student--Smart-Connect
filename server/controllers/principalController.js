const User = require('../models/User');
const Subject = require('../models/Subject');
const { parseExcel } = require('../utils/excelParser');
const { sendCredentials } = require('../utils/mailer');
const crypto = require('crypto');
const xlsx = require('xlsx');

const uploadStudents = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const data = parseExcel(req.file.path);

        const students = data.map(item => ({
            srNo: item['sr.no.'],
            name: item['name'],
            email: item['email'],
            mobNo: item['mob nu.'],
            dept: item['dept'],
            sec: item['sec'],
            enrollmentNo: item['enrollment no.'],
            startingYear: item['starting year'],
            passoutYear: item['year of passout'],
            role: 'student',
            password: item['enrollment no.'] || 'student123' // Default password
        }));

        await User.insertMany(students, { ordered: false });
        res.status(200).json({ message: 'Students uploaded successfully', count: students.length });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading students', error: error.message });
    }
};

const uploadTeachers = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const data = parseExcel(req.file.path);

        const teachers = data.map(item => ({
            name: item['teacher name'],
            email: item['email'],
            startingYear: item['starting year'],
            role: 'teacher',
            password: crypto.randomBytes(4).toString('hex') // Random initial password
        }));

        await User.insertMany(teachers, { ordered: false });
        res.status(200).json({ message: 'Teachers uploaded successfully', count: teachers.length });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading teachers', error: error.message });
    }
};

const uploadSubjects = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const data = parseExcel(req.file.path);

        const subjects = data.map(item => ({
            name: item['subject name'],
            dept: item['dept']
        }));

        await Subject.insertMany(subjects, { ordered: false });
        res.status(200).json({ message: 'Subjects uploaded successfully', count: subjects.length });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading subjects', error: error.message });
    }
};

const assignHod = async (req, res) => {
    try {
        const { teacherId, dept } = req.body;
        if (!teacherId || !dept) return res.status(400).json({ message: 'Teacher ID and Department are required' });

        // 1. Demote any existing HOD of this department
        await User.updateMany({ role: 'hod', dept }, { role: 'teacher', $unset: { dept: 1 } });

        // 2. Assign new HOD
        const teacher = await User.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const temporaryPassword = crypto.randomBytes(4).toString('hex');
        teacher.role = 'hod';
        teacher.dept = dept;
        teacher.password = temporaryPassword;
        await teacher.save();

        await sendCredentials(teacher.email, temporaryPassword, teacher.name, 'HOD');

        res.status(200).json({ message: 'HOD assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning HOD', error: error.message });
    }
};

const removeHod = async (req, res) => {
    try {
        const { dept } = req.body;
        if (!dept) return res.status(400).json({ message: 'Department is required' });

        await User.updateMany({ role: 'hod', dept }, { role: 'teacher', $unset: { dept: 1 } });
        res.status(200).json({ message: 'HOD removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing HOD', error: error.message });
    }
};

const getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: { $in: ['teacher', 'hod', 'fa'] } });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers', error: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

const downloadTemplate = async (req, res) => {
    try {
        const { type } = req.params;
        let headers = [];
        let fileName = "";

        if (type === 'students') {
            headers = [
                ['sr.no.', 'name', 'email', 'mob nu.', 'dept', 'sec', 'enrollment no.', 'starting year', 'year of passout']
            ];
            fileName = "students_template.xlsx";
        } else if (type === 'teachers') {
            headers = [
                ['teacher name', 'email', 'starting year']
            ];
            fileName = "teachers_template.xlsx";
        } else if (type === 'subjects') {
            headers = [
                ['subject name', 'dept']
            ];
            fileName = "subjects_template.xlsx";
        } else if (type === 'fees') {
            headers = [
                ['enrollment no.', 'student name', 'total fees', 'paid fees']
            ];
            fileName = "fees_template.xlsx";
        } else {
            return res.status(400).json({ message: 'Invalid template type' });
        }

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet(headers);
        xlsx.utils.book_append_sheet(wb, ws, "Template");

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (error) {
        res.status(500).json({ message: 'Error generating template', error: error.message });
    }
};

const getDepartments = async (req, res) => {
    try {
        const studentDepts = await User.distinct('dept', { role: 'student', dept: { $ne: null, $exists: true } });

        const departmentDetails = await Promise.all(studentDepts.map(async (deptName) => {
            const hod = await User.findOne({ role: 'hod', dept: deptName });
            return {
                name: deptName,
                hod: hod ? { name: hod.name, email: hod.email } : null
            };
        }));

        res.status(200).json(departmentDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { returnDocument: "after" }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error updating user',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const addSubject = async (req, res) => {
    try {
        const { name, dept } = req.body;
        if (!name || !dept) return res.status(400).json({ message: 'Name and Department are required' });

        const subject = new Subject({ name, dept });
        await subject.save();
        res.status(201).json({ message: 'Subject added successfully', subject });
    } catch (error) {
        res.status(500).json({ message: 'Error adding subject', error: error.message });
    }
};

const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects', error: error.message });
    }
};

const addStudent = async (req, res) => {
    try {
        const { name, email, dept, sec, enrollmentNo, mobNo, startingYear, passoutYear } = req.body;
        if (!name || !email || !enrollmentNo) {
            return res.status(400).json({ message: 'Name, Email, and Enrollment Number are required' });
        }

        const student = new User({
            name,
            email,
            dept,
            sec,
            enrollmentNo,
            mobNo,
            startingYear,
            passoutYear,
            role: 'student',
            password: enrollmentNo || 'student123'
        });

        await student.save();
        res.status(201).json({ message: 'Student added successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Error adding student', error: error.message });
    }
};

const addTeacher = async (req, res) => {
    try {
        const { name, email, startingYear } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required' });
        }

        const teacher = new User({
            name,
            email,
            startingYear,
            role: 'teacher',
            password: crypto.randomBytes(4).toString('hex')
        });

        await teacher.save();
        res.status(201).json({ message: 'Teacher added successfully', teacher });
    } catch (error) {
        res.status(500).json({ message: 'Error adding teacher', error: error.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByIdAndDelete(id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject', error: error.message });
    }
};

const deleteManyUsers = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs provided' });

        await User.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: `${ids.length} users deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting users', error: error.message });
    }
};

const deleteManySubjects = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs provided' });

        await Subject.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: `${ids.length} subjects deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subjects', error: error.message });
    }
};

module.exports = {
    uploadStudents,
    uploadTeachers,
    assignHod,
    getTeachers,
    getStudents,
    downloadTemplate,
    getDepartments,
    updateUser,
    deleteUser,
    deleteManyUsers,
    removeHod,
    addSubject,
    getSubjects,
    deleteSubject,
    deleteManySubjects,
    uploadSubjects,
    addStudent,
    addTeacher
};
