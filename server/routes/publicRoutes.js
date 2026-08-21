const express = require('express');
const router = express.Router();
const { getPublicStats, getPublicDepartments } = require('../controllers/publicController');

router.get('/stats', getPublicStats);
router.get('/departments', getPublicDepartments);

module.exports = router;
