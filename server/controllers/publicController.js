const User = require('../models/User');

const getPublicStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: { $in: ['teacher', 'hod', 'fa'] } });
        const departmentDepts = await User.distinct('dept', { dept: { $ne: null, $exists: true } });
        
        res.status(200).json({
            students: studentCount,
            teachers: teacherCount,
            departments: departmentDepts.length,
            placements: '98%', // Hardcoded for now as requested
            experience: '25 Yrs' // Hardcoded for now as requested
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public stats', error: error.message });
    }
};

const getPublicDepartments = async (req, res) => {
    try {
        const depts = await User.distinct('dept', { dept: { $ne: null, $exists: true } });
        
        const departmentDetails = await Promise.all(depts.map(async (deptName) => {
            const hod = await User.findOne({ role: 'hod', dept: deptName });
            const studentCount = await User.countDocuments({ role: 'student', dept: deptName });
            const teacherCount = await User.countDocuments({ role: { $in: ['teacher', 'fa', 'hod'] }, dept: deptName });
            
            return {
                name: deptName,
                head: hod ? hod.name : 'TBD',
                email: hod ? hod.email : `contact@college.edu`,
                students: studentCount,
                faculty: teacherCount
            };
        }));
        
        res.status(200).json(departmentDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public departments', error: error.message });
    }
};

module.exports = {
    getPublicStats,
    getPublicDepartments
};
