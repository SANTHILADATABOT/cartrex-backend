const mongoose = require("mongoose");

const NotificationTypeSchema = new mongoose.Schema({
    notificationType: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    deletstatus: {
        type:Number,
        default: 0   // 0 = active, 1 = deleted
    }
}, { timestamps: true });

module.exports = mongoose.model("NotificationType", NotificationTypeSchema);
