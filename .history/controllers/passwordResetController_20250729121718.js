const crypto = require('crypto');

export const generatePasswordResetToken = () => {

    return crypto.randomBytes(32).toString('hex');
}