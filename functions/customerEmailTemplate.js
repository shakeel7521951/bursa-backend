import SendMail from "../utils/SendMail.js";

const sendOrderConfirmationEmail = async (
  customerEmail,
  customerName,
  orderDetails
) => {
  const {
    serviceId,
    serviceCategory,
    totalPrice,
    seatsBooked,
    luggageQuantity,
    parcelQuantity,
    parcelWeight,
    vehicleDetails,
    towingRequirements,
    vehicleType,
    trailerRequirements,
    furnitureItemCount,
    furnitureDimensions,
    fragileItems,
    animalCount,
    animalType,
    specialNeeds,
    cageRequired,
  } = orderDetails;

  const {
    serviceName = "Not Available",
    destinationFrom = "Not Available",
    destinationTo = "Not Available",
    travelDate,
    pickupOption = "Not Available",
  } = serviceId || {};

  const formattedDate = travelDate
    ? new Date(travelDate).toLocaleDateString()
    : "Not Available";

  const subject = "🚌 Your Transport Booking Confirmation - Bursa Trans Romania Italy";

  let extraDetails = "";

  switch (serviceCategory) {
    case "passenger":
      extraDetails = `
        <li><strong>Seats Booked:</strong> ${seatsBooked}</li>
        <li><strong>Luggage Quantity:</strong> ${luggageQuantity}</li>
      `;
      break;
    case "parcel":
      extraDetails = `
        <li><strong>Parcel Quantity:</strong> ${parcelQuantity}</li>
        <li><strong>Parcel Weight:</strong> ${parcelWeight} kg</li>
      `;
      break;
    case "car_towing":
      extraDetails = `
        <li><strong>Vehicle Details:</strong> ${vehicleDetails}</li>
        <li><strong>Towing Requirements:</strong> ${towingRequirements}</li>
      `;
      break;
    case "vehicle_trailer":
      extraDetails = `
        <li><strong>Vehicle Type:</strong> ${vehicleType}</li>
        <li><strong>Trailer Requirements:</strong> ${trailerRequirements}</li>
      `;
      break;
    case "furniture":
      extraDetails = `
        <li><strong>Furniture Item Count:</strong> ${furnitureItemCount}</li>
        <li><strong>Dimensions:</strong> ${furnitureDimensions}</li>
        <li><strong>Fragile Items:</strong> ${fragileItems ? "Yes" : "No"}</li>
      `;
      break;
    case "animal":
      extraDetails = `
        <li><strong>Animal Count:</strong> ${animalCount}</li>
        <li><strong>Animal Type:</strong> ${animalType}</li>
        <li><strong>Special Needs:</strong> ${specialNeeds || "None"}</li>
        <li><strong>Cage Required:</strong> ${cageRequired ? "Yes" : "No"}</li>
      `;
      break;
    default:
      extraDetails = "";
  }

  const text = `
    <p>Hello <strong>${customerName}</strong>,</p>

    <p>Thank you for booking with <strong>Bursa Trans Romania Italy</strong>. We specialize in safe and reliable transportation between Romania and Italy, offering services for <strong>passengers, luggage, furniture, animals, and more</strong>.</p>

    <h3 style="color: #4CAF50;">📦 Your Booking Details:</h3>
    <ul>
      <li><strong>Service Name:</strong> ${serviceName}</li>
      <li><strong>Service Type:</strong> ${serviceCategory}</li>
      <li><strong>From:</strong> ${destinationFrom}</li>
      <li><strong>To:</strong> ${destinationTo}</li>
      <li><strong>Travel Date:</strong> ${formattedDate}</li>
      <li><strong>Pickup Option:</strong> ${
        pickupOption === "yes" ? "Available" : "Not Available"
      }</li>
      ${extraDetails}
      <li><strong>Total Price:</strong> €${totalPrice}</li>
    </ul>

    <p>🚌 Our team will arrive at the pickup location as scheduled. If you have any updates or special requirements, please contact us in advance.</p>

    <p>We appreciate your trust in our services and look forward to serving your transport needs between Romania and Italy.</p>

    <p>Warm regards,</p>
    <p><strong>Bursa Trans Romania Italy</strong></p>
    <p>📧 support@bursatransromaniaitalia.com | 📞 +123-456-7890</p>
  `;

  try {
    await SendMail(customerEmail, subject, text);
  } catch (error) {
    throw new Error(
      `Failed to send confirmation email: ${error?.response?.body || error.message}`
    );
  }
};

export default sendOrderConfirmationEmail;
