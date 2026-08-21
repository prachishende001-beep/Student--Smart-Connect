const express = require('express');
const router = express.Router();
const {
    getDeptStudents,
    getDeptTeachers,
    getDeptSections,
    assignFA,
    assignSubjectTeacher,
    getDeptSubjects,
    getDeptAttendance,
    getDeptMarks
} = require('../controllers/hodController');
const { createAnnouncement } = require('../controllers/notificationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(verifyToken, requireRole(['hod']));

router.get('/students', getDeptStudents);
router.get('/teachers', getDeptTeachers);
router.get('/sections', getDeptSections);
router.get('/subjects', getDeptSubjects);
router.get('/attendance', getDeptAttendance);
router.get('/marks', getDeptMarks);
router.post('/assign-fa', assignFA);
router.post('/assign-subject', assignSubjectTeacher);
router.post('/announcement', upload.array('files', 5), createAnnouncement);

module.exports = router;

