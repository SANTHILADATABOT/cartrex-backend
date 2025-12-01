const Route = require('../../models/Route');



exports.getReviewRouteDetails = async (req, res) => {
    try {
        const { truckId } = req.body;

        const route = await Route.findOne({ truckId, deletstatus:0 })
            .populate({
                path: "truckId",
                select: "nickname registrationNumber "
            })
            .populate({
                path: "carrierId",
                select: "companyName email phone userId"
            });

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found for this truck"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Truck route details fetched successfully",
            data: {
                routeId: route._id,
                truckId,
                carrier: route.carrierId,

                origin: route.origin,
                destination: route.destination,

                createdBy: route.createdBy,
                updatedBy: route.updatedBy,
                ipAddress: route.ipAddress,
                userAgent: route.userAgent,
                createdAt: route.createdAt,
                updatedAt: route.updatedAt
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
