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
        
        const passwordToken = await PasswordResetToken.create(tokenData);

        // Email template
        const mailOptions = {
            from: `"Mohalla Tuition Center" <${process.env.EMAIL_USER}>`,
            to: tutor.email,
            subject: 'Password Reset Request - Mohalla Tuition Center',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
                        <p style="color: #34495e; margin-bottom: 15px;">Dear ${tutor.name},</p>
                        <p style="color: #34495e; margin-bottom: 20px;">We received a request to reset your password for your Mohalla Tuition Center account. Here is your password reset token:</p>
                        <div style="text-align: center; margin: 30px 0; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                            <p style="font-family: monospace; font-size: 16px; word-break: break-all;">${tokenNumber}</p>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                            <p style="color: #e74c3c; margin: 0;">⚠️ This link will expire in 1 hour for security reasons.</p>
                        </div>
                        <p style="color: #34495e; margin-top: 20px;">If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                            This is an automated message from Mohalla Tuition Center. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: 'Password reset token has been sent to your email',
            token: tokenNumber
        });

    } catch (error) {
        console.error('Password reset token generation error:', error);
        res.status(500).json({ 
            message: 'Error generating password reset token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const passwordReset = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const reqTokenNumber = req.params.token;
        const token = await PasswordResetToken.findOne({ token: reqTokenNumber });
        if (!token) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const tutorId= token.tutorId;
        
