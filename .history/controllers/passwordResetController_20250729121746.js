const crypto = require('crypto');

export const generatePasswordResetToken = () => {
    req.params.id
    return crypto.randomBytes(32).toString('hex');
}