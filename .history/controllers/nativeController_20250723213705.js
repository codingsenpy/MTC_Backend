import dotenv from 'dotenv';
dotenv.config();

export const versionCheck = (req, res) => {
    const currentVersion = process.env.Native_Version;
    res.json({ version: currentVersion });
}