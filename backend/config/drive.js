import { google } from 'googleapis';




const oauth2Client = new google.auth.OAuth2(
    process.env.GDRIVE_CLIENT_ID,
    process.env.GDRIVE_CLIENT_SECRET,
    'https://google.com' 
);


oauth2Client.setCredentials({
    refresh_token: process.env.GDRIVE_REFRESH_TOKEN
});


export const drive = google.drive({ version: 'v3', auth: oauth2Client });