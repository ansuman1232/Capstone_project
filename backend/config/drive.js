import { google } from 'googleapis';



// 1. Initialize the OAuth2 client using your new credentials
const oauth2Client = new google.auth.OAuth2(
    process.env.GDRIVE_CLIENT_ID,
    process.env.GDRIVE_CLIENT_SECRET,
    'https://google.com' // Must match the redirect URI used above
);

// 2. Set the refresh token so it can automatically generate temporary access tokens
oauth2Client.setCredentials({
    refresh_token: process.env.GDRIVE_REFRESH_TOKEN
});

// 3. Pass the oauth2Client to your drive instance
export const drive = google.drive({ version: 'v3', auth: oauth2Client });