import Service from "../models/Service.js";
import Order from '../models/Order.js'

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
      availabilityDaysRomania,
      availabilityDaysItaly,
      totalSeats,
      availableSeats,
      parcelLoadCapacity,
      vehicleType,
      trailerType,
      furnitureDetails,
      animalType,
      pickupOption,
      price,
    } = req.body;

    const transporterId = req.user?.id;
    // Validate authentication and required fields
    if (!transporterId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Service image is required!" });
    }

    const requiredFields = [
      'serviceName',
      'serviceCategory',
      'destinationFrom',
      'destinationTo',
      'travelDate',
      'departureTime',
      'arrivalDate',
      'pickupOption',
      'price'
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }

    // Validate service category
    const validCategories = [
      'passenger',
      'parcel',
      'car_towing',
      'vehicle_trailer',
      'furniture',
      'animal'
    ];

    if (!validCategories.includes(serviceCategory)) {
      return res.status(400).json({ message: "Invalid service category." });
    }

    // Parse and validate route cities
    let parsedRouteCities = [];
    if (typeof routeCities === 'string') {
      parsedRouteCities = routeCities.split(',').map(city => city.trim()).filter(Boolean);
    } else if (Array.isArray(routeCities)) {
      parsedRouteCities = routeCities.map(city => city?.trim()).filter(Boolean);
    }

    if (parsedRouteCities.length === 0) {
      return res.status(400).json({ message: "At least one route city is required." });
    }

    // Parse and validate availability days
    const parseAvailabilityDays = (days) => {
      if (typeof days === 'string') {
        return days.split(',').map(day => day.trim()).filter(Boolean);
      }
      return Array.isArray(days) ? days : [];
    };

    const romaniaDays = parseAvailabilityDays(availabilityDaysRomania);
    const italyDays = parseAvailabilityDays(availabilityDaysItaly);

    if (romaniaDays.length === 0 || italyDays.length === 0) {
      return res.status(400).json({
        message: "Availability days for both Romania and Italy are required."
      });
    }

    // Validate dates
    const travelDateObj = new Date(travelDate);
    const arrivalDateObj = new Date(arrivalDate);

    if (isNaN(travelDateObj.getTime()) || isNaN(arrivalDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid travel or arrival date." });
    }

    if (arrivalDateObj < travelDateObj) {
      return res.status(400).json({ 
        message: "Arrival date must be after travel date." 
      });
    }

    // Validate category-specific fields
    const validationErrors = [];
    const priceNum = Number(price);

    if (isNaN(priceNum) || priceNum <= 0) {
      validationErrors.push("Price must be a positive number.");
    }

    switch (serviceCategory) {
      case 'passenger':
        const seatsNum = Number(totalSeats);
        const availSeatsNum = Number(availableSeats);
        if (isNaN(seatsNum) || seatsNum <= 0) {
          validationErrors.push("Total seats must be greater than 0.");
        }
        if (isNaN(availSeatsNum) || availSeatsNum < 0 || availSeatsNum > seatsNum) {
          validationErrors.push("Available seats must be between 0 and total seats.");
        }
        break;
      
      case 'parcel':
        const capacity = Number(parcelLoadCapacity);
        if (isNaN(capacity) || capacity <= 0) {
          validationErrors.push("Parcel load capacity must be greater than 0.");
        }
        break;
      
      case 'car_towing':
        if (!vehicleType) {
          validationErrors.push("Vehicle type is required for car towing.");
        }
        break;
      
      case 'vehicle_trailer':
        if (!trailerType) {
          validationErrors.push("Trailer type is required for vehicle transport.");
        }
        break;
      
      case 'furniture':
        if (!furnitureDetails) {
          validationErrors.push("Furniture details are required.");
        }
        break;
      
      case 'animal':
        if (!animalType) {
          validationErrors.push("Animal type is required.");
        }
        break;
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation errors", 
        errors: validationErrors 
      });
    }

    // Prepare service data
    const serviceData = {
      serviceName: serviceName.trim(),
      transporter: transporterId,
      serviceCategory,
      destinationFrom: destinationFrom.trim(),
      destinationTo: destinationTo.trim(),
      routeCities: parsedRouteCities,
      travelDate: travelDateObj,
      departureTime: departureTime.trim(),
      arrivalDate: arrivalDateObj,
      availabilityDays: {
        romania: romaniaDays,
        italy: italyDays
      },
      pickupOption,
      price: priceNum,
      servicePic: req.file.path
    };

    // Add category-specific fields
    switch (serviceCategory) {
      case 'passenger':
        serviceData.totalSeats = Number(totalSeats);
        serviceData.availableSeats = Number(availableSeats);
        break;
      case 'parcel':
        serviceData.parcelLoadCapacity = Number(parcelLoadCapacity);
        break;
      case 'car_towing':
        serviceData.vehicleType = vehicleType;
        break;
      case 'vehicle_trailer':
        serviceData.trailerType = trailerType;
        break;
      case 'furniture':
        serviceData.furnitureDetails = furnitureDetails.trim();
        break;
      case 'animal':
        serviceData.animalType = animalType;
        break;
    }

    // Create and save service
    const newService = new Service(serviceData);
    await newService.save();

    // Prepare response
    const responseData = {
      id: newService._id,
      serviceName: newService.serviceName,
      serviceCategory: newService.serviceCategory,
      destinationFrom: newService.destinationFrom,
      destinationTo: newService.destinationTo,
      travelDate: newService.travelDate,
      arrivalDate: newService.arrivalDate,
      price: newService.price,
      servicePic: newService.servicePic
    };

    // Add category-specific fields to response
    switch (serviceCategory) {
      case 'passenger':
        responseData.totalSeats = newService.totalSeats;
        responseData.availableSeats = newService.availableSeats;
        break;
      case 'parcel':
        responseData.parcelLoadCapacity = newService.parcelLoadCapacity;
        break;
      case 'car_towing':
        responseData.vehicleType = newService.vehicleType;
        break;
      case 'vehicle_trailer':
        responseData.trailerType = newService.trailerType;
        break;
      case 'furniture':
        responseData.furnitureDetails = newService.furnitureDetails;
        break;
      case 'animal':
        responseData.animalType = newService.animalType;
        break;
    }

    return res.status(201).json({
      message: "Service created successfully!",
      service: responseData
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
    await Order.deleteMany({ serviceId: id });

    res.status(200).json({ message: "Service and related orders deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error! Please try again later",
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const formData = req.body;
    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found!" });
    }

    // Handle route cities (accept both array and comma-separated string)
    if (formData.routeCities) {
      const routeCitiesArray = Array.isArray(formData.routeCities)
        ? formData.routeCities
        : typeof formData.routeCities === 'string' 
          ? formData.routeCities.split(',').map(city => city.trim()).filter(Boolean)
          : [];
      
      if (routeCitiesArray.length === 0) {
        return res.status(400).json({ message: "At least one route city is required." });
      }
      existingService.routeCities = routeCitiesArray;
    }

    // Handle availability days (accept both array and comma-separated string)
    const availabilityDays = {
      romania: Array.isArray(formData.availabilityDaysRomania)
        ? formData.availabilityDaysRomania
        : typeof formData.availabilityDaysRomania === 'string'
          ? formData.availabilityDaysRomania.split(',').map(day => day.trim()).filter(Boolean)
          : existingService.availabilityDays.romania,
      italy: Array.isArray(formData.availabilityDaysItaly)
        ? formData.availabilityDaysItaly
        : typeof formData.availabilityDaysItaly === 'string'
          ? formData.availabilityDaysItaly.split(',').map(day => day.trim()).filter(Boolean)
          : existingService.availabilityDays.italy
    };

    if (availabilityDays.romania.length === 0 || availabilityDays.italy.length === 0) {
      return res.status(400).json({ 
        message: "Availability days for Romania and Italy are required." 
      });
    }
    existingService.availabilityDays = availabilityDays;

    // Update core fields
    existingService.serviceName = formData.serviceName || existingService.serviceName;
    existingService.serviceCategory = formData.serviceCategory || existingService.serviceCategory;
    existingService.destinationFrom = formData.destinationFrom || existingService.destinationFrom;
    existingService.destinationTo = formData.destinationTo || existingService.destinationTo;
    existingService.travelDate = formData.travelDate || existingService.travelDate;
    existingService.departureTime = formData.departureTime || existingService.departureTime;
    existingService.arrivalDate = formData.arrivalDate || existingService.arrivalDate;
    existingService.pickupOption = formData.pickupOption || existingService.pickupOption;
    existingService.price = formData.price || existingService.price;

    // Handle category-specific fields
    switch (existingService.serviceCategory) {
      case 'passenger':
        existingService.totalSeats = formData.totalSeats || existingService.totalSeats;
        existingService.availableSeats = formData.availableSeats || existingService.availableSeats;
        break;
      case 'parcel':
        existingService.parcelLoadCapacity = formData.parcelLoadCapacity || existingService.parcelLoadCapacity;
        break;
      case 'vehicle_trailer':
        existingService.trailerType = formData.trailerType || existingService.trailerType;
        break;
      case 'furniture':
        existingService.furnitureDetails = formData.furnitureDetails || existingService.furnitureDetails;
        break;
      case 'animal':
        existingService.animalType = formData.animalType || existingService.animalType;
        break;
    }

    // Handle file upload
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