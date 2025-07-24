import dotenv from 'dotenv';
dotenv.config();

export const versionCheck = (req, res) => {
    const currentVersion = process.env.Native_Version;
    req.userVersion
    res.json({ version: currentVersion });
}