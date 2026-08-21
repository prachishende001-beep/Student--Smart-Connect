require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedPrincipal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if principal already exists
        const existingPrincipal = await User.findOne({ email: 'principal@admin.com' });

        if (existingPrincipal) {
            console.log('Principal user already exists.');
        } else {
            const principal = new User({
                name: 'Main Principal',
                email: 'principal@admin.com',
                password: 'admin', // In a real app, use a stronger password
                role: 'principal'
            });

            await principal.save();
            console.log('Principal user seeded successfully!');
            console.log('Email: principal@admin.com');
            console.log('Password: admin');
        }

        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding principal:', error);
        process.exit(1);
    }
};

seedPrincipal();
