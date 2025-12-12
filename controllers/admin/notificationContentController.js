const NotificationContent = require("../../models/NotificationContent");



exports.getContentByType = async (req, res) => {
    try {
        const data = await NotificationContent.findOne({
            notificationTypeId: req.params.typeId,
            deletstatus: 0
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateNotificationContent = async (req, res) => {
    try {
        const { emailSubject, emailContent, smsContent, notificationContent } = req.body;

        const existing = await NotificationContent.findOne({
            notificationTypeId: req.params.typeId,
            deletstatus: 0
        });

        let data;

        if (existing) {
            data = await NotificationContent.findByIdAndUpdate(
                existing._id,
                { emailSubject, emailContent, smsContent, notificationContent },
                { new: true }
            );
        } else {
            data = await NotificationContent.create({
                notificationTypeId: req.params.typeId,
                emailSubject,
                emailContent,
                smsContent,
                notificationContent
            });
        }

        res.json({ success: true, data });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

