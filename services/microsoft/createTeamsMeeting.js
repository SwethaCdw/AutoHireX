// services/microsoft/createTeamsMeeting.js
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

function convertToISO(dateStr, timeStr) {
  return new Date(`${dateStr} ${timeStr}`).toISOString();
}

async function createTeamsCalendarMeetingForHR(accessToken, hrEmail, dateStr, startTimeStr, endTimeStr, candidateEmail) {
  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const event = {
    subject: "Interview with Candidate",
    start: {
      dateTime: convertToISO(dateStr, startTimeStr),
      timeZone: "India Standard Time"
    },
    end: {
      dateTime: convertToISO(dateStr, endTimeStr),
      timeZone: "India Standard Time"
    },
    location: {
      displayName: "Microsoft Teams Meeting"
    },
    attendees: [
      {
        emailAddress: { address: candidateEmail },
        type: "required"
      }
    ],
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness"
  };

  const response = await client
    .api(`/users/${hrEmail}/events`)
    .post(event);

  return response.onlineMeeting ? response.onlineMeeting.joinUrl : null;
}

module.exports = { createTeamsCalendarMeetingForHR };
