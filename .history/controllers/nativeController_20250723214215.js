import dotenv from 'dotenv';
dotenv.config();

export const versionCheck = (req, res) => {
    const currentVersion = process.env.Native_Version;
    if(req.userVersion=== currentVersion) {
        return res.status(200).json({ message: 'You are using the latest version.' });
    }
    else if(req.userVersion < currentVersion) {
        return res.status(200).json({ message: 'A new version is available.', version: currentVersion });
    }
    res.json({ version: currentVersion });
}