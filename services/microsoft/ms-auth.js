const fetch = require('isomorphic-fetch');
require('dotenv').config();

const qs = require('querystring');

async function getMsAccessTokenWithCode(authCode, redirectUri) {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;

  const params = {
    client_id: process.env.CLIENT_ID,
    scope: 'https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/OnlineMeetings.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read',
    code: authCode,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    client_secret: process.env.CLIENT_SECRET,
  };

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: qs.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Error getting MS token: ${data.error} - ${data.error_description}`);
  }

  return data.access_token;
}

module.exports = { getMsAccessTokenWithCode };
