import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const {
      serviceName,
      serviceCategory,
      destinationFrom,
      destinationTo,
      routeCities,
      travelDate,
      departureTime,
      arrivalDate,
      availabilityDays,
      totalSeats,
      availableSeats,
      parcelLoadCapacity,
      pickupOption,
      pricePerSeat,
    } = req.body;

    const transporterId = req.user?.id;

    if (!transporterId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image upload is required!" });
    }

    // Validate service category
    const validCategories = ["people", "parcels", "vehicles"];
    if (!validCategories.includes(serviceCategory)) {
      return res.status(400).json({ message: "Invalid service category." });
    }

    // Parse and validate availabilityDays
    let parsedAvailabilityDays;
    try {
      parsedAvailabilityDays = JSON.parse(availabilityDays);
    } catch (err) {
      return res.status(400).json({
        message:
          "Invalid format for availabilityDays. It must be a JSON object.",
      });
    }

    if (
      !parsedAvailabilityDays?.romania ||
      !Array.isArray(parsedAvailabilityDays.romania) ||
      !parsedAvailabilityDays?.italy ||
      !Array.isArray(parsedAvailabilityDays.italy)
    ) {
      return res.status(400).json({
        message:
          "Availability days for Romania and Italy are required as arrays.",
      });
    }

    // Validate route cities
    let parsedRouteCities = routeCities;
    if (typeof routeCities === "string") {
      try {
        parsedRouteCities = JSON.parse(routeCities);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid format for routeCities. It must be an array.",
        });
      }
    }

    if (!Array.isArray(parsedRouteCities) || parsedRouteCities.length < 5) {
      return res
        .status(400)
        .json({ message: "At least 5 route cities are required." });
    }

    // Validate seats and capacity based on category
    if (serviceCategory === "people" && Number(totalSeats) <= 0) {
      return res.status(400).json({
        message: "Total seats must be greater than 0 for people transport.",
      });
    }

    if (serviceCategory === "parcels" && Number(parcelLoadCapacity) <= 0) {
      return res.status(400).json({
        message:
          "Parcel load capacity must be greater than 0 for parcel transport.",
      });
    }

    const imageUrl = req.file.path; // Adjust if using a static/public folder

    const newService = new Service({
      serviceName: serviceName.trim(),
      transporter: transporterId,
      serviceCategory,
      destinationFrom: destinationFrom.trim(),
      destinationTo: destinationTo.trim(),
      routeCities: parsedRouteCities.map((city) => city.trim()),
      travelDate: new Date(travelDate),
      departureTime: departureTime.trim(),
      arrivalDate: new Date(arrivalDate),
      availabilityDays: parsedAvailabilityDays,
      totalSeats: Number(totalSeats),
      availableSeats: Number(availableSeats),
      parcelLoadCapacity: Number(parcelLoadCapacity) || 0,
      pickupOption,
      pricePerSeat: Number(pricePerSeat),
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
    
    const transporterId = req.user?.id;
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

    // Update core fields
    existingService.serviceName =
      updateData.serviceName || existingService.serviceName;
    existingService.serviceCategory =
      updateData.serviceCategory || existingService.serviceCategory;
    existingService.destinationFrom =
      updateData.destinationFrom || existingService.destinationFrom;
    existingService.destinationTo =
      updateData.destinationTo || existingService.destinationTo;
    existingService.travelDate =
      updateData.travelDate || existingService.travelDate;
    existingService.departureTime =
      updateData.departureTime || existingService.departureTime;
    existingService.arrivalDate =
      updateData.arrivalDate || existingService.arrivalDate;
    existingService.totalSeats =
      updateData.totalSeats ?? existingService.totalSeats;
    existingService.availableSeats =
      updateData.availableSeats ?? existingService.availableSeats;
    existingService.pricePerSeat =
      updateData.pricePerSeat ?? existingService.pricePerSeat;

    // Handle routeCities, parse if string
    if (updateData.routeCities) {
      let routeCitiesArray;
      if (typeof updateData.routeCities === "string") {
        try {
          routeCitiesArray = JSON.parse(updateData.routeCities);
        } catch (err) {
          return res
            .status(400)
            .json({ message: "Invalid JSON format for routeCities." });
        }
      } else {
        routeCitiesArray = updateData.routeCities;
      }

      if (!Array.isArray(routeCitiesArray) || routeCitiesArray.length < 5) {
        return res
          .status(400)
          .json({ message: "At least 5 route cities are required." });
      }

      existingService.routeCities = routeCitiesArray;
    }

    // Handle availabilityDays, parse if string
    if (updateData.availabilityDays) {
      let availabilityDaysObj;
      if (typeof updateData.availabilityDays === "string") {
        try {
          availabilityDaysObj = JSON.parse(updateData.availabilityDays);
        } catch (err) {
          return res
            .status(400)
            .json({ message: "Invalid JSON for availabilityDays" });
        }
      } else {
        availabilityDaysObj = updateData.availabilityDays;
      }

      if (
        !availabilityDaysObj.romania ||
        !Array.isArray(availabilityDaysObj.romania) ||
        !availabilityDaysObj.italy ||
        !Array.isArray(availabilityDaysObj.italy)
      ) {
        return res.status(400).json({
          message:
            "Availability days for Romania and Italy are required as arrays.",
        });
      }

      existingService.availabilityDays = availabilityDaysObj;
    }

    if (updateData.parcelLoadCapacity !== undefined) {
      existingService.parcelLoadCapacity = updateData.parcelLoadCapacity;
    }

    if (updateData.pickupOption) {
      existingService.pickupOption = updateData.pickupOption;
    }

    if (req.file) {
      existingService.servicePic = req.file.path;
    }

    const updatedService = await existingService.save();

    return res.status(200).json({
      message: "Service updated successfully!",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
