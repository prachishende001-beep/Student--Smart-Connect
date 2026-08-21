const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
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
} = require('../controllers/principalController');
const { createAnnouncement } = require('../controllers/notificationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// Apply authentication and role authorization to all principal routes
router.use(verifyToken, requireRole(['principal']));

router.post('/upload-students', upload.single('file'), uploadStudents);
router.post('/upload-teachers', upload.single('file'), uploadTeachers);
router.post('/upload-subjects', upload.single('file'), uploadSubjects);
router.post('/announcement', upload.array('files', 5), createAnnouncement);
router.delete('/users/bulk', deleteManyUsers);
router.delete('/subjects/bulk', deleteManySubjects);
router.post('/assign-hod', assignHod);
router.post('/remove-hod', removeHod);
router.get('/teachers', getTeachers);
router.get('/students', getStudents);
router.get('/download-template/:type', downloadTemplate);
router.get('/departments', getDepartments);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

router.post('/add-subject', addSubject);
router.post('/add-student', addStudent);
router.post('/add-teacher', addTeacher);
router.get('/subjects', getSubjects);
router.delete('/subject/:id', deleteSubject);

module.exports = router;
