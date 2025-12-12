// import Complaint from "../../models/Complaint.js";
const Complaint = require("../../models/Complaint");


// import mongoose from "mongoose";
const mongoose = require("mongoose");
// export const getAllComplaints = async (req, res) => {
//   try {
//     const complaints = await Complaint.find({ deletstatus: 0 })
//       .populate("userId", "firstName lastName email")
//     .populate("bookingId") 
//       .select("_id userId bookingId customerName complaintType description priority status assignedTo resolution resolvedAt attachments raisedAt createdAt");

//     res.status(200).json({
//       success: true,
//       count: complaints.length,
//       data :complaints
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getAllComplaints = async (req, res) => {
  try {
    const { status, shipper } = req.query;

    const filter = { deletstatus: 0 };

    // 👇 Status filter
    if (status) {
      if (status === "all") {
        filter.status = { $in: ["open", "pending", "resolved", "closed"] };
      } else {
        filter.status = status;
      }
    }

    // 👇 Shipper filter (userId is shipper)
    if (shipper && shipper !== "all") {
      filter.customerid = shipper;
    }
console.log('filter=>',filter)
    const complaints = await Complaint.find(filter)
      .populate("userId", "firstName lastName email") 
      .populate("bookingId") 
      .populate("customerid") 
      .select(
        "_id userId bookingId  complaintType description priority status assignedTo resolution resolvedAt attachments raisedAt createdAt"
      )
      .sort({ createdAt: -1 });

    if (!complaints.length) {
      return res.status(200).json({
        success: true,
        message: "No complaints found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: complaints.length,
      message: "Complaints fetched successfully",
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // 🔹 Validate ID
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    // 🔹 Find & populate complaint
    const complaint = await Complaint.findById(complaintId)
      .populate({
        path: "userId",
        select: "firstName lastName email phone role"
      })
      
      .populate({
        path: "bookingId",
        populate: [
          { path: "carrierId", populate: { path: "userId", select: "firstName lastName email" } }
        ]
      })
      .lean();

    // ❌ If not found
    if (!complaint || complaint?.deletstatus === 1) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint fetched successfully",
      data: complaint,
    });

  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching complaint",
      error: error.message,
    });
  }
};



exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body; 

  
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.updatedAt = new Date();

    if (!Array.isArray(complaint.statusUpdatedetails)) {
      if (complaint.statusUpdatedetails && typeof complaint.statusUpdatedetails === "object") {
        complaint.statusUpdatedetails = [complaint.statusUpdatedetails];
      } else {
        complaint.statusUpdatedetails = [];
      }
    }

    complaint.statusUpdatedetails.push({
      updatedAt: new Date(),
      status: status
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      data: complaint,
    });

  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating complaint status",
      error: error.message,
    });
  }
};


exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const { complaintId } = req.params; 

    const validPriority = ["low", "medium", "high", "critical"];


    if (!validPriority.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Use: low, medium, high, critical",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }


    const updated = await Complaint.findByIdAndUpdate(
      complaintId,
      { priority },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Priority updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





// export const updateComplaint = async (req, res) => {
//   try {
//     const { complaintId } = req.params; 
//     const data = req.body;          
//     const allowedUpdates = [
//       "status",
//       "priority",
//       "resolution",
//       "description",
//       "assignedTo",
//       "attachments"
//     ];

//     const updates = {};
//     allowedUpdates.forEach((field) => {
//       if (data[field] !== undefined) updates[field] = data[field];
//     });

//     // Update updatedAt when change occurs
//     updates.updatedAt = new Date();

//     // Status update => resolvedAt set
//     if (data.status === "resolved" || data.status === "closed") {
//       updates.resolvedAt = new Date();
//     }

//     const updatedComplaint = await Complaint.findByIdAndUpdate(
//       complaintId,
//       { $set: updates },
//       { new: true } 
//     );

//     if (!updatedComplaint) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Complaint updated successfully",
//       data: updatedComplaint
//     });

//   } catch (error) {
//     console.error("Update Complaint Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong while updating complaint",
//       error: error.message,
//     });
//   }
// };

exports.updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params; 
    const data = req.body;          

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    // 🔹 Merge all fields from request body, except system fields
    const updates = { ...data };

    // Always update updatedAt
    updates.updatedAt = new Date();

    // Update resolvedAt if status changed to resolved or closed
    if (data.status === "resolved" || data.status === "closed") {
      updates.resolvedAt = new Date();
    }

    // Find and update
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: updatedComplaint
    });

  } catch (error) {
    console.error("Update Complaint Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating complaint",
      error: error.message,
    });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Audit Fields
    const auditFields = {
      deletstatus: 1, // Soft delete flag
      deletedAt: new Date(),
      deletedipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      updatedAt: new Date(),
    };

    const deletedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      auditFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deletedComplaint)
      return res.status(404).json({ message: "Complaint not found" });

    res.status(200).json({
      message: "Complaint deleted successfully",
      data: deletedComplaint,
    });

  } catch (error) {
    console.error("Complaint Delete Error:", error);
    res.status(500).json({
      message: "Error deleting complaint",
      error: error.message,
    });
  }
};
