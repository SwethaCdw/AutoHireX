const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const bodyParser = require('body-parser');
const amazonRoutes = require('./routes/amazonRoutes');
const { setGmailCredentials } = require('./services/gmail/gmail-auth');
const { getGmailAuthUrl } = require('./services/gmail/gmail-auth');
const { scheduleInterview } = require('./controllers/scheduleInterview');
const { getMsAccessTokenWithCode } = require('./services/microsoft/ms-auth');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());
app.use('/api/amazon', amazonRoutes);

let msAccessTokenCache = null;
let gmailClientCache = null; 

// Testing
app.get('/', (req, res) => {
  res.send('✅ Resume Parser Backend is Running!');
});

// Step 1: Middleware to check if MS token is set
app.get('/ms-login', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.REDIRECT_URI,
    response_mode: 'query',
    scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite Mail.Send User.Read',
  });

  const authUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;

  res.redirect(authUrl);
});

// Step 2: Handle Microsoft Auth Callback
app.get('/ms-auth/callback', async (req, res) => {
  try {
    console.log('Callback query params:', req.query);
    const authCode = req.query.code;
    const msAccessToken = await getMsAccessTokenWithCode(authCode, process.env.REDIRECT_URI);
    
    msAccessTokenCache = msAccessToken;
    console.log("✅ Microsoft token set");

    // Redirect to Gmail auth
    res.redirect('/start-auth');
  } catch (err) {
    console.error(err);
    res.status(500).send('Microsoft authentication failed');
  }
});

// Step 3: Trigger Gmail OAuth
app.get('/start-auth', (req, res) => {
  const url = getGmailAuthUrl();
  res.redirect(url);
});


// Step 4: Handle Gmail Auth Callback and Send Email with Teams Link
app.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const gmailClient = await setGmailCredentials(code);

    gmailClientCache = gmailClient;
    console.log("✅ Gmail client set");

    // Validate MS token is available
    if (!msAccessTokenCache) {
      return res.status(400).send('❌ Microsoft access token not found. Please login first.');
    }

    const candidateEmail = 'swethudocs@gmail.com'; // Replace with dynamic value later
    await scheduleInterview(gmailClientCache, candidateEmail, msAccessTokenCache);

    res.send('✅ Interview scheduled and email sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error during scheduling');
  }
});

// Endpoint to upload and parse resume
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    // Extracting data
    const name = text.match(/Name[:\-]?\s*(.+)/i)?.[1] || 'Not found';
    const phone = text.match(/(\+?\d{1,3}[-.\s]?)?(\d{10})/)?.[0] || 'Not found';
    const experienceMatch = text.match(/(\d+)\s+(years|yrs)\s+of\s+experience/i);
    const experience = experienceMatch ? experienceMatch[1] + ' years' : 'Not found';

    const skillsMatch = text.match(/Skills[:\-]?\s*(.+)/i);
    const skills = skillsMatch ? skillsMatch[1].split(/,|\n/) : ['Not found'];

    const locationMatch = text.match(/Location[:\-]?\s*(.+)/i);
    const location = locationMatch ? locationMatch[1] : 'Not found';

    res.json({
      name,
      phone,
      experience,
      skills,
      location,
    });

    console.log('Parsed data:', {
      name,
      phone,
      experience,
      skills,
      location,
    });
  } catch (err) {
    console.error('Error parsing resume:', err);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
  console.log('Start by visiting: http://localhost:3001/ms-login  (Microsoft login)');
  console.log('After Microsoft login, go to: http://localhost:3001/start-auth  (Gmail login)');
});

