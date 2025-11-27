const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");
const User = require('../models/User');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}
global.otps = {}; // { email: otp }
exports.sendOtp = async (req, res) => {

  try {
    const data = req.body;
    const { type, phone, email} = data.data;
    const otp = generateOTP();
    if (type === "sms") {
      let phoneNumber = phone;
      if (!phone.startsWith('+')) {
        phoneNumber = '+91' + phone; // Adjust country code accordingly
      }

      const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

      await smsClient.messages.create({
        body: `Your OTP is ${otp}`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    }
    else if (type === 'email') {
      console.log(process.env.SENDGRID_API_KEY)
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('type === email=>',sgMail);
      await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Your OTP",
        text: `Your OTP is ${otp}`,
      });
    }

    global.otps[email] = otp; // Store OTP by email

    res.json({ success: true, message: "OTP sent!",otp:otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const data = req.body;
  const {step,otp,email} = data.data;
  // Compare with stored OTP (this is a simple demo)
  if (global.otps[email] && Number(otp) === Number(global.otps[email])) {
     const user = await User.findOne({email:email});
     if(step === "signup" || step === "verification"){
        user.verifyuser = "verified";
       user.lastLogin = new Date();
       await user.save();
        delete global.otps[email]; // Optional: clean up
        return res.json({ success: true, message: "OTP verified successfully!" });
     }
     else if(step === "forget" && user.verifyuser === "verified"){
        delete global.otps[email]; // Optional: clean up
        return res.json({ success: true, message: "OTP verified successfully!" });
     }
       
  }
  
  return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
};