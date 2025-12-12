const NotificationType = require("../../models/NotificationType");


exports.createNotificationType = async (req, res) => {
    try {
        const { notificationType } = req.body;

        if (!notificationType)
            return res.status(400).json({ message: "Notification type is required" });

        const exists = await NotificationType.findOne({ 
            notificationType,
            deletstatus: 0
        });

        if (exists)
            return res.status(409).json({ message: "Notification type already exists" });

        const data = await NotificationType.create({ notificationType });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllNotificationTypes = async (req, res) => {
    try {
        const data = await NotificationType.find({ deletstatus: 0 })
            .sort({ createdAt: -1 });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getNotificationTypeById = async (req, res) => {
    try {
        const data = await NotificationType.findOne({
            _id: req.params.typeId,
            deletstatus: 0
        });

        if (!data) return res.status(404).json({ message: "Not found" });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateNotificationType = async (req, res) => {
    try {
        const { notificationType } = req.body;

        const updated = await NotificationType.findOneAndUpdate(
            { _id: req.params.typeId, deletstatus: 0 },
            { notificationType },
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ message: "Not found or deleted" });

        res.json({ success: true, updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteNotificationType = async (req, res) => {
    try {
        const deleted = await NotificationType.findByIdAndUpdate(
            req.params.typeId,
            { deletstatus: 1 },
            { new: true }
        );

        res.json({ success: true, message: "NotificationType Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
