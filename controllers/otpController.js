const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");

// OTP GENERATION FUNCTION
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// GLOBAL STORE FOR OTPs
global.otpStore = global.otpStore || {};  
// Structure: otpStore["email/phone"] = { otp, expiresAt }

exports.sendOtp = async (req, res) => {
  const { type, phone, email } = req.body;
  const otp = generateOTP();
  const key = phone || email;

  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  global.otpStore[key] = { otp, expiresAt };

  console.log("Generated OTP:", otp);

  try {
    if (type === "sms") {
      const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

      await smsClient.messages.create({
        body: `Your OTP is ${otp}`,
        to: phone,
        from: process.env.TWILIO_PHONE,
      });
    } else if (type === "email") {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Your OTP Code",
        text: `Your OTP Code is ${otp}`,
      });
    }

    res.json({ success: true, message: "OTP sent successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOtp = (req, res) => {
  const { otp, phone, email } = req.body;
  const key = phone || email;

  const stored = global.otpStore[key];

  if (!stored) {
    return res.status(400).json({ success: false, message: "OTP expired or not found!" });
  }

  if (Date.now() > stored.expiresAt) {
    delete global.otpStore[key];
    return res.status(400).json({ success: false, message: "OTP expired!" });
  }

  if (Number(otp) === Number(stored.otp)) {
    delete global.otpStore[key];
    return res.json({ success: true, message: "OTP verified successfully!" });
  }

  return res.status(400).json({ success: false, message: "Incorrect OTP!" });
};
