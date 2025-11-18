const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');
const admin = require('firebase-admin');

// Initialize Firebase Admin (add your service account key)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

class NotificationService {
  async sendNotification(userId, type, title, message, data = {}, channels = {}) {
    try {
      // Create notification record
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        channels: {
          email: channels.email || false,
          sms: channels.sms || false,
          push: channels.push || false,
          inApp: true
        }
      });

      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Send via different channels
      if (channels.email) {
        await emailService.sendEmail(user.email, title, message);
      }

      if (channels.sms) {
        await smsService.sendSMS(user.phone, `${title}: ${message}`);
      }

      if (channels.push && user.fcmToken) {
        await this.sendPushNotification(user.fcmToken, title, message, data);
      }

      return { success: true, notification };
    } catch (error) {
      console.error('Send notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPushNotification(fcmToken, title, body, data = {}) {
    try {
      if (!admin.apps.length) {
        return { success: false, simulated: true };
      }

      const message = {
        notification: { title, body },
        data,
        token: fcmToken
      };

      await admin.messaging().send(message);
      return { success: true };
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();