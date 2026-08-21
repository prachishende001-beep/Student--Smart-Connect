const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
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
} = require('../controllers/faController');
const { createAnnouncement } = require('../controllers/notificationController');
const { downloadTemplate } = require('../controllers/principalController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.use(verifyToken, requireRole(['fa']));

router.get('/download-template/:type', downloadTemplate);

router.get('/section', getFASection);
router.get('/students', getFAStudents);
router.post('/announcement', upload.array('files', 5), createAnnouncement);

// Fees
router.get('/fees', getFees);
router.post('/fees/upload', upload.single('file'), uploadFees);
router.post('/fees/manual', addManualFee);

// Exams
router.get('/exams', getExams);
router.post('/exams', createExam);
router.patch('/exams/:id/live', goLiveExam);

// Complaints
router.get('/complaints', getSectionComplaints);
router.patch('/complaints/:id/resolve', resolveComplaint);

// Attendance & Marks
router.get('/attendance', getSectionAttendance);
router.get('/marks', getSectionMarks);

module.exports = router;
