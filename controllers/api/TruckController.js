const path = require('path');
const fs = require('fs');
const Truck = require('../../models/Truck');
const Carrier = require('../../models/Carrier');
const Route = require('../../models/Route');
const { uploadToS3 } = require('../../utils/s3Upload');

// exports.createTruckProfile = async (req, res) => {
//     try {
//         const {
//             userId,
//             nickname,
//             registrationNumber,
//             truckType,
//             hasWinch,
//             capacity,
//             //insuranceExpiry,
//             mcDotNumber,
//             vinNumber,
//             zipcode
//         } = req.body;
//         console.log('=>',req.body)

//         if (!truckType || !truckType.subcategoryId) { 
//             return res.status(400).json({ success: false, message: "Truck type subcategoryId required" }); }

//         const carrier = await Carrier.findOne({ userId });
//         if (!carrier) {
//             return res.status(404).json({ success: false, message: "Carrier not found" });
//         }

//         const baseDir = path.join(__dirname, "../upload/trucks");
//         if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

//         let insurancePath = null;

//         if (req.files?.insurance) {
//             const file = req.files.insurance[0];
//             const ext = path.extname(file.originalname);
//             const fileName = `insurance_${Date.now()}${ext}`;
//             const savePath = path.join(baseDir, fileName);

//             fs.writeFileSync(savePath, file.buffer);
//             insurancePath = path.join("upload", "trucks", fileName);
//         }

//         const truck = await Truck.create({
//             carrierId: carrier._id,
//             nickname,
//             registrationNumber,
//            truckType:truckType.subcategoryId,
//             //truckType:truckType,
//             hasWinch,
//             capacity,
//             mcDotNumber,
//             vinNumber,
//             zipcode,
//             insurance: insurancePath,
//             //insuranceExpiry,
//             userAgent: req.headers['user-agent'],
//             createdAt: new Date(),
//             updatedAt: new Date()
//         });

//          const populatedTruck = await Truck.findById(truck._id)
//             .populate("truckType", "name  description");

//         return res.status(201).json({
//             success: true,
//             message: "Truck Profile created successfully",
//             data: {
//                 ...populatedTruck._doc,       // includes all truck fields
//                 truckType: populatedTruck.truckType // populated object
//             }
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };

// exports.createTruckRoute = async (req, res) => {
//     try {
//         const {
//             truckId,
//             userId,
//             originCity,
//             originState,
//             originStateCode,
//             originZipcode,
//             originlocation,
//             pickupWindow,
//             pickupRadius,

//             destinationCity,
//             destinationstate,
//             destinationstateCode,
//             destinationZipcode,
//             destinationlocation,
//             deliveryWindow,
//             deliveryRadius
//         } = req.body;


//         const carrier = await Carrier.findOne({ userId });
//         if (!carrier) return res.status(404).json({ success: false, message: "Carrier not found" });

//         const route = await Route.create({
//             carrierId: carrier._id,
//             truckId,
//             origin: {
//                 fullAddress: originlocation,
//                 city: originCity,
//                 state: originState,
//                 stateCode: originStateCode,
//                 zipcode: originZipcode,
//                 pickupWindow,
//                 pickupRadius
//             },
//             destination: {
//                 fullAddress: destinationlocation,
//                 city: destinationCity,
//                 state: destinationstate,
//                 stateCode: destinationstateCode,
//                 zipcode: destinationZipcode,
//                 deliveryWindow,
//                 deliveryRadius
//             },
//             createdBy: req.body.createdBy,
//             updatedBy: req.body.createdBy,
//             ipAddress: req.ip,
//             userAgent: req.headers['user-agent'],
//             createdAt: new Date(),
//             updatedAt: new Date()
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Successfully created a Route for the Truck ",
//             data: route
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };


