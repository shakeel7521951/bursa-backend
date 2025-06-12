import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

// ✅ Setup transporter using Gmail SMTP with App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "bursatransromaniaitalia@gmail.com",        // ✅ Your Gmail address
        pass: "xecu ywbg xztn rigr"             // ✅ Gmail App Password (generated, not real password)
    },
    secure: true,
    timeout: 10000
});

// ✅ SendMail utility function
const SendMail = async (email, subject, text) => {
    try {
        const mailOptions = {
            from: 'bursatransromaniaitalia@gmail.com',     // ✅ Sender email
            to: email,                           // ✅ Receiver email
            subject: subject,
            html: text
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw new Error("Failed to send mail");
    }
};

export default SendMail;
