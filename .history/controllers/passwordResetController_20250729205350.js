import crypto from 'crypto';
import { PasswordResetToken } from '../models/PasswordToken.js';
import Tutor from '../models/Tutor.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const generatePasswordResetToken = async (req, res) => {
    try {
        const tutorId = req.params.id;
        const tokenNumber = crypto.randomBytes(32).toString('hex');
        
        // Find tutor
        const tutor = await Tutor.findById(tutorId);
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Create token document
        const tokenData = {
            token: tokenNumber,
            tutorId: tutorId
        };
        
        await PasswordResetToken.create(tokenData);

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/password-reset/${tokenNumber}`;

        // Email template
        const mailOptions = {
            from: 'your-email@gmail.com', // Replace with your email
            to: tutor.email,
            subject: 'Password Reset Request - Mohalla Tuition Center',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                    <p style="color: #34495e;">Dear ${tutor.name},</p>
                    <p style="color: #34495e;">We received a request to reset your password. To proceed with the password reset, please click the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #34495e;">This link will expire in 1 hour for security reasons.</p>
                    <p style="color: #34495e;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px; text-align: center;">
                        This is an automated message, please do not reply to this email.
                    </p>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: 'Password reset link has been sent to your email',
            debug: process.env.NODE_ENV === 'development' ? resetLink : undefined
        });

    } catch (error) {
        console.error('Password reset token generation error:', error);
        res.status(500).json({ 
            message: 'Error generating password reset token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
}