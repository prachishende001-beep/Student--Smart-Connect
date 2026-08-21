const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
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
} = require('../controllers/teacherController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.use(verifyToken, requireRole(['teacher', 'fa']));

router.get('/data', getTeacherData);
router.get('/template', downloadTeacherTemplate);
router.get('/timetable', getExamTimetable);

// Attendance
router.get('/attendance', getAttendance);
router.post('/attendance', saveAttendance);
router.delete('/attendance', deleteAttendance);
router.post('/attendance/upload', upload.single('file'), uploadAttendanceExcel);

// Marks
router.get('/exams', getCompletedExams);
router.get('/marks', getMarks);
router.post('/marks', saveMarks);
router.post('/marks/upload', upload.single('file'), uploadMarksExcel);

module.exports = router;
