const User = require('../models/User');
const Section = require('../models/Section');
const Notification = require('../models/Notification');

/**
 * Sends notifications to all relevant parties for an exam.
 * Relevant parties: Creating FA, All Principals, HOD of the Dept, Subject Teachers for Section, All Students in Section
 */
const sendExamNotifications = async (exam, message) => {
    try {
        const section = await Section.findOne({ name: exam.section, dept: exam.dept })
            .populate('subjects.teacher', '_id');

        const recipientIds = new Set();

        // 1. Teachers in the section
        if (section && section.subjects) {
            for (const sub of section.subjects) {
                if (sub.teacher && sub.teacher._id) recipientIds.add(sub.teacher._id.toString());
            }
        }

        // 2. HOD of this dept
        const hod = await User.findOne({ role: 'hod', dept: exam.dept });
        if (hod) recipientIds.add(hod._id.toString());

        // 3. All principals
        const principals = await User.find({ role: 'principal' });
        principals.forEach(p => recipientIds.add(p._id.toString()));

        // 4. FA who created it
        if (section && section.fa) recipientIds.add(section.fa.toString());

        // 5. All students in this section
        const students = await User.find({ role: 'student', dept: exam.dept, sec: exam.section });
        students.forEach(s => recipientIds.add(s._id.toString()));

        // Prepare notifications
        const notifications = [...recipientIds].map(recipientId => ({
            recipientId,
            message,
            examId: exam._id,
            isRead: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

    } catch (error) {
        console.error('Failed to send exam notifications:', error.message);
    }
};

module.exports = {
    sendExamNotifications
};
