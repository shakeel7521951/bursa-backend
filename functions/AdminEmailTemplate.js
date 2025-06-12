import SendMail from "../utils/SendMail.js";

const sendAdminOrderNotification = async (adminEmail, customerName, order) => {
  const service = order?.serviceId;

  const serviceCategory = order?.serviceCategory || "Not Available";
  const serviceName = service?.serviceName || "Not Available";
  const destinationFrom = service?.destinationFrom || "Not Available";
  const destinationTo = service?.destinationTo || "Not Available";
  const travelDate = service?.travelDate
    ? new Date(service.travelDate).toLocaleDateString()
    : "Not Available";
  const pickupOption = service?.pickupOption === "yes" ? "Yes" : "No";

  const subject = `🛎️ New Order - ${customerName} has booked a ${serviceCategory} transport`;

  let details = `
    <ul>
      <li><strong>Customer:</strong> ${customerName}</li>
      <li><strong>Category:</strong> ${serviceCategory}</li>
      <li><strong>Service:</strong> ${serviceName}</li>
      <li><strong>From:</strong> ${destinationFrom}</li>
      <li><strong>To:</strong> ${destinationTo}</li>
      <li><strong>Travel Date:</strong> ${travelDate}</li>
      <li><strong>Pickup Option:</strong> ${pickupOption}</li>
      <li><strong>Total Price:</strong> €${order.totalPrice}</li>
      <li><strong>Order Status:</strong> ${order.orderStatus}</li>
      <li><strong>Payment Status:</strong> ${order.paymentStatus}</li>
    </ul>
  `;

  // Add category-specific fields
  switch (serviceCategory) {
    case "passenger":
      details += `
        <ul>
          <li><strong>Seats Booked:</strong> ${order.seatsBooked}</li>
          <li><strong>Luggage Quantity:</strong> ${order.luggageQuantity}</li>
        </ul>
      `;
      break;

    case "parcel":
      details += `
        <ul>
          <li><strong>Parcel Quantity:</strong> ${order.parcelQuantity}</li>
          <li><strong>Parcel Weight:</strong> ${order.parcelWeight} kg</li>
        </ul>
      `;
      break;

    case "car_towing":
      details += `
        <ul>
          <li><strong>Vehicle Details:</strong> ${order.vehicleDetails}</li>
          <li><strong>Towing Requirements:</strong> ${order.towingRequirements}</li>
        </ul>
      `;
      break;

    case "vehicle_trailer":
      details += `
        <ul>
          <li><strong>Vehicle Type:</strong> ${order.vehicleType}</li>
          <li><strong>Trailer Requirements:</strong> ${order.trailerRequirements}</li>
        </ul>
      `;
      break;

    case "furniture":
      details += `
        <ul>
          <li><strong>Furniture Items:</strong> ${order.furnitureItemCount}</li>
          <li><strong>Dimensions:</strong> ${order.furnitureDimensions}</li>
          <li><strong>Fragile:</strong> ${order.fragileItems ? "Yes" : "No"}</li>
        </ul>
      `;
      break;

    case "animal":
      details += `
        <ul>
          <li><strong>Animal Count:</strong> ${order.animalCount}</li>
          <li><strong>Animal Type:</strong> ${order.animalType}</li>
          <li><strong>Special Needs:</strong> ${order.specialNeeds || "None"}</li>
          <li><strong>Cage Required:</strong> ${order.cageRequired ? "Yes" : "No"}</li>
        </ul>
      `;
      break;
  }

  if (order.notes) {
    details += `<p><strong>Notes:</strong> ${order.notes}</p>`;
  }

  const message = `
    <p>Hello Admin,</p>
    <p>A new order has been placed by <strong>${customerName}</strong>.</p>
    ${details}
    <p>Please review this booking in your admin panel.</p>
    <p>— Bursa Trans Romania Italy</p>
  `;

  try {
    await SendMail(adminEmail, subject, message);
  } catch (err) {
    console.error("Email send error:", err);
    throw new Error(`Email sending failed: ${err.message}`);
  }
};

export default sendAdminOrderNotification;