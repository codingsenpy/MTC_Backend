const crypto = require('crypto');
import { PasswordResetToken } from '../models/PasswordToken.js';

export const generatePasswordResetToken = () => {
    const tutorId=req.params.id
    return crypto.randomBytes(32).toString('hex');
    const token

}