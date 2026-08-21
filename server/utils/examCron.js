const cron = require('node-cron');
const Exam = require('../models/Exam');
const { sendExamNotifications } = require('./notificationUtils');

// Helper to format date as YYYY-MM-DD for comparison
const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const startExamCron = () => {
    // Run every day at 12:01 AM
    cron.schedule('1 0 * * *', async () => {
        console.log('⏳ Running daily exam status check...');
        const todayStr = getTodayStr();

        try {
            // 1. Mark exams as Live today that aren't live yet
            const scheduledExams = await Exam.find({
                isLive: false,
                fromDate: { $lte: todayStr },
                toDate: { $gte: todayStr }
            });

            for (const exam of scheduledExams) {
                exam.isLive = true;
                await exam.save();

                const msg = `🚨 Exam "${exam.examName}" is now LIVE! (${exam.dept} - ${exam.section})`;
                await sendExamNotifications(exam, msg);
                console.log(`✅ Marked exam ${exam._id} as Live and notified users.`);
            }

            // 2. Mark exams as inactive/past that are still marked Live but toDate has passed
            const expiredExams = await Exam.find({
                isLive: true,
                toDate: { $lt: todayStr }
            });

            for (const exam of expiredExams) {
                exam.isLive = false;
                await exam.save();
                console.log(`✅ Marked exam ${exam._id} as completed (past toDate).`);
            }

        } catch (error) {
            console.error('🔥 Error in exam cron job:', error.message);
        }
    });

    console.log('⏱️ Exam status cron job scheduled (runs at 00:01 daily).');
};

module.exports = { startExamCron };