exports.uploadTruckPhotos = async (req, res) => {
    try {
        const { truckId } = req.body;

        if (!truckId) {
            return res.status(400).json({
                success: false,
                message: "truckId is required"
            });
        }
        const truckFolder = path.join(__dirname, "../upload/trucks", truckId);
        if (!fs.existsSync(truckFolder)) {
            fs.mkdirSync(truckFolder, { recursive: true });
        }

        let truckProfilePath = null;
        let coverPhotoPath = null;
        let photoPaths = [];

        if (req.files?.truckProfile) {
            const file = req.files.truckProfile[0];
            const ext = path.extname(file.originalname);
            const fileName = `truckProfile_${truckId}${ext}`;
            const savePath = path.join(truckFolder, fileName);

            fs.writeFileSync(savePath, file.buffer);
            truckProfilePath = path.join("upload", "trucks", truckId, fileName).replace(/\\/g, "/");
        }

        if (req.files?.coverPhoto) {
            const file = req.files.coverPhoto[0];
            const ext = path.extname(file.originalname);
            const fileName = `cover_${truckId}${ext}`;
            const savePath = path.join(truckFolder, fileName);

            fs.writeFileSync(savePath, file.buffer);
            coverPhotoPath = path.join("upload", "trucks", truckId, fileName).replace(/\\/g, "/");
        }

        if (req.files?.photos) {
            req.files.photos.forEach((file, idx) => {
                const ext = path.extname(file.originalname);
                const fileName = `photo_${truckId}_${idx}${ext}`;
                const savePath = path.join(truckFolder, fileName);

                fs.writeFileSync(savePath, file.buffer);

                const cleanPath = path
                    .join("upload", "trucks", truckId, fileName)
                    .replace(/\\/g, "/");

                photoPaths.push(cleanPath);
            });
        }

        const truck = await Truck.findByIdAndUpdate(
            truckId,
            {
                truckProfile: truckProfilePath,
                coverPhoto: coverPhotoPath,
                photos: photoPaths
            },
            { new: true }
        );


        return res.status(200).json({
            success: true,
            message: "Truck photos uploaded successfully",
            data: truck
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.createTruckProfileAndRoute = async (req, res) => {
    try {
        const {
            // Truck fields
            userId,
            nickname,
            registrationNumber,
            truckType,
            insuranceExpiry,
            hasWinch,
            capacity,
            mcDotNumber,
            vinNumber,
            zipcode,

            // Route fields
            //truckId,
            originCity,
            originState,
            originStateCode,
            originZipcode,
            originlocation,
            pickupWindow,
            pickupRadius,

            destinationCity,
            destinationState,
            destinationStateCode,
            destinationZipcode,
            destinationlocation,
            deliveryWindow,
            deliveryRadius
        } = req.body;

        console.log("=>", req.body);

        if (!truckType || !truckType.subcategoryId) {
            return res.status(400).json({
                success: false,
                message: "Truck type subcategoryId required"
            });
        }

        const carrier = await Carrier.findOne({ userId });
        if (!carrier) {
            return res.status(404).json({
                success: false,
                message: "Carrier not found"
            });
        }
        // validation for user only have max 3 trucks 
        const existingTrucks = await Truck.countDocuments({ carrierId: carrier._id });

        if (existingTrucks >= 3) {
            return res.status(400).json({
                success: false,
                message: "You can only create a maximum of 3 trucks."
            });
        }

        let insurancePath = null;
        const truck = await Truck.create({
            carrierId: carrier._id,
            nickname,
            registrationNumber,
            truckType: truckType.subcategoryId,
            hasWinch,
            insuranceExpiry,
            capacity,
            mcDotNumber,
            vinNumber,
            zipcode,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const truckId = truck._id.toString();
        const baseDir = path.join(__dirname, "../upload/trucks", truckId);
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        if (req.files?.insurance) {
          const file = req.files.insurance[0];
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext !== ".pdf") {
                return res.status(400).json({
                    success: false,
                    message: "Only PDF files are allowed for insurance document"
                });
            }
        //     const file = req.files.insurance[0];
        //     const ext = path.extname(file.originalname);
        //     const fileName = `insurance_${truckId}${ext}`;
        //     const savePath = path.join(baseDir, fileName);

        //     fs.writeFileSync(savePath, file.buffer);
        //     insurancePath = path
        //         .join("upload", "trucks", truckId, fileName)
        //         .replace(/\\/g, "/");
        // }
        // truck.insurance = insurancePath;
        // await truck.save();
        
        const cleanFileName = file.originalname.replace(/\s+/g, "_").toLowerCase();
        const savePath = path.join(baseDir, cleanFileName);
        fs.writeFileSync(savePath, file.buffer);
        insurancePath = path
                .join("upload", "trucks", truckId, cleanFileName)
                .replace(/\\/g, "/");
        }

        truck.insurance = insurancePath;
        await truck.save();

        // validation for A truck have max 3 routes 
        const existingRoutes = await Route.countDocuments({ truckId: truck._id });

        if (existingRoutes >= 3) {
            return res.status(400).json({
                success: false,
                message: "This truck can only have a maximum of 3 routes."
            });
        }

        const route = await Route.create({
            carrierId: carrier._id,
            truckId: truck._id,
            origin: {
                fullAddress: originlocation,
                city: originCity,
                state: originState,
                stateCode: originStateCode,
                zipcode: originZipcode,
                pickupWindow,
                pickupRadius
            },

            destination: {
                fullAddress: destinationlocation,
                city: destinationCity,
                state: destinationState,
                stateCode: destinationStateCode,
                zipcode: destinationZipcode,
                deliveryWindow,
                deliveryRadius
            },

            createdBy: req.body.createdBy,
            updatedBy: req.body.createdBy,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const populatedTruck = await Truck.findById(truck._id)
            .populate("truckType", "name description");

        return res.status(201).json({
            success: true,
            message: "Truck Profile And Route created successfully",
            data: {
                truck: {
                    ...populatedTruck._doc,
                    truckType: populatedTruck.truckType
                },
                route
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


//edit view 



exports.getTruckProfileAndRoute = async (req, res) => {
    try {
        const { truckId } = req.params;

        const truck = await Truck.findById(truckId)
            .populate("truckType", "name description");

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }

        const route = await Route.findOne({ truckId: truckId });

        return res.status(200).json({
            success: true,
            message: "Truck profile fetched successfully",
            data: {
                truck,
                route: route || null,  // If no route found return null
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

//update 
exports.editTruckProfileAndRoute = async (req, res) => {
    try {
        const {
            // Truck fields
            truckId,
            userId,
            nickname,
            registrationNumber,
            truckType,
            hasWinch,
            capacity,
            mcDotNumber,
            vinNumber,
            zipcode,

            // Route fields
            routeId,
            originCity,
            originState,
            originStateCode,
            originZipcode,
            originlocation,
            pickupWindow,
            pickupRadius,

            destinationCity,
            destinationstate,
            destinationstateCode,
            destinationZipcode,
            destinationlocation,
            deliveryWindow,
            deliveryRadius
        } = req.body;

        const truck = await Truck.findById(truckId);
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }
        const carrier = await Carrier.findOne({ userId });
        if (!carrier) {
            return res.status(404).json({
                success: false,
                message: "Carrier not found"
            });
        }
        let insurancePath = truck.insurance;

        if (req.files?.insurance) {
            const baseDir = path.join(__dirname, "../upload/trucks");
            if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

            const file = req.files.insurance[0];
            const ext = path.extname(file.originalname);
            const fileName = `insurance_${Date.now()}${ext}`;
            const savePath = path.join(baseDir, fileName);

            fs.writeFileSync(savePath, file.buffer);
            insurancePath = path.join("upload", "trucks", fileName);
        }

        truck.nickname = nickname ?? truck.nickname;
        truck.registrationNumber = registrationNumber ?? truck.registrationNumber;
        truck.truckType = truckType?.subcategoryId ?? truck.truckType;
        truck.hasWinch = hasWinch ?? truck.hasWinch;
        truck.capacity = capacity ?? truck.capacity;
        truck.mcDotNumber = mcDotNumber ?? truck.mcDotNumber;
        truck.vinNumber = vinNumber ?? truck.vinNumber;
        truck.zipcode = zipcode ?? truck.zipcode;
        truck.insurance = insurancePath;
        truck.updatedAt = new Date();

        await truck.save();

        const updatedTruck = await Truck.findById(truck._id)
            .populate("truckType", "name description");

        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }
        route.origin = {
            fullAddress: originlocation ?? route.origin.fullAddress,
            city: originCity ?? route.origin.city,
            state: originState ?? route.origin.state,
            stateCode: originStateCode ?? route.origin.stateCode,
            zipcode: originZipcode ?? route.origin.zipcode,
            pickupWindow: pickupWindow ?? route.origin.pickupWindow,
            pickupRadius: pickupRadius ?? route.origin.pickupRadius
        };

        route.destination = {
            fullAddress: destinationlocation ?? route.destination.fullAddress,
            city: destinationCity ?? route.destination.city,
            state: destinationstate ?? route.destination.state,
            stateCode: destinationstateCode ?? route.destination.stateCode,
            zipcode: destinationZipcode ?? route.destination.zipcode,
            deliveryWindow: deliveryWindow ?? route.destination.deliveryWindow,
            deliveryRadius: deliveryRadius ?? route.destination.deliveryRadius
        };

        route.updatedBy = req.body.updatedBy;
        route.updatedAt = new Date();
        route.userAgent = req.headers["user-agent"];
        route.ipAddress = req.ip;

        await route.save();

        return res.status(200).json({
            success: true,
            message: "Truck Profile & Route updated successfully",
            data: {
                truck: updatedTruck,
                route
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



exports.getTruckDetails = async (req, res) => {
    try {
        const { truckId } = req.body;

        const truck = await Truck.findById(truckId)
            .populate({
                path: "carrierId",
            })
            .populate({
                path: "truckType",
                select: "name parentCategory"
            });

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: "Truck not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Truck details fetched successfully",
            data: {
                truckId: truck._id,
                nickname: truck.nickname,
                registrationNumber: truck.registrationNumber,
                truckType: truck.truckType,
                hasWinch: truck.hasWinch,
                capacity: truck.capacity,
                mcDotNumber: truck.mcDotNumber,
                vinNumber: truck.vinNumber,
                zipcode: truck.zipcode,
                insurance: truck.insurance ? path.basename(truck.insurance) : null,
                insuranceExpiry: truck.insuranceExpiry,
                userAgent: truck.userAgent,

                // Photos from second API
                truckProfile: truck.truckProfile,
                coverPhoto: truck.coverPhoto,
                photos: truck.photos,

                // Carrier details
                carrier: truck.carrierId,

                createdAt: truck.createdAt,
                updatedAt: truck.updatedAt
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
