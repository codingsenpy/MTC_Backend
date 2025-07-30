const crypto = require('crypto');
import { PasswordResetToken } from '../models/PasswordToken.js';

export const generatePasswordResetToken =async () => {
    const tutorId=req.params.id
    const tokennumber= crypto.randomBytes(32).toString('hex');
    const tutor=await Tutor.findById(tutorId)
    if (!tutor) {
        res.send('Tutor not found');
    }
    tutorMail=tutor.email;
    const tokenData={
        token: tokenNumber,
        tutorId: tutorId,
        token: token
    }
    const token = await PasswordResetToken.create(tokenData);
}