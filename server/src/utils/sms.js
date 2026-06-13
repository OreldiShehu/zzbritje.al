const getClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !sid.startsWith('AC')) return null;
  try {
    return require('twilio')(sid, token);
  } catch {
    return null;
  }
};

exports.sendSms = async (to, body) => {
  const client = getClient();
  if (!client) throw new Error('SMS service not configured.');
  return client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
};
