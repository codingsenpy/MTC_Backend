const crypto = require('crypto');
import { PasswordResetToken } from '../models/PasswordToken.js';

export const generatePasswordResetToken =async () => {
    const tutorId=req.params.id
    return crypto.randomBytes(32).toString('hex');
    const tokenData={
        tutorId: tutorId,
        token: token
    }
    const token = await PasswordResetToken.create(tokenData);
    const tutor=await Tutor.findById(tutorId)
    
}