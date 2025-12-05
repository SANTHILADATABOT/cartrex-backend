import Complaint from "../../models/Complaint.js";

import mongoose from "mongoose";
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ deletstatus: 0 })
      .populate("userId", "firstName lastName email")
    .populate("bookingId") 
      .select("_id userId bookingId customerName complaintType description priority status assignedTo resolution resolvedAt attachments raisedAt createdAt");

    res.status(200).json({
      success: true,
      count: complaints.length,
      data :complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getComplaintById = async (req, res) => {
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



export const updateComplaintStatus = async (req, res) => {
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

export const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const { complaintId } = req.params; // get complaint ID from URL params

    const validPriority = ["low", "medium", "high", "critical"];

    // Validate priority
    if (!validPriority.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Use: low, medium, high, critical",
      });
    }

    // Validate complaint ID
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    // Update priority
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