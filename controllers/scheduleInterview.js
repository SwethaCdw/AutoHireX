const { createTeamsCalendarMeetingForHR } = require('../services/microsoft/createTeamsMeeting');
const { sendEmail } = require('../services/gmail/gmail-auth');

async function scheduleInterview(gmailClient, candidateEmail, msAccessToken) {
  const dateStr = "18 May 2025";
  const startTimeStr = "10:30 PM";
  const endTimeStr = "11:00 PM";

  const hrEmail = "a.ponnusamy@cdw.com"; // Replace with real HR account

  const joinUrl = await createTeamsCalendarMeetingForHR(
    msAccessToken,
    hrEmail,
    dateStr,
    startTimeStr,
    endTimeStr,
    candidateEmail
  );

  const subject = 'Interview Scheduled - Join via Microsoft Teams';
  const body = `
    <p>Dear Candidate,</p>
    <p>Your interview with CDW has been scheduled with the following details:</p>
    <ul>
      <li><strong>Date:</strong> ${dateStr}</li>
      <li><strong>Time:</strong> ${startTimeStr} - ${endTimeStr} (IST)</li>
    </ul>
    <p>Please join using the link below:</p>
    <p><a href="${joinUrl}">${joinUrl}</a></p>
    <p>Best regards,<br/>Recruitment Team</p>
  `;

  await sendEmail(gmailClient, candidateEmail, subject, body);
}

module.exports = { scheduleInterview };
