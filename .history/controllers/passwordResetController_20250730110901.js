import crypto from 'crypto';
import bcrypt from 'bcryptjs';
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
        const {tutorNumber, tutorMail} = req.body;
        if (!tutorNumber || !tutorMail) {
            return res.status(400).json({ message: 'Please provide both tutor number and email.' });
        }

        // Find tutor by both phone number and email
        const tutor = await Tutor.findOne({ 
            phone: tutorNumber,
            email: tutorMail
        });

        if (!tutor) {
            console.log("error hit!!!!!!!!!!!! yay")
            return res.status(400).json({ message: 'Phone number and email do not match.' });
        }

        const tokenNumber = crypto.randomBytes(32).toString('hex');
        
        // Create token document
        const tokenData = {
            token: tokenNumber,
            tutorId: tutor._id
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
            message: 'Password reset link has been sent to the given email'
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
        const tutorId = token.tutorId;
        const tutor = await Tutor.findById(tutorId);
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        const updatedTutor = await Tutor.findByIdAndUpdate(
            tutorId,
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!updatedTutor) {
            return res.status(500).json({ message: 'Error updating password' });
        }

        // Delete the used token
        await PasswordResetToken.deleteOne({ token: reqTokenNumber });

        // Send confirmation email
        const mailOptions = {
            from: `"Mohalla Tuition Center" <${process.env.EMAIL_USER}>`,
            to: tutor.email,
            subject: 'Password Reset Successful - Mohalla Tuition Center',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Password Reset Successful</h2>
                        <p style="color: #34495e; margin-bottom: 15px;">Dear ${tutor.name},</p>
                        <p style="color: #34495e; margin-bottom: 20px;">Your password has been successfully reset. If you did not initiate this change, please contact our support team immediately.</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                            <p style="color: #e74c3c; margin: 0;">⚠️ For security reasons, please make sure to change your password regularly.</p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                            This is an automated message from Mohalla Tuition Center. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            message: 'Error resetting password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
         });
    }
};