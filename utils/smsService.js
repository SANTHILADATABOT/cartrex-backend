const twilio = require('twilio');

class SMSService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
      this.enabled = true;
    } else {
      this.enabled = false;
      console.warn('Twilio credentials not configured. SMS sending disabled.');
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.enabled) {
        return { success: true, simulated: true };
      }

      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      return { success: true };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();
