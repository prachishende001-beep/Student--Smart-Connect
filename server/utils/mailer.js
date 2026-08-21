const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendCredentials = async (email, password, name, role) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `Login Credentials for ${role} - Student Smart Connect `,
        html: `
            <h1>Welcome to Student Smart Connect , ${name}!</h1>
            <p>You have been assigned the role of <b>${role}</b>.</p>
            <p>Here are your login credentials:</p>
            <ul>
                <li><b>Email:</b> ${email}</li>
                <li><b>Password:</b> ${password}</li>
            </ul>
            <p>Please login and change your password for security.</p>
        `,
    };

    return await transporter.sendMail(mailOptions);
};

const sendOTP = async (email, otp, type) => {
    let subject = 'Verification OTP - Student Smart Connect ';
    if (type === 'registration') subject = 'Registration OTP - Student Smart Connect ';
    else if (type === 'login') subject = 'Login OTP - Student Smart Connect ';
    else if (type === 'password reset') subject = 'Password Reset OTP - Student Smart Connect ';
    const html = `
        <h1>Student Smart Connect  OTP Verification</h1>
        <p>Your OTP for ${type} is: <b style="font-size: 24px; color: #4f46e5;">${otp}</b></p>
        <p>It will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject,
        html
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendCredentials, sendOTP };
