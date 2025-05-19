import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const {
      serviceName,
      serviceCategory,
      destinationFrom,
      destinationTo,
      totalSeats,
      availableSeats,
      pricePerSeat,
      departureTime,
      travelDate,
    } = req.body;
    const transporterId = req.user?.id;
    if (!transporterId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image upload is required!" });
    }

    const imageUrl = req.file.path; 

    const newService = new Service({
      serviceName,
      transporter: transporterId,
      serviceCategory,
      destinationFrom,
      destinationTo,
      totalSeats: Number(totalSeats),
      availableSeats: Number(availableSeats),
      pricePerSeat: Number(pricePerSeat),
      departureTime,
      travelDate,
      servicePic: imageUrl,
    });

    await newService.save();

    return res.status(201).json({
      message: "Service created successfully!",
      service: newService,
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getIndividualServices = async (req, res) => {
  try {
    const transporterId = req.user?._id;
    const role = req.user?.role;
    if (role !== "Transporter") {
      return res
        .status(403)
        .json({ message: "Access denied: not a Transporter" });
    }

    const services = await Service.find({ transporter: transporterId });
    if (services.length === 0) {
      return res.status(200).json({ message: "No service found!" });
    }

    return res.status(200).json({ services, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate("transporter", "name email");

    if (services.length === 0) {
      return res.status(200).json({ message: "No Service found!" });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error("Error in getAllServices:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found!" });
    }

    res.status(200).json({ message: "Service Deleted Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error! Please try again later" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const updateData = req.body;

    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found!" });
    }

    existingService.serviceName =
      updateData.serviceName || existingService.serviceName;
    existingService.serviceCategory =
      updateData.serviceCategory || existingService.serviceCategory;
    existingService.price = updateData.price || existingService.price;
    existingService.passengers =
      updateData.passengers || existingService.passengers;
    existingService.doors = updateData.doors || existingService.doors;

    if (req.file) {
      existingService.servicePic = req.file.path;
    }

    const updatedService = await existingService.save();

    return res.status(200).json({
      message: "Service updated successfully!",
      service: updatedService,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
