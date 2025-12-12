const mongoose = require("mongoose");

const NotificationContentSchema = new mongoose.Schema({
    notificationTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotificationType",
        required: true
    },
    emailSubject: { type: String, default: "" },
    emailContent: { type: String, default: "" },
    smsContent: { type: String, default: "" },
    notificationContent: { type: String, default: "" },
    deletstatus: {
        type: Number,
        default: 0  // 0 = active, 1 = deleted
    }
}, { timestamps: true });

module.exports = mongoose.model("NotificationContent", NotificationContentSchema);
