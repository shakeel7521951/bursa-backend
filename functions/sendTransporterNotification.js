import SendMail from "../utils/SendMail.js";

export const sendTransporterNotification = async (transporterEmail, order) => {
  const service = order?.serviceId || {};
  const customer = order?.customerId || {};

  const serviceCategory = order?.serviceCategory || "Not Provided";

  // Common Fields
  const customerName = customer?.name || "Customer Name Not Provided";
  const customerPhone = customer?.phone || "Phone Not Provided";
  const customerEmail = customer?.email || "Email Not Provided";

  const serviceName = service?.serviceName || "Not Provided";
  const from = service?.destinationFrom || "Not Provided";
  const to = service?.destinationTo || "Not Provided";
  const travelDate = service?.travelDate ? new Date(service.travelDate).toLocaleDateString() : "Not Provided";
  const pickupOption = service?.pickupOption === "yes" ? "Available" : "Not Available";

  const commonDetails = `
    <li><strong>Customer Name:</strong> ${customerName}</li>
    <li><strong>Customer Phone:</strong> ${customerPhone}</li>
    <li><strong>Customer Email:</strong> ${customerEmail}</li>
    <li><strong>Service Name:</strong> ${serviceName}</li>
    <li><strong>Category:</strong> ${serviceCategory}</li>
    <li><strong>From:</strong> ${from}</li>
    <li><strong>To:</strong> ${to}</li>
    <li><strong>Travel Date:</strong> ${travelDate}</li>
    <li><strong>Pickup Option:</strong> ${pickupOption}</li>
    <li><strong>Total Price:</strong> €${order.totalPrice}</li>
    <li><strong>Order Status:</strong> ${order.orderStatus}</li>
    <li><strong>Payment Status:</strong> ${order.paymentStatus}</li>
    <li><strong>Payment Method:</strong> ${order.paymentMethod || "Not Provided"}</li>
  `;

  // Add category-specific fields
  let categoryDetails = "";

  switch (serviceCategory) {
    case "passenger":
      categoryDetails += `
        <li><strong>Seats Booked:</strong> ${order.seatsBooked}</li>
        <li><strong>Luggage Quantity:</strong> ${order.luggageQuantity}</li>
      `;
      break;

    case "parcel":
      categoryDetails += `
        <li><strong>Parcel Quantity:</strong> ${order.parcelQuantity}</li>
        <li><strong>Parcel Weight:</strong> ${order.parcelWeight} kg</li>
      `;
      break;

    case "car_towing":
      categoryDetails += `
        <li><strong>Vehicle Details:</strong> ${order.vehicleDetails}</li>
        <li><strong>Towing Requirements:</strong> ${order.towingRequirements}</li>
      `;
      break;

    case "vehicle_trailer":
      categoryDetails += `
        <li><strong>Vehicle Type:</strong> ${order.vehicleType}</li>
        <li><strong>Trailer Requirements:</strong> ${order.trailerRequirements}</li>
      `;
      break;

    case "furniture":
      categoryDetails += `
        <li><strong>Furniture Item Count:</strong> ${order.furnitureItemCount}</li>
        <li><strong>Dimensions:</strong> ${order.furnitureDimensions}</li>
        <li><strong>Fragile Items:</strong> ${order.fragileItems ? "Yes" : "No"}</li>
      `;
      break;

    case "animal":
      categoryDetails += `
        <li><strong>Animal Count:</strong> ${order.animalCount}</li>
        <li><strong>Animal Type:</strong> ${order.animalType}</li>
        <li><strong>Special Needs:</strong> ${order.specialNeeds || "None"}</li>
        <li><strong>Cage Required:</strong> ${order.cageRequired ? "Yes" : "No"}</li>
      `;
      break;

    default:
      categoryDetails += `<li>No additional details available for this category.</li>`;
  }

  const notes = order?.notes ? `<p><strong>Additional Notes:</strong> ${order.notes}</p>` : "";

  const subject = `🚛 New Assignment: Transport Order for ${customerName}`;

  const text = `
    <p><strong>Dear Transporter,</strong></p>

    <p>You have been assigned a new transport order from <strong>Bursa Trans Romania Italy</strong>.</p>

    <h3 style="color: #007BFF;">🧾 Order Details:</h3>
    <ul>
      ${commonDetails}
      ${categoryDetails}
    </ul>

    ${notes}

    <p>📦 This order may include transporting passengers, parcels, vehicles, furniture, animals, or other goods.</p>

    <p>Please ensure timely pickup and delivery, and contact the customer if necessary.</p>

    <p>Regards,</p>
    <p><strong>Bursa Trans Romania Italy Team</strong></p>
  `;

  try {
    await SendMail(transporterEmail, subject, text);
  } catch (error) {
    throw new Error(
      `Failed to send transporter notification email: ${
        error?.response?.body || error.message
      }`
    );
  }
};

export default sendTransporterNotification;
