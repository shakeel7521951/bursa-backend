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

    // Validare autentificare și câmpuri necesare
    if (!transporterId) {
      return res.status(401).json({ message: "Utilizator neautorizat." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Imaginea serviciului este obligatorie!" });
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
        return res.status(400).json({ message: `${field} este obligatoriu.` });
      }
    }

    // Validare categorie serviciu
    const validCategories = [
      'passenger',
      'parcel',
      'car_towing',
      'vehicle_trailer',
      'furniture',
      'animal'
    ];

    if (!validCategories.includes(serviceCategory)) {
      return res.status(400).json({ message: "Categorie de serviciu invalidă." });
    }

    // Parsare orașe de pe rută
    let parsedRouteCities = [];
    if (typeof routeCities === 'string') {
      parsedRouteCities = routeCities.split(',').map(city => city.trim()).filter(Boolean);
    } else if (Array.isArray(routeCities)) {
      parsedRouteCities = routeCities.map(city => city?.trim()).filter(Boolean);
    }

    if (parsedRouteCities.length === 0) {
      return res.status(400).json({ message: "Este necesar cel puțin un oraș de pe rută." });
    }

    // Parsare zile de disponibilitate
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
        message: "Zilele de disponibilitate pentru România și Italia sunt obligatorii."
      });
    }

    // Validare date
    const travelDateObj = new Date(travelDate);
    const arrivalDateObj = new Date(arrivalDate);

    if (isNaN(travelDateObj.getTime()) || isNaN(arrivalDateObj.getTime())) {
      return res.status(400).json({ message: "Dată de plecare sau sosire invalidă." });
    }

    if (arrivalDateObj < travelDateObj) {
      return res.status(400).json({ 
        message: "Data sosirii trebuie să fie după data plecării." 
      });
    }

    // Validare câmpuri specifice categoriei
    const validationErrors = [];
    const priceNum = Number(price);

    if (isNaN(priceNum) || priceNum <= 0) {
      validationErrors.push("Prețul trebuie să fie un număr pozitiv.");
    }

    switch (serviceCategory) {
      case 'passenger':
        const seatsNum = Number(totalSeats);
        const availSeatsNum = Number(availableSeats);
        if (isNaN(seatsNum) || seatsNum <= 0) {
          validationErrors.push("Numărul total de locuri trebuie să fie mai mare decât 0.");
        }
        if (isNaN(availSeatsNum) || availSeatsNum < 0 || availSeatsNum > seatsNum) {
          validationErrors.push("Locurile disponibile trebuie să fie între 0 și totalul locurilor.");
        }
        break;

      case 'parcel':
        const capacity = Number(parcelLoadCapacity);
        if (isNaN(capacity) || capacity <= 0) {
          validationErrors.push("Capacitatea de încărcare a coletelor trebuie să fie mai mare decât 0.");
        }
        break;

      case 'car_towing':
        if (!vehicleType) {
          validationErrors.push("Tipul vehiculului este obligatoriu pentru tractare.");
        }
        break;

      case 'vehicle_trailer':
        if (!trailerType) {
          validationErrors.push("Tipul remorcii este obligatoriu pentru transport auto.");
        }
        break;

      case 'furniture':
        if (!furnitureDetails) {
          validationErrors.push("Detaliile mobilierului sunt obligatorii.");
        }
        break;

      case 'animal':
        if (!animalType) {
          validationErrors.push("Tipul animalului este obligatoriu.");
        }
        break;
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Erori de validare", 
        errors: validationErrors 
      });
    }

    // Structura serviciului
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

    // Câmpuri specifice categoriei
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

    // Salvare serviciu
    const newService = new Service(serviceData);
    await newService.save();

    // Răspuns
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
      message: "Serviciul a fost creat cu succes!",
      service: responseData
    });

  } catch (error) {
    console.error("Eroare la crearea serviciului:", error);
    return res.status(500).json({
      message: "Eroare internă a serverului",
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
        .json({ message: "Acces refuzat: utilizatorul nu este Transportator" });
    }

    const services = await Service.find({ transporter: transporterId });
    if (services.length === 0) {
      return res.status(200).json({ message: "Nu a fost găsit niciun serviciu!" });
    }
    return res.status(200).json({ services, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Eroare internă a serverului", error: error.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate("transporter", "name email");

    if (services.length === 0) {
      return res.status(200).json({ message: "Nu a fost găsit niciun serviciu!" });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error("Eroare în getAllServices:", error);
    res
      .status(500)
      .json({ message: "Eroare internă a serverului.", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: "Serviciul nu a fost găsit!" });
    }
    await Order.deleteMany({ serviceId: id });

    res.status(200).json({ message: "Serviciul și comenzile aferente au fost șterse cu succes" });
  } catch (error) {
    res.status(500).json({
      message: "Eroare internă a serverului! Vă rugăm să încercați din nou mai târziu",
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const formData = req.body;
    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: "Serviciul nu a fost găsit!" });
    }

    // Handle route cities (accept both array and comma-separated string)
    if (formData.routeCities) {
      const routeCitiesArray = Array.isArray(formData.routeCities)
        ? formData.routeCities
        : typeof formData.routeCities === 'string' 
          ? formData.routeCities.split(',').map(city => city.trim()).filter(Boolean)
          : [];
      
      if (routeCitiesArray.length === 0) {
        return res.status(400).json({ message: "Este necesar cel puțin un oraș de rută." });
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
        message: "Zilele de disponibilitate pentru România și Italia sunt obligatorii." 
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
      message: "Serviciul a fost actualizat cu succes!",
      service: updatedService,
    });
  } catch (error) {
    console.error("Eroare la actualizarea serviciului:", error);
    return res.status(500).json({
      message: "Eroare internă a serverului",
      error: error.message,
    });
  }
};
