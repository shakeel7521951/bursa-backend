import RequestBooking from "../models/RequestBooking.js";
import TransportRequest from "../models/transportRequest.js";

export const createRequestBooking = async (req, res) => {
  try {
    const transporterId = req.user?.id;
    const { requestId } = req.params;

    if (!transporterId || !requestId) {
      return res
        .status(400)
        .json({ message: "Transporter ID or Request ID is missing" });
    }

    const transportRequest = await TransportRequest.findById(requestId);

    if (!transportRequest) {
      return res.status(404).json({ message: "Transport request not found" });
    }
    transportRequest.status = "accepted";

    await transportRequest.save();

    const newRequest = new RequestBooking({
      transporterId: transporterId,
      requestId: requestId,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Booking request accepted successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating booking request:", error);
    res
      .status(500)
      .json({ message: "Server error while creating booking request" });
  }
};

export const getAcceptedTransporterRequests = async (req, res) => {
  try {
    const transporterId = req.user?.id;

    if (!transporterId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Transporter ID not found" });
    }

    const bookings = await RequestBooking.find({ transporterId });

    const requestIds = bookings.map((booking) => booking.requestId);

    const acceptedRequests = await TransportRequest.find({
      _id: { $in: requestIds },
      status: { $in: ["accepted", "fulfilled"] },
    });

    res.status(200).json({
      message: "Accepted requests fetched successfully",
      data: acceptedRequests,
    });
  } catch (error) {
    console.error("Error fetching accepted requests:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching accepted requests" });
  }
};

export const markRequestFulfilled = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updated = await TransportRequest.findByIdAndUpdate(
      requestId,
      { status: "fulfilled" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res
      .status(200)
      .json({ message: "Request marked as fulfilled", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating request status" });
  }
};
