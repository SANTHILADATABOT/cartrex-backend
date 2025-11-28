const Route = require('../../models/Route');



exports.getReviewRouteDetails = async (req, res) => {
    try {
        const { truckId } = req.body;

        if (!truckId) {
            return res.status(400).json({
                success: false,
                message: "truckId is required"
            });
        }

        const route = await Route.findOne({ truckId })
            .populate({
                path: "truckId",
                select: "nickname registrationNumber truckType"
            })
            .populate("carrierId", "companyName");

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "No route found for this truck"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review route details fetched successfully",
            data: {
                routeId: route._id,
                truckId: route.truckId,
                carrier: route.carrierId,

                origin: route.origin,
                destination: route.destination,

                status: route.status,
                createdAt: route.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
