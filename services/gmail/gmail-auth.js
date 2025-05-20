const { google } = require('googleapis');
const googleCredentials = require('../../google-console-credentials.json');

const { client_secret, client_id, redirect_uris } = googleCredentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

function getGmailAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
  });
}

async function setGmailCredentials(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(oAuth2Client, to, subject, body) {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    body,
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
}

module.exports = {
  getGmailAuthUrl,
  setGmailCredentials,
  sendEmail,
};
