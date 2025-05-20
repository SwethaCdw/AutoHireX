// services/amazon/startOutboundCall.js
const connect = require('./connectClient');

async function startOutboundCall(phoneNumber, attributes = {}) {
  const params = {
    ContactFlowId: process.env.CONTACT_FLOW_ID,
    InstanceId: process.env.INSTANCE_ID,
    DestinationPhoneNumber: '+12109440169',
    SourcePhoneNumber: process.env.SOURCE_PHONE_NUMBER,
    Attributes: attributes // Optional: key-value to pass to Lex
  };

  return new Promise((resolve, reject) => {
    connect.startOutboundVoiceContact(params, function (err, data) {
      if (err) {
        console.error("Call failed:", err);
        reject(err);
      } else {
        console.log("Call initiated:", data);
        resolve(data);
      }
    });
  });
}

module.exports = startOutboundCall;
