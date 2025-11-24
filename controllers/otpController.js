const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

exports.sendOtp = async (req, res) => {
  const { type, phone, email } = req.body;
  const otp = generateOTP();

  try {
    if (type === "sms") {
      const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

      await smsClient.messages.create({
        body: `Your OTP is ${otp}`,
        to: phone,
        from: process.env.TWILIO_PHONE,
      });
    }

    if (type === "email") {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Your OTP",
        text: `Your OTP is ${otp}`,
      });
    }

    global.latestOTP = otp;

    res.json({ success: true, message: "OTP sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = (req, res) => {
  const { otp } = req.body;

  // Compare with stored OTP (this is a simple demo)
  if (global.latestOTP && Number(otp) === Number(global.latestOTP)) {
    return res.json({ success: true, message: "OTP verified successfully!" });
  }

  return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
};