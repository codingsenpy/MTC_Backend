const crypto = require('crypto');

export const generatePasswordResetToken = () => {
    const tutorId=req.params.id
    return crypto.randomBytes(32).toString('hex');
    
}