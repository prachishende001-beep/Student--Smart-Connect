const express = require('express');
const router = express.Router();
const {
    requestRegistrationOTP,
    completeRegistration,
    getDashboardData,
    uploadDocument,
    getDocuments,
    deleteDocument,
    raiseComplaint,
    getComplaints,
    uploadProfilePic
} = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/register/request', requestRegistrationOTP);
router.post('/register/verify', completeRegistration);

router.use(verifyToken);
router.use(requireRole(['student']));
router.get('/dashboard', getDashboardData);

// Document Locker
router.get('/documents', getDocuments);
router.post('/documents/upload', upload.single('file'), uploadDocument);
router.delete('/documents/:id', deleteDocument);

// Complaints
router.get('/complaints', getComplaints);
router.post('/complaints', raiseComplaint);

// Profile Pic (ID Card)
router.post('/profile-pic', upload.single('file'), uploadProfilePic);

module.exports = router;
