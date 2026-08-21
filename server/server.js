require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const principalRoutes = require('./routes/principalRoutes');
const faRoutes = require('./routes/faRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const hodRoutes = require('./routes/hodRoutes');

const publicRoutes = require('./routes/publicRoutes');

app.use('/api/principal', principalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/fa', faRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

const { startExamCron } = require('./utils/examCron');

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        startExamCron();
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
