import TransportRequest from "../models/transportRequest.js";

export const createTransportRequest = async (req, res) => {
  try {
    const { departure, destination, date, passengers, category, notes } = req.body;
    const userId = req.user?.id;
    if(!userId){
        res.status(401).json({message:"User not login! Please login first"})
    }

    if (!departure || !destination || !date || !passengers || !category) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const newRequest = new TransportRequest({
      userId: userId,
      departure,
      destination,
      date,
      passengers,
      category,
      notes,
    });

    const savedRequest = await newRequest.save();
    res.status(201).json({ message: "Transport request created successfully", data: savedRequest });

  } catch (error) {
    console.error("Error creating transport request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllTransportRequests = async (req, res) => {
  try {
    const requests = await TransportRequest.find().populate("userId", "name email");
    res.status(200).json({ data: requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTransportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const request = await TransportRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be edited" });
    }

    const updated = await TransportRequest.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Request updated successfully", data: updated });

  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTransportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const request = await TransportRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be deleted" });
    }

    await TransportRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Request deleted successfully" });

  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserTransportRequests = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    const userRequests = await TransportRequest.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ data: userRequests });
  } catch (error) {
    console.error("Error fetching user's requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};